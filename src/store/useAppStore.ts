import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  AppState,
  Empresa,
  ParametrosBusca,
  BuscaSalva,
  Filtros,
} from "@/types/empresa"
import { gerarEmpresasMock } from "@/lib/dadosMock"
import { buscarEmpresasReais } from "@/lib/dadosReais"
import { gerarId } from "@/lib/utils"

// Filtros padrão iniciais
const FILTROS_PADRAO: Filtros = {
  scoreMinimo: 0,
  temTelefone: false,
  temEmail: false,
  temWebsite: false,
  temRedesSociais: false,
  textoBusca: "",
}

/**
 * Aplica filtros localmente sobre o array de empresas
 */
function filtrarEmpresas(empresas: Empresa[], filtros: Filtros): Empresa[] {
  return empresas.filter((empresa) => {
    // Filtro de score mínimo
    if (empresa.score < filtros.scoreMinimo) return false

    // Filtros de canais de contato (AND - todos os marcados devem ser verdadeiros)
    if (filtros.temTelefone && !empresa.telefone) return false
    if (filtros.temEmail && !empresa.email) return false
    if (filtros.temWebsite && !empresa.website) return false
    if (filtros.temRedesSociais && !empresa.instagram && !empresa.facebook) return false

    // Busca textual (nome, bairro, cidade)
    if (filtros.textoBusca.trim()) {
      const texto = filtros.textoBusca.toLowerCase()
      const camposBusca = [
        empresa.nome,
        empresa.bairro,
        empresa.cidade,
        empresa.telefone || "",
        empresa.email || "",
      ]
        .join(" ")
        .toLowerCase()
      if (!camposBusca.includes(texto)) return false
    }

    return true
  })
}

/**
 * Store global do WhoHiresYou usando Zustand com persistência
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ══ Estado inicial ══
      empresas: [],
      empresasFiltradas: [],
      buscaAtual: null,
      historicoBuscas: [],
      favoritos: [],
      carregando: false,
      erroAtual: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      fonteDados: "openstreetmap" as const,
      filtros: FILTROS_PADRAO,

      // ══ Ações ══

      /**
       * Realiza uma busca de empresas com os parâmetros fornecidos
       */
      buscarEmpresas: async (params: ParametrosBusca) => {
        set({ carregando: true, erroAtual: null, paginaAtual: 1 })

        try {
          // Cascata de fontes de dados, da mais precisa para a mais simples:
          // 1. OpenStreetMap (gratuito, cobertura irregular fora do varejo)
          // 2. Exemplo simulado (sempre disponível, identificado na UI)
          //
          // O Google Places FOI REMOVIDO desta cascata, e não pode voltar.
          // Os termos da plataforma proíbem armazenar nome, endereço e
          // telefone dos estabelecimentos retornados — que é exatamente
          // o que um produto de prospecção faz e vende. A precisão era
          // melhor, mas construir a base sobre uma fonte que proíbe o
          // nosso caso de uso é construir sobre algo que pode ser
          // desligado a qualquer momento, com o produto já vendido.
          let empresas = await buscarEmpresasReais(params)
          let fonteDados: "openstreetmap" | "simulado" = "openstreetmap"

          // O exemplo simulado é SÓ para a demonstração de visitante, que
          // não gastou crédito. Para quem pagou, busca vazia devolve
          // vazio: o crédito já foi debitado antes desta chamada, e
          // preencher o vazio com empresas inventadas faz o assinante
          // pagar por telefone e e-mail que não existem. O selo de
          // "exemplo simulado" na tela não conserta isso — ele aparece
          // depois que o crédito já saiu, e o dado exportado não carrega
          // o selo junto.
          if (!empresas || empresas.length === 0) {
            if (params.permitirSimulado) {
              empresas = await gerarEmpresasMock(params)
              fonteDados = "simulado"
            } else {
              empresas = []
            }
          }

          // Aplica os favoritos salvos anteriormente
          const { favoritos } = get()
          const empresasComFavoritos = empresas.map((e) => ({
            ...e,
            favorita: favoritos.includes(e.id),
          }))

          // Aplica filtros atuais
          const { filtros } = get()
          const filtradas = filtrarEmpresas(empresasComFavoritos, filtros)

          set({
            empresas: empresasComFavoritos,
            empresasFiltradas: filtradas,
            buscaAtual: params,
            carregando: false,
            fonteDados,
          })

          // Salva no histórico de buscas (máx. 5)
          const novaBusca: BuscaSalva = {
            id: gerarId(),
            segmento: params.segmento,
            cidade: params.cidade,
            estado: params.estado,
            raioKm: params.raioKm,
            totalResultados: empresas.length,
            timestamp: new Date(),
          }

          set((state) => ({
            historicoBuscas: [novaBusca, ...state.historicoBuscas].slice(0, 5),
          }))
        } catch (erro) {
          const mensagem =
            erro instanceof Error
              ? erro.message
              : "Erro desconhecido ao buscar empresas."
          set({ carregando: false, erroAtual: mensagem })
        }
      },

      /**
       * Aplica filtros parciais e recalcula empresas filtradas
       */
      aplicarFiltros: (novosFiltros: Partial<Filtros>) => {
        const { empresas, filtros } = get()
        const filtrosAtualizados = { ...filtros, ...novosFiltros }
        const filtradas = filtrarEmpresas(empresas, filtrosAtualizados)

        set({
          filtros: filtrosAtualizados,
          empresasFiltradas: filtradas,
          paginaAtual: 1,
        })
      },

      /**
       * Adiciona ou remove empresa dos favoritos
       */
      alternarFavorito: (empresaId: string) => {
        const { favoritos, empresas } = get()
        const jaFavorito = favoritos.includes(empresaId)
        const novosFavoritos = jaFavorito
          ? favoritos.filter((id) => id !== empresaId)
          : [...favoritos, empresaId]

        // Atualiza o array de empresas
        const empresasAtualizadas = empresas.map((e) =>
          e.id === empresaId ? { ...e, favorita: !jaFavorito } : e
        )

        // Recalcula filtradas também
        const { filtros } = get()
        const filtradas = filtrarEmpresas(empresasAtualizadas, filtros)

        set({
          favoritos: novosFavoritos,
          empresas: empresasAtualizadas,
          empresasFiltradas: filtradas,
        })
      },

      /**
       * Remove uma busca salva do histórico
       */
      removerBuscaSalva: (buscaId: string) => {
        set((state) => ({
          historicoBuscas: state.historicoBuscas.filter((b) => b.id !== buscaId),
        }))
      },

      /**
       * Limpa os resultados atuais e volta para o formulário
       */
      limparResultados: () => {
        set({
          empresas: [],
          empresasFiltradas: [],
          buscaAtual: null,
          erroAtual: null,
          filtros: FILTROS_PADRAO,
          paginaAtual: 1,
        })
      },

      /**
       * Navega para uma página específica da tabela
       */
      setPagina: (pagina: number) => {
        set({ paginaAtual: pagina })
      },
    }),
    {
      name: "prospectpro-storage",
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas histórico e favoritos (não os resultados em si)
      partialize: (state) => ({
        historicoBuscas: state.historicoBuscas,
        favoritos: state.favoritos,
      }),
    }
  )
)
