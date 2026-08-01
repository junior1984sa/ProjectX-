import { supabase } from "@/lib/supabase"

// ═══════════════════════════════════════════════════════════
// TIPOS DO PAINEL ADMINISTRATIVO
// Espelham o retorno da função SQL painel_administrativo()
// ═══════════════════════════════════════════════════════════

export interface MetricasAssociados {
  total: number
  ativos: number
  em_trial: number
  em_atraso: number
  cancelados: number
  pendentes: number
  novos_30_dias: number
}

export interface MetricasFinanceiras {
  receita_mensal: number
  custo_mensal: number
  lucro_mensal: number
  margem_pct: number
  receita_anual_projetada: number
  custos_unicos_total: number
  ponto_equilibrio_assinantes: number | null
}

export interface DistribuicaoPlano {
  plano: string
  quantidade: number
  receita_total: number
}

export interface CustoPorCategoria {
  categoria: string
  total_mensal: number
}

export interface MetricasUso {
  buscas_30_dias: number
  creditos_consumidos_30_dias: number
  perfis_publicados_diretorio: number
}

export interface PainelAdministrativo {
  associados: MetricasAssociados
  financeiro: MetricasFinanceiras
  planos: DistribuicaoPlano[]
  custos_por_categoria: CustoPorCategoria[]
  uso: MetricasUso
}

export interface Associado {
  id: string
  nome_empresa: string
  email_contato: string
  cidade: string
  estado: string
  segmento: string
  status_assinatura: string
  plano: string | null
  valor: number | null
  criado_em: string
  creditos_disponiveis: number | null
}

export type CategoriaCusto =
  | "infraestrutura"
  | "api"
  | "marketing"
  | "lojas_apps"
  | "dominio"
  | "ferramentas"
  | "pessoal"
  | "impostos"
  | "outros"

export type Recorrencia = "mensal" | "anual" | "unico"

export interface CustoOperacional {
  id: string
  categoria: CategoriaCusto
  descricao: string
  valor: number
  moeda: "BRL" | "USD" | "EUR"
  recorrencia: Recorrencia
  data_referencia: string
  ativo: boolean
  observacao: string | null
}

/** Rótulos legíveis para exibir na interface */
export const ROTULOS_CATEGORIA: Record<CategoriaCusto, string> = {
  infraestrutura: "Infraestrutura",
  api: "APIs e dados",
  marketing: "Marketing e anúncios",
  lojas_apps: "Lojas de aplicativos",
  dominio: "Domínio",
  ferramentas: "Ferramentas",
  pessoal: "Pessoal",
  impostos: "Impostos",
  outros: "Outros",
}

export const ROTULOS_RECORRENCIA: Record<Recorrencia, string> = {
  mensal: "Mensal",
  anual: "Anual",
  unico: "Pagamento único",
}

// ═══════════════════════════════════════════════════════════
// ACESSO A DADOS
// ═══════════════════════════════════════════════════════════

/**
 * Verifica se o usuário logado tem acesso administrativo.
 * A checagem real acontece no banco (RLS + funções); isso aqui
 * serve apenas para decidir o que mostrar na interface.
 */
export async function verificarSeEhAdmin(): Promise<boolean> {
  const { data: sessao } = await supabase.auth.getSession()
  const usuarioId = sessao.session?.user.id
  if (!usuarioId) return false

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", usuarioId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao verificar permissão de admin:", error.message)
    return false
  }

  return data?.is_admin === true
}

export async function carregarPainel(): Promise<PainelAdministrativo | null> {
  const { data, error } = await supabase.rpc("painel_administrativo")

  if (error) {
    console.error("Erro ao carregar painel administrativo:", error.message)
    return null
  }

  return data as PainelAdministrativo
}

export async function listarAssociados(): Promise<Associado[]> {
  const { data, error } = await supabase.rpc("listar_associados")

  if (error) {
    console.error("Erro ao listar associados:", error.message)
    return []
  }

  return (data ?? []) as Associado[]
}

export async function listarCustos(): Promise<CustoOperacional[]> {
  const { data, error } = await supabase
    .from("custos_operacionais")
    .select("*")
    .order("categoria", { ascending: true })

  if (error) {
    console.error("Erro ao listar custos:", error.message)
    return []
  }

  return (data ?? []) as CustoOperacional[]
}

export async function salvarCusto(
  custo: Omit<CustoOperacional, "id"> & { id?: string }
): Promise<{ erro: string | null }> {
  const payload = {
    categoria: custo.categoria,
    descricao: custo.descricao,
    valor: custo.valor,
    moeda: custo.moeda,
    recorrencia: custo.recorrencia,
    data_referencia: custo.data_referencia,
    ativo: custo.ativo,
    observacao: custo.observacao,
  }

  if (custo.id) {
    const { error } = await supabase
      .from("custos_operacionais")
      .update(payload)
      .eq("id", custo.id)
    return { erro: error?.message ?? null }
  }

  const { error } = await supabase.from("custos_operacionais").insert(payload)
  return { erro: error?.message ?? null }
}

export async function alternarCustoAtivo(
  id: string,
  ativo: boolean
): Promise<{ erro: string | null }> {
  const { error } = await supabase
    .from("custos_operacionais")
    .update({ ativo })
    .eq("id", id)

  return { erro: error?.message ?? null }
}

export async function removerCusto(id: string): Promise<{ erro: string | null }> {
  const { error } = await supabase.from("custos_operacionais").delete().eq("id", id)
  return { erro: error?.message ?? null }
}

export async function carregarCotacaoDolar(): Promise<number> {
  const { data, error } = await supabase
    .from("configuracao_financeira")
    .select("cotacao_dolar")
    .eq("id", 1)
    .maybeSingle()

  if (error || !data) return 5.5
  return Number(data.cotacao_dolar)
}

export async function salvarCotacaoDolar(cotacao: number): Promise<{ erro: string | null }> {
  const { error } = await supabase
    .from("configuracao_financeira")
    .update({ cotacao_dolar: cotacao, atualizado_em: new Date().toISOString() })
    .eq("id", 1)

  return { erro: error?.message ?? null }
}

/** Formata um valor em reais para exibição */
export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}
