import { create } from "zustand"
import { supabase } from "@/lib/supabase"

interface PromocaoState {
  ativa: boolean
  vagasUsadas: number
  vagasTotais: number
  carregando: boolean
  carregarStatus: () => Promise<void>
  reservarVaga: () => Promise<{ sucesso: boolean; vagasRestantes: number }>
}

/**
 * Controla o status da promoção de lançamento (ex: "100 primeiros
 * assinantes com 50% de desconto"). A contagem é compartilhada
 * globalmente entre todos os visitantes, então vem do banco — não
 * é algo que cada navegador guarda sozinho.
 */
export const usePromocaoStore = create<PromocaoState>((set, get) => ({
  ativa: false,
  vagasUsadas: 0,
  vagasTotais: 100,
  carregando: false,

  carregarStatus: async () => {
    set({ carregando: true })

    const { data, error } = await supabase
      .from("promocao_vagas")
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error) {
      console.error("Erro ao carregar status da promoção:", error.message)
      set({ carregando: false })
      return
    }

    if (data) {
      set({
        ativa: data.ativa,
        vagasUsadas: data.vagas_usadas,
        vagasTotais: data.vagas_totais,
        carregando: false,
      })
    } else {
      set({ carregando: false })
    }
  },

  reservarVaga: async () => {
    const { data, error } = await supabase.rpc("reservar_vaga_promocao")

    if (error) {
      console.error("Erro ao reservar vaga da promoção:", error.message)
      return { sucesso: false, vagasRestantes: 0 }
    }

    const resultado = data?.[0]
    if (!resultado) {
      return { sucesso: false, vagasRestantes: 0 }
    }

    if (resultado.sucesso) {
      await get().carregarStatus()
    }

    return { sucesso: resultado.sucesso, vagasRestantes: resultado.vagas_restantes }
  },
}))
