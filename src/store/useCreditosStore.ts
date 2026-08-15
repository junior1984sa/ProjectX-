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
