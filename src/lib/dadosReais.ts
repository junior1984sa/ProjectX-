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
// ═══════════════════════════════════════════════════════════

import type { Empresa, ParametrosBusca } from "@/types/empresa"
import { gerarId } from "@/lib/utils"

interface ElementoOSM {
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

/**
 * Calcula o score de uma empresa com base nos dados reais disponíveis.
 */
function calcularScoreReal(tags: Record<string, string>): number {
  let score = 0
  if (tags.phone || tags["contact:phone"]) score += 1
  if (tags.email || tags["contact:email"]) score += 1
  if (tags.website || tags["contact:website"]) score += 1
  if (tags["contact:facebook"] || tags["contact:instagram"]) score += 0.5
  return Math.min(5, Math.round(score * 10) / 10)
}

/**
 * Converte um elemento retornado pela Edge Function em uma Empresa
 * no formato interno do app.
 */
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
 * Busca empresas reais via a Edge Function `buscar-empresas-osm`.
 * Retorna null se a cidade não for localizada ou se nenhum
 * estabelecimento for encontrado — nesse caso, quem chamou esta
 * função deve decidir se cai no gerador de dados de exemplo.
 */
export async function buscarEmpresasReais(
  params: ParametrosBusca
): Promise<Empresa[] | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  if (!supabaseUrl) {
    console.warn("VITE_SUPABASE_URL não configurada — não é possível buscar dados reais.")
    return null
  }

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/buscar-empresas-osm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cidade: params.cidade,
        estado: params.estado,
        raioKm: params.raioKm,
        segmento: params.segmento,
      }),
    })

    if (!resposta.ok) {
      console.error("Edge Function de busca OSM respondeu com erro:", resposta.status)
      return null
    }

    const dados = await resposta.json()

    if (!dados.encontrado || !dados.elementos || dados.elementos.length === 0) {
      return null
    }

    const empresas = (dados.elementos as ElementoOSM[])
      .map((el) => converterParaEmpresa(el, params.segmento, params.cidade, params.estado))
      .filter((e): e is Empresa => e !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, params.quantidadeDesejada)

    return empresas.length > 0 ? empresas : null
  } catch (erro) {
    console.error("Erro ao buscar empresas reais:", erro)
    return null
  }
}
