// ═══════════════════════════════════════════════════════════
// BUSCA DE EMPRESAS REAIS — Google Places API, via Edge Function
//
// Maior precisão de categoria que o OpenStreetMap, pois usa busca
// livre por texto (ex: "jateamento abrasivo em Florianópolis, SC")
// em vez de depender de tags fixas. Tem custo a partir de ~$275/mês
// acima da faixa gratuita — veja SUPABASE_SETUP.md para configurar.
//
// Suporta dois modos de busca (ver ParametrosBusca.segmentosBusca):
// - "direta": busca pelo próprio segmento do prestador
// - "clientes": busca por múltiplos segmentos-clientes em paralelo,
//   distribuindo a quantidade desejada entre eles e combinando os
//   resultados — é a prospecção de verdade, voltada a gerar leads.
// ═══════════════════════════════════════════════════════════

import type { Empresa, ParametrosBusca } from "@/types/empresa"
import { gerarId } from "@/lib/utils"

interface EmpresaGoogleBruta {
  nome: string
  endereco: string
  bairro: string
  telefone: string | null
  website: string | null
  avaliacaoGoogle: number | null
  totalAvaliacoes: number
  latitude: number | null
  longitude: number | null
  score: number
}

/**
 * Executa uma única busca por um termo específico via a Edge Function.
 */
async function buscarPorTermo(
  termoBusca: string,
  params: ParametrosBusca,
  quantidade: number
): Promise<Empresa[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  if (!supabaseUrl) return []

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/buscar-empresas-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cidade: params.cidade,
        estado: params.estado,
        raioKm: params.raioKm,
        segmento: termoBusca,
        quantidadeDesejada: quantidade,
        pais: params.pais ?? "BR",
        bairro: params.bairro || undefined,
      }),
    })

    if (!resposta.ok) {
      console.error("Edge Function de busca Google respondeu com erro:", resposta.status)
      return []
    }

    const dados = await resposta.json()

    if (!dados.encontrado || !dados.empresas || dados.empresas.length === 0) {
      return []
    }

    return (dados.empresas as EmpresaGoogleBruta[]).map((e) => ({
      id: gerarId(),
      nome: e.nome,
      segmento: termoBusca,
      endereco: e.endereco,
      bairro: e.bairro,
      cidade: params.cidade,
      estado: params.estado,
      cep: "",
      telefone: e.telefone,
      email: null,
      website: e.website,
      instagram: null,
      facebook: null,
      avaliacaoGoogle: e.avaliacaoGoogle,
      totalAvaliacoes: e.totalAvaliacoes,
      score: e.score,
      latitude: e.latitude ?? 0,
      longitude: e.longitude ?? 0,
      favorita: false,
      criadaEm: new Date(),
    }))
  } catch (erro) {
    console.error("Erro ao buscar empresas no Google Places:", erro)
    return []
  }
}

/**
 * Busca empresas reais via Google Places. Se `params.segmentosBusca`
 * tiver múltiplos termos (modo "clientes potenciais"), distribui a
 * quantidade desejada entre eles e busca em paralelo, combinando os
 * resultados. Caso contrário, busca só pelo `params.segmento` (modo
 * "direta", comportamento original).
 *
 * Retorna null se nenhuma busca encontrar nada — nesse caso, quem
 * chamou deve cair para outra fonte de dados.
 */
export async function buscarEmpresasGoogle(
  params: ParametrosBusca
): Promise<Empresa[] | null> {
  const termos = params.segmentosBusca && params.segmentosBusca.length > 0
    ? params.segmentosBusca
    : [params.segmento]

  const quantidadePorTermo = Math.ceil(params.quantidadeDesejada / termos.length)

  const resultadosPorTermo = await Promise.all(
    termos.map((termo) => buscarPorTermo(termo, params, quantidadePorTermo))
  )

  const empresas = resultadosPorTermo.flat().slice(0, params.quantidadeDesejada)

  return empresas.length > 0 ? empresas : null
}
