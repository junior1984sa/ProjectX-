// Tipos e interfaces do ProspectX

/**
 * Representa uma empresa encontrada na prospecção
 */
export interface Empresa {
  id: string
  nome: string
  segmento: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  telefone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  avaliacaoGoogle: number | null
  totalAvaliacoes: number
  score: number
  latitude: number
  longitude: number
  favorita: boolean
  criadaEm: Date
}

/**
 * Canais de contato disponíveis na empresa
 */
export interface CanaisContato {
  telefone: boolean
  email: boolean
  website: boolean
  redesSociais: boolean
}

/**
 * Parâmetros de uma busca
 */
export interface ParametrosBusca {
  segmento: string
  cidade: string
  estado: string
  raioKm: number
  quantidadeDesejada: number
  timestamp: Date
}

/**
 * Busca salva no histórico
 */
export interface BuscaSalva {
  id: string
  segmento: string
  cidade: string
  estado: string
  raioKm: number
  totalResultados: number
  timestamp: Date
}

/**
 * Filtros aplicados na tabela e mapa
 */
export interface Filtros {
  scoreMinimo: number
  temTelefone: boolean
  temEmail: boolean
  temWebsite: boolean
  temRedesSociais: boolean
  textoBusca: string
}

/**
 * Estado global do Zustand
 */
export interface AppState {
  // Dados
  empresas: Empresa[]
  empresasFiltradas: Empresa[]
  buscaAtual: ParametrosBusca | null
  historicoBuscas: BuscaSalva[]
  favoritos: string[]

  // UI
  carregando: boolean
  erroAtual: string | null
  paginaAtual: number
  itensPorPagina: number
  /** true se a última busca trouxe dados reais (OpenStreetMap); false se caiu no exemplo simulado */
  usandoDadosReais: boolean

  // Filtros
  filtros: Filtros

  // Ações
  buscarEmpresas: (params: ParametrosBusca) => Promise<void>
  aplicarFiltros: (filtros: Partial<Filtros>) => void
  alternarFavorito: (empresaId: string) => void
  removerBuscaSalva: (buscaId: string) => void
  limparResultados: () => void
  setPagina: (pagina: number) => void
}

/**
 * Estatísticas calculadas das empresas
 */
export interface Estatisticas {
  total: number
  comTelefone: number
  comEmail: number
  scoreMedia: number
  porBairro: Record<string, number>
  porCanal: {
    telefone: number
    email: number
    website: number
    redesSociais: number
  }
}

/**
 * Dados para o gráfico de canais
 */
export interface DadoGrafico {
  nome: string
  valor: number
  cor: string
}

/**
 * Item da legenda de score para o mapa
 */
export type CorMarcador = 'verde' | 'amarelo' | 'vermelho'

/**
 * Resultado de exportação CSV
 */
export interface ExportacaoCSV {
  conteudo: string
  nomeArquivo: string
}
