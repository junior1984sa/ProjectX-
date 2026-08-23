// Tipos e interfaces do WhoHiresYou

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
  /**
   * País do estabelecimento, em ISO 3166-1 alfa-2.
   *
   * Não é enfeite de endereço: é o campo que decide se este contato
   * pode receber e-mail comercial. Reino Unido e Austrália exigem
   * consentimento prévio; Estados Unidos não, mas exigem endereço
   * postal do remetente no rodapé. Sem saber o país, não dá para
   * cumprir nenhuma das duas regras — por isso o campo é obrigatório
   * e o servidor recusa o disparo quando ele falta.
   */
  pais: string
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
  /**
   * País onde procurar (BR, US, AU, PT). Vem do `pais_foco` do perfil.
   * Sem ele a geocodificação assume Brasil e uma busca por "Miami, FL"
   * não encontra nada — o sistema procuraria "Miami, FL, Brasil".
   */
  pais?: string
  /**
   * Bairro ou região, opcional. Em cidade grande muda tudo: o centro
   * de São Paulo fica a 40 km da Vila Olímpia, e leads a 40 km não são
   * visitados. Com bairro, o crédito rende leads que dá para atender.
   */
  bairro?: string
  /**
   * Quando a busca é no modo "clientes potenciais", esta lista contém
   * os termos reais usados na busca (ex: segmentos-clientes mapeados a
   * partir do segmento do prestador). Quando ausente ou vazia, a busca
   * usa o campo `segmento` diretamente (modo "direta", comportamento
   * original).
   */
  segmentosBusca?: string[]
  /**
   * Autoriza a substituição por empresas de exemplo quando a fonte real
   * não devolve nada. Só a demonstração de visitante liga isto.
   *
   * Para quem pagou, fica DESLIGADO de propósito. O crédito é debitado
   * antes da busca; se a fonte falhar e o sistema entregar empresas
   * inventadas, o assinante paga por telefone e e-mail que não existem
   * e descobre isso ao ligar. Devolver zero resultado com explicação é
   * ruim; devolver contato falso com cara de contato real destrói a
   * credibilidade do produto inteiro — que é o único ativo que ele tem.
   */
  permitirSimulado?: boolean
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
  /** Identifica a origem dos dados da última busca: qual fonte foi usada de fato */
  fonteDados: "openstreetmap" | "simulado"

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
