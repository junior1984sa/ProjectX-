// ═══════════════════════════════════════════════════════════
// BUSCA DE EMPRESAS REAIS — Google Places API, via Edge Function
//
// Maior precisão de categoria que o OpenStreetMap, pois usa busca
// livre por texto (ex: "jateamento abrasivo em Florianópolis, SC")
// em vez de depender de tags fixas. Tem custo a partir de ~$275/mês
// acima da faixa gratuita — veja SUPABASE_SETUP.md para configurar.
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
 * Busca empresas reais via Google Places (Edge Function `buscar-empresas-google`).
 * Retorna null se a chave não estiver configurada, não houver resultados,
 * ou ocorrer qualquer erro de rede — nesses casos, quem chamou deve cair
 * para outra fonte de dados (OpenStreetMap ou exemplo simulado).
 */
export async function buscarEmpresasGoogle(
  params: ParametrosBusca
): Promise<Empresa[] | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  if (!supabaseUrl) return null

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/buscar-empresas-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cidade: params.cidade,
        estado: params.estado,
        raioKm: params.raioKm,
        segmento: params.segmento,
        quantidadeDesejada: params.quantidadeDesejada,
      }),
    })

    if (!resposta.ok) {
      console.error("Edge Function de busca Google respondeu com erro:", resposta.status)
      return null
    }

    const dados = await resposta.json()

    if (!dados.encontrado || !dados.empresas || dados.empresas.length === 0) {
      return null
    }

    const empresas: Empresa[] = (dados.empresas as EmpresaGoogleBruta[]).map((e) => ({
      id: gerarId(),
      nome: e.nome,
      segmento: params.segmento,
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

    return empresas
  } catch (erro) {
    console.error("Erro ao buscar empresas no Google Places:", erro)
    return null
  }
}
