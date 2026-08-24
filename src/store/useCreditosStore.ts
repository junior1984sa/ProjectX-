import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { CreditosUsuario, HistoricoBusca } from "@/types/prestador"

/**
 * `motivo` distingue as duas recusas possíveis, que exigem mensagens
 * opostas: "sem_creditos" pede recarga ou upgrade; "limite_diario"
 * significa que o saldo existe, mas o teto do dia foi atingido — e o
 * cliente só precisa voltar amanhã.
 */
export type MotivoConsumo =
  | "ok"
  | "sem_creditos"
  | "limite_diario"
  /** Assinante de fora do Brasil tentando buscar empresa brasileira.
   *  Quebraria o requisito de "resultado verificado no exterior" da
   *  tese de exportação de serviço — e reclassificaria a receita. */
  | "restricao_exportacao"
  /** A busca rodou, mas nenhuma empresa veio com contato. Não custou nada. */
  | "nada_entregue"

interface ResultadoConsumo {
  sucesso: boolean
  creditos_restantes: number
  custo: number
  motivo: MotivoConsumo
}

interface CreditosState {
  creditos: CreditosUsuario | null
  historico: HistoricoBusca[]
  carregando: boolean

  carregarCreditos: () => Promise<void>
  carregarHistorico: () => Promise<void>
  /**
   * Pergunta se o assinante pode buscar, SEM debitar nada.
   * Roda antes da busca: não adianta consultar a fonte se o país é
   * proibido ou se o teto do dia já estourou.
   */
  podeBuscar: (pais: string) => Promise<{
    pode: boolean
    motivo: MotivoConsumo
    /** Nome propositalmente diferente do da coluna da tabela: dentro
     *  da função em plpgsql, um parâmetro de saída chamado igual à
     *  coluna torna toda leitura ambígua, e o Postgres só reclama na
     *  execução — a migration aplica sem erro e quebra no primeiro uso. */
    saldo_creditos: number
    restante_hoje: number
  }>
  /**
   * Debita um crédito por CONTATO ENTREGUE, depois da busca.
   * Entrega zero não custa nada — é o ponto inteiro da mudança.
   */
  cobrarPelaEntrega: (params: {
    contatosEntregues: number
    segmento: string
    cidade: string
    estado: string
    raioKm: number
    pais: string
  }) => Promise<{ cobrados: number; saldo_creditos: number; motivo: MotivoConsumo }>
  consumirCreditos: (params: {
    quantidadeEmpresas: number
    segmento: string
    cidade: string
    estado: string
    raioKm: number
    /** País onde a busca acontece. O banco recusa assinante de fora
     *  do Brasil buscando empresa brasileira — requisito da tese de
     *  exportação de serviço. */
    pais: string
  }) => Promise<ResultadoConsumo>
}

export const useCreditosStore = create<CreditosState>((set, get) => ({
  creditos: null,
  historico: [],
  carregando: false,

  carregarCreditos: async () => {
    const { data: sessao } = await supabase.auth.getSession()
    const usuarioId = sessao.session?.user.id
    if (!usuarioId) return

    set({ carregando: true })

    const { data, error } = await supabase
      .from("creditos_usuario")
      .select("*")
      .eq("id", usuarioId)
      .maybeSingle()

    if (error) {
      console.error("Erro ao carregar créditos:", error.message)
    }

    set({ creditos: data as CreditosUsuario | null, carregando: false })
  },

  carregarHistorico: async () => {
    const { data: sessao } = await supabase.auth.getSession()
    const usuarioId = sessao.session?.user.id
    if (!usuarioId) return

    const { data, error } = await supabase
      .from("historico_buscas")
      .select("*")
      .eq("profile_id", usuarioId)
      .order("criado_em", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Erro ao carregar histórico:", error.message)
      return
    }

    set({ historico: data as HistoricoBusca[] })
  },

  podeBuscar: async (pais) => {
    const { data: sessao } = await supabase.auth.getSession()
    const usuarioId = sessao.session?.user.id
    if (!usuarioId) {
      return { pode: false, motivo: "sem_creditos" as const, saldo_creditos: 0, restante_hoje: 0 }
    }

    const { data, error } = await supabase.rpc("pode_buscar", {
      p_profile_id: usuarioId,
      p_pais: pais,
    })

    if (error) {
      console.error("Erro ao verificar se pode buscar:", error.message)
      return { pode: false, motivo: "sem_creditos" as const, saldo_creditos: 0, restante_hoje: 0 }
    }

    const r = data?.[0] as
      | { pode: boolean; motivo: MotivoConsumo; saldo_creditos: number; restante_hoje: number }
      | undefined

    return r ?? { pode: false, motivo: "sem_creditos" as const, saldo_creditos: 0, restante_hoje: 0 }
  },

  cobrarPelaEntrega: async ({ contatosEntregues, segmento, cidade, estado, raioKm, pais }) => {
    const { data: sessao } = await supabase.auth.getSession()
    const usuarioId = sessao.session?.user.id
    if (!usuarioId) {
      return { cobrados: 0, saldo_creditos: 0, motivo: "sem_creditos" as const }
    }

    const { data, error } = await supabase.rpc("consumir_creditos_por_entrega", {
      p_profile_id: usuarioId,
      p_contatos_entregues: contatosEntregues,
      p_segmento: segmento,
      p_cidade: cidade,
      p_estado: estado,
      p_raio_km: raioKm,
      p_pais: pais,
    })

    if (error) {
      // Falha ao cobrar NÃO desfaz a entrega: o cliente já recebeu os
      // contatos. Registramos o erro e seguimos — cobrar de novo depois
      // seria pior que perder esta cobrança.
      console.error("Erro ao cobrar pela entrega:", error.message)
      return { cobrados: 0, saldo_creditos: 0, motivo: "sem_creditos" as const }
    }

    const r = data?.[0] as
      | { cobrados: number; saldo_creditos: number; motivo: MotivoConsumo }
      | undefined

    if (r && r.cobrados > 0) {
      const { creditos } = get()
      if (creditos) {
        set({ creditos: { ...creditos, creditos_disponiveis: r.saldo_creditos } })
      }
    }

    return r ?? { cobrados: 0, saldo_creditos: 0, motivo: "sem_creditos" as const }
  },

  consumirCreditos: async ({ quantidadeEmpresas, segmento, cidade, estado, raioKm, pais }) => {
    const { data: sessao } = await supabase.auth.getSession()
    const usuarioId = sessao.session?.user.id

    if (!usuarioId) {
      return { sucesso: false, creditos_restantes: 0, custo: 0, motivo: "sem_creditos" }
    }

    const { data, error } = await supabase.rpc("consumir_creditos", {
      p_profile_id: usuarioId,
      p_quantidade_empresas: quantidadeEmpresas,
      p_segmento: segmento,
      p_cidade: cidade,
      p_estado: estado,
      p_raio_km: raioKm,
      p_pais: pais,
    })

    if (error) {
      console.error("Erro ao consumir créditos:", error.message)
      return { sucesso: false, creditos_restantes: 0, custo: 0, motivo: "sem_creditos" }
    }

    const resultado = data?.[0] as ResultadoConsumo | undefined
    if (!resultado) {
      return { sucesso: false, creditos_restantes: 0, custo: 0, motivo: "sem_creditos" }
    }

    if (resultado.sucesso) {
      const { creditos } = get()
      if (creditos) {
        set({ creditos: { ...creditos, creditos_disponiveis: resultado.creditos_restantes } })
      } else {
        await get().carregarCreditos()
      }
    }

    return resultado
  },
}))
