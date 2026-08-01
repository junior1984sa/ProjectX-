// ═══════════════════════════════════════════════════════════
// BUSCA DE EMPRESAS REAIS — OpenStreetMap, via Edge Function
//
// A chamada para Nominatim/Overpass acontece dentro da Edge Function
// `buscar-empresas-osm` (Supabase), não direto do navegador — a
// Overpass API bloqueia chamadas de navegador por política de CORS,
// então o servidor faz essa ponte.
//
// Limitação conhecida: a cobertura de telefone/e-mail no OpenStreetMap
// depende de quem cadastrou aquele estabelecimento no mapa colaborativo.
// Em muitas cidades brasileiras, isso é mais escasso que no Google Places.
//
// Suporta dois modos de busca (ver ParametrosBusca.segmentosBusca):
// - "direta": busca pelo próprio segmento do prestador
// - "clientes": busca por múltiplos segmentos-clientes em paralelo,
//   distribuindo a quantidade desejada entre eles e combinando os
//   resultados.
// ═══════════════════════════════════════════════════════════

import type { Empresa, ParametrosBusca } from "@/types/empresa"
import { gerarId } from "@/lib/utils"

interface ElementoOSM {
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

function calcularScoreReal(tags: Record<string, string>): number {
  let score = 0
  if (tags.phone || tags["contact:phone"]) score += 1
  if (tags.email || tags["contact:email"]) score += 1
  if (tags.website || tags["contact:website"]) score += 1
  if (tags["contact:facebook"] || tags["contact:instagram"]) score += 0.5
  return Math.min(5, Math.round(score * 10) / 10)
}

function converterParaEmpresa(
  elemento: ElementoOSM,
  segmento: string,
  cidade: string,
  estado: string
): Empresa | null {
  const tags = elemento.tags ?? {}
  const nome = tags.name
  if (!nome) return null

  const lat = elemento.lat ?? elemento.center?.lat
  const lng = elemento.lon ?? elemento.center?.lon
  if (!lat || !lng) return null

  const telefone = tags.phone ?? tags["contact:phone"] ?? null
  const email = tags.email ?? tags["contact:email"] ?? null
  const website = tags.website ?? tags["contact:website"] ?? null
  const instagram = tags["contact:instagram"] ?? null
  const facebook = tags["contact:facebook"] ?? null

  const bairro = tags["addr:suburb"] ?? tags["addr:neighbourhood"] ?? cidade
  const rua = tags["addr:street"] ?? ""
  const numero = tags["addr:housenumber"] ?? ""
  const endereco = rua ? `${rua}${numero ? ", " + numero : ""}` : "Endereço não informado"

  return {
    id: gerarId(),
    nome,
    segmento,
    endereco,
    bairro,
    cidade,
    estado,
    cep: tags["addr:postcode"] ?? "",
    telefone,
    email,
    website,
    instagram,
    facebook,
    avaliacaoGoogle: null,
    totalAvaliacoes: 0,
    score: calcularScoreReal(tags),
    latitude: lat,
    longitude: lng,
    favorita: false,
    criadaEm: new Date(),
  }
}

/**
 * Executa uma única busca por um termo específico via a Edge Function.
 */
async function buscarPorTermo(
  termoBusca: string,
  params: ParametrosBusca,
  quantidade: number,
  supabaseUrl: string
): Promise<Empresa[]> {
  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/buscar-empresas-osm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cidade: params.cidade,
        estado: params.estado,
        raioKm: params.raioKm,
        segmento: termoBusca,
      }),
    })

    if (!resposta.ok) {
      console.error("Edge Function de busca OSM respondeu com erro:", resposta.status)
      return []
    }

    const dados = await resposta.json()

    if (!dados.encontrado || !dados.elementos || dados.elementos.length === 0) {
      return []
    }

    return (dados.elementos as ElementoOSM[])
      .map((el) => converterParaEmpresa(el, termoBusca, params.cidade, params.estado))
      .filter((e): e is Empresa => e !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, quantidade)
  } catch (erro) {
    console.error("Erro ao buscar empresas reais:", erro)
    return []
  }
}

/**
 * Busca empresas reais via OpenStreetMap. Se `params.segmentosBusca`
 * tiver múltiplos termos (modo "clientes potenciais"), distribui a
 * quantidade desejada entre eles e busca em paralelo. Caso contrário,
 * busca só pelo `params.segmento` (modo "direta").
 *
 * Retorna null se a cidade não for localizada ou se nenhuma busca
 * encontrar nada — nesse caso, quem chamou deve cair no gerador de
 * dados de exemplo.
 */
export async function buscarEmpresasReais(
  params: ParametrosBusca
): Promise<Empresa[] | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  if (!supabaseUrl) {
    console.warn("VITE_SUPABASE_URL não configurada — não é possível buscar dados reais.")
    return null
  }

  const termos = params.segmentosBusca && params.segmentosBusca.length > 0
    ? params.segmentosBusca
    : [params.segmento]

  const quantidadePorTermo = Math.ceil(params.quantidadeDesejada / termos.length)

  const resultadosPorTermo = await Promise.all(
    termos.map((termo) => buscarPorTermo(termo, params, quantidadePorTermo, supabaseUrl))
  )

  const empresas = resultadosPorTermo.flat().slice(0, params.quantidadeDesejada)

  return empresas.length > 0 ? empresas : null
}
