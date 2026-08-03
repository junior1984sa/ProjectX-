// Tipos relacionados a autenticação, perfis de prestadores e assinaturas

/**
 * Status possíveis de uma assinatura
 */
export type StatusAssinatura = "pendente" | "trial" | "ativa" | "atraso" | "cancelada"

/**
 * Planos de assinatura disponíveis. Quanto maior o compromisso,
 * maior o desconto e mais créditos mensais.
 */
export type TipoPlano = "mensal" | "trimestral" | "semestral" | "anual"

/**
 * Configuração central de todos os planos — FONTE ÚNICA DE VERDADE.
 *
 * Qualquer alteração de preço, desconto ou créditos deve ser feita
 * AQUI. O frontend, o cálculo de economia e a exibição dos cards
 * leem tudo daqui, então não existe número mágico espalhado pelo
 * código. Os valores da Edge Function de pagamento (servidor) devem
 * ser mantidos em sincronia via secrets do Supabase.
 */
export interface ConfiguracaoPlano {
  id: TipoPlano
  nome: string
  /** Duração do ciclo de cobrança, em meses */
  meses: number
  /** Valor total cobrado de uma vez, em reais */
  precoTotal: number
  /** Créditos de busca concedidos por mês */
  creditosMensais: number
  /** Texto curto de destaque no card (opcional) */
  destaque?: string
}

export const PLANOS: Record<TipoPlano, ConfiguracaoPlano> = {
  mensal: {
    id: "mensal",
    nome: "Mensal",
    meses: 1,
    precoTotal: 497.0,
    creditosMensais: 100,
  },
  trimestral: {
    id: "trimestral",
    nome: "Trimestral",
    meses: 3,
    precoTotal: 1341.0,
    creditosMensais: 120,
  },
  semestral: {
    id: "semestral",
    nome: "Semestral",
    meses: 6,
    precoTotal: 2532.0,
    creditosMensais: 135,
    destaque: "Melhor equilíbrio",
  },
  anual: {
    id: "anual",
    nome: "Anual",
    meses: 12,
    precoTotal: 4764.0,
    creditosMensais: 150,
    destaque: "Maior economia",
  },
}

/** Ordem em que os planos aparecem na tela, do menor para o maior compromisso */
export const ORDEM_PLANOS: TipoPlano[] = ["mensal", "trimestral", "semestral", "anual"]

/**
 * PREÇOS POR PAÍS — em moeda local, não convertidos pelo câmbio.
 *
 * Converter R$ 497 pelo dólar daria algo como US$ 92, um número quebrado
 * e barato demais para o mercado americano, onde ferramentas equivalentes
 * (Speedio, Econodata, Apollo) cobram bem mais. Cada praça tem preço
 * próprio, ancorado no mercado local.
 *
 * A escada de desconto é a mesma do Brasil, para a proposta ser idêntica
 * em qualquer país: trimestral -10%, semestral -15%, anual -20% sobre o
 * equivalente mensal.
 *
 * FONTE DE VERDADE do que é cobrado de fato é a tabela `planos_regiao`
 * no banco, lida pelas Edge Functions de pagamento. Estes valores são o
 * que a tela exibe — mantenha os dois em sincronia ao alterar preços.
 */
export const PRECOS_POR_PAIS: Record<string, Record<TipoPlano, number>> = {
  BR: { mensal: 497, trimestral: 1341, semestral: 2532, anual: 4764 },
  US: { mensal: 97, trimestral: 261, semestral: 492, anual: 924 },
  AU: { mensal: 147, trimestral: 396, semestral: 744, anual: 1404 },
  NZ: { mensal: 157, trimestral: 427, semestral: 797, anual: 1497 },
  GB: { mensal: 77, trimestral: 207, semestral: 390, anual: 732 },
  PT: { mensal: 89, trimestral: 240, semestral: 450, anual: 852 },
  // México e Paraguai têm poder de compra menor que EUA/Europa: o
  // preço é ancorado no mercado local, não convertido do dólar, senão
  // sai caro demais para a realidade de uma marmoraria em Asunción.
  MX: { mensal: 1497, trimestral: 3997, semestral: 7497, anual: 13997 },
  PY: { mensal: 397000, trimestral: 1071000, semestral: 2024000, anual: 3811000 },
}

/** Preço total do plano no país informado, caindo no Brasil se desconhecido */
export function precoTotalNoPais(plano: TipoPlano, pais: string): number {
  return (PRECOS_POR_PAIS[pais] ?? PRECOS_POR_PAIS.BR)[plano]
}

/**
 * PREÇO DE FUNDADOR — os 100 primeiros assinantes.
 *
 * São valores ABSOLUTOS, não um percentual sobre a tabela cheia. Um
 * desconto de 60% sobre R$ 497 daria R$ 198,80: número quebrado, e
 * acima da barreira psicológica dos R$ 200. R$ 197 fica abaixo dela e
 * converte melhor — a diferença de R$ 1,80 não paga o custo dessa
 * quebra na conversão.
 *
 * A escada entre os planos é a mesma da tabela cheia (anual ~20% mais
 * barato que o mensal equivalente), para a lógica de comparação que o
 * cliente faz continuar valendo.
 *
 * ESTE PREÇO É VITALÍCIO para quem entrar nas 100 primeiras vagas: é o
 * que transforma desconto em compromisso. Quem entra sabendo que o
 * preço nunca sobe vira defensor do produto, não caçador de promoção.
 */
export const PRECOS_LANCAMENTO_POR_PAIS: Record<
  string,
  Record<TipoPlano, number>
> = {
  BR: { mensal: 197, trimestral: 537, semestral: 997, anual: 1897 },
  US: { mensal: 37, trimestral: 99, semestral: 187, anual: 357 },
  AU: { mensal: 57, trimestral: 153, semestral: 288, anual: 549 },
  NZ: { mensal: 67, trimestral: 179, semestral: 337, anual: 637 },
  GB: { mensal: 29, trimestral: 78, semestral: 147, anual: 279 },
  PT: { mensal: 35, trimestral: 94, semestral: 177, anual: 337 },
  MX: { mensal: 597, trimestral: 1597, semestral: 2997, anual: 5697 },
  PY: { mensal: 157000, trimestral: 423000, semestral: 797000, anual: 1507000 },
}

/** Preço de fundador do plano no país informado */
export function precoLancamentoNoPais(plano: TipoPlano, pais: string): number {
  return (PRECOS_LANCAMENTO_POR_PAIS[pais] ?? PRECOS_LANCAMENTO_POR_PAIS.BR)[plano]
}

/** Quanto por cento o preço de fundador economiza, para exibir no selo */
export function economiaLancamento(plano: TipoPlano, pais: string): number {
  const cheio = precoTotalNoPais(plano, pais)
  const lancamento = precoLancamentoNoPais(plano, pais)
  return Math.round((1 - lancamento / cheio) * 100)
}

/**
 * Formata um valor na moeda e no formato do PAÍS, não no da interface.
 *
 * O dinheiro é local, então a convenção também é: um preço mexicano se
 * escreve à maneira mexicana mesmo que a pessoa esteja navegando em
 * inglês. Usar o idioma da interface quebrava dois mercados:
 *
 *   México   "1497 MXN"     →  "$1,497"      (separador e símbolo certos)
 *   Paraguai "397.000 PYG"  →  "Gs. 397.000" (símbolo real do guarani)
 *
 * O idioma genérico ("es") aplica convenção da Espanha, que não é a de
 * nenhum dos dois.
 */
export function formatarMoeda(valor: number, pais: string): string {
  const config = obterPais(pais)
  return new Intl.NumberFormat(config.idioma, {
    style: "currency",
    currency: config.moeda,
    maximumFractionDigits: valor % 1 === 0 ? 0 : 2,
  }).format(valor)
}

/** Valor equivalente por mês — é o número que o cliente usa para comparar */
export function precoMensalEquivalente(plano: TipoPlano, pais = "BR"): number {
  return precoTotalNoPais(plano, pais) / PLANOS[plano].meses
}

/**
 * Percentual de economia em relação a pagar o plano mensal pelo
 * mesmo período. Retorna 0 para o próprio plano mensal.
 */
export function economiaPercentual(plano: TipoPlano, pais = "BR"): number {
  if (plano === "mensal") return 0

  const custoSeFosseMensal =
    precoTotalNoPais("mensal", pais) * PLANOS[plano].meses
  return Math.round((1 - precoTotalNoPais(plano, pais) / custoSeFosseMensal) * 100)
}

/**
 * Tipos de arquivo que o prestador pode enviar
 */
export type TipoArquivo = "portfolio" | "proposta" | "panfleto" | "outro"

/**
 * Perfil público de um prestador de serviço
 */
export interface Profile {
  id: string
  nome_empresa: string
  segmento: string
  cidade: string
  estado: string
  nome_contato: string
  whatsapp: string
  email_contato: string
  descricao: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  status_assinatura: StatusAssinatura
  pais_foco: string
  idioma: string
  /** Acesso à área administrativa (custos, métricas, lista de associados) */
  is_admin: boolean
  criado_em: string
  atualizado_em: string
}

/**
 * Preço de assinatura por região/moeda/gateway.
 * Hoje só 'BR' está ativo; outras regiões ficam cadastradas para
 * quando a internacionalização for lançada de fato.
 */
export interface PlanoRegiao {
  id: string
  pais: string
  moeda: string
  gateway: "mercadopago" | "stripe" | "paypal"
  plano: TipoPlano
  valor: number
  ativo: boolean
}

/**
 * Países disponíveis para foco de prospecção.
 *
 * DOIS NÍVEIS DE DISPONIBILIDADE, de propósito:
 *
 *   buscaDisponivel — o motor de busca sabe geocodificar e procurar
 *     empresas naquele país. Independe de pagamento.
 *
 *   gateway — qual meio de pagamento atende o país. `null` significa
 *     que ainda não há como cobrar ali: a pessoa navega e testa, mas a
 *     tela de planos avisa que a cobrança ainda não está disponível.
 *     Vira "stripe" (EUA) e "paypal"/"stripe" (Portugal) assim que as
 *     credenciais forem aprovadas.
 *
 * `nomeGeocodificacao` é o nome usado na consulta ao Nominatim, e
 * `codigoISO2` restringe o resultado àquele país — sem isso, "Springfield"
 * cai em qualquer lugar do mundo.
 */
/**
 * Gateways previstos. Precisa ser um tipo declarado, e a lista abaixo
 * precisa ser tipada por ele em vez de usar `as const`: com `as const`,
 * e nenhum país apontando hoje para stripe/paypal, o TypeScript inferiria
 * `gateway` como apenas "mercadopago" | null — e recusaria o roteador em
 * src/lib/assinaturas.ts tratar os casos futuros.
 */
export type TipoGateway = "mercadopago" | "stripe" | "paypal" | null

export interface ConfiguracaoPais {
  codigo: string
  nome: string
  /** Nome usado na consulta ao Nominatim */
  nomeGeocodificacao: string
  /** Exemplo mostrado no campo de cidade */
  exemploCidade: string
  /** Sugestões de cidade do próprio país */
  cidadesSugeridas: string[]
  /** Restringe a geocodificação a este país */
  codigoISO2: string
  /** Código telefônico internacional, usado para montar links do WhatsApp */
  codigoTelefone: string
  moeda: string
  idioma: string
  buscaDisponivel: boolean
  gateway: TipoGateway
}

export const PAISES_DISPONIVEIS: ConfiguracaoPais[] = [
  {
    codigo: "BR",
    nome: "Brasil",
    nomeGeocodificacao: "Brasil",
    exemploCidade: "São Paulo, SP",
    cidadesSugeridas: [
      "São Paulo, SP",
      "Rio de Janeiro, RJ",
      "Florianópolis, SC",
      "Curitiba, PR",
      "Belo Horizonte, MG",
      "Porto Alegre, RS",
    ],
    codigoISO2: "br",
    codigoTelefone: "55",
    moeda: "BRL",
    idioma: "pt-BR",
    buscaDisponivel: true,
    gateway: "mercadopago",
  },
  {
    codigo: "US",
    nome: "Estados Unidos",
    nomeGeocodificacao: "United States",
    exemploCidade: "Miami, FL",
    cidadesSugeridas: [
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "Houston, TX",
      "Miami, FL",
      "Atlanta, GA",
    ],
    codigoISO2: "us",
    codigoTelefone: "1",
    moeda: "USD",
    idioma: "en-US",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "AU",
    nome: "Austrália",
    nomeGeocodificacao: "Australia",
    exemploCidade: "Sydney, NSW",
    cidadesSugeridas: [
      "Sydney, NSW",
      "Melbourne, VIC",
      "Brisbane, QLD",
      "Perth, WA",
      "Adelaide, SA",
      "Gold Coast, QLD",
    ],
    codigoISO2: "au",
    codigoTelefone: "61",
    moeda: "AUD",
    idioma: "en-AU",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "MX",
    nome: "México",
    nomeGeocodificacao: "México",
    exemploCidade: "Guadalajara, JAL",
    cidadesSugeridas: [
      "Ciudad de México, CDMX",
      "Guadalajara, JAL",
      "Monterrey, NL",
      "Puebla, PUE",
      "Querétaro, QRO",
      "Tijuana, BC",
    ],
    codigoISO2: "mx",
    codigoTelefone: "52",
    moeda: "MXN",
    idioma: "es-MX",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "NZ",
    nome: "Nova Zelândia",
    nomeGeocodificacao: "New Zealand",
    exemploCidade: "Auckland",
    cidadesSugeridas: [
      "Auckland",
      "Wellington",
      "Christchurch",
      "Hamilton",
      "Tauranga",
      "Dunedin",
    ],
    codigoISO2: "nz",
    codigoTelefone: "64",
    moeda: "NZD",
    idioma: "en-NZ",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "PY",
    nome: "Paraguai",
    nomeGeocodificacao: "Paraguay",
    exemploCidade: "Asunción",
    cidadesSugeridas: [
      "Asunción",
      "Ciudad del Este",
      "Encarnación",
      "San Lorenzo",
      "Luque",
      "Pedro Juan Caballero",
    ],
    codigoISO2: "py",
    codigoTelefone: "595",
    moeda: "PYG",
    idioma: "es-PY",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "GB",
    nome: "Reino Unido",
    nomeGeocodificacao: "United Kingdom",
    exemploCidade: "Manchester",
    cidadesSugeridas: [
      "London",
      "Manchester",
      "Birmingham",
      "Leeds",
      "Glasgow",
      "Bristol",
    ],
    codigoISO2: "gb",
    codigoTelefone: "44",
    moeda: "GBP",
    idioma: "en-GB",
    buscaDisponivel: true,
    gateway: null,
  },
  {
    codigo: "PT",
    nome: "Portugal",
    nomeGeocodificacao: "Portugal",
    exemploCidade: "Lisboa",
    cidadesSugeridas: ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Aveiro"],
    codigoISO2: "pt",
    codigoTelefone: "351",
    moeda: "EUR",
    idioma: "pt-PT",
    buscaDisponivel: true,
    gateway: null,
  },
]

/** Busca a configuração de um país, caindo no Brasil se o código for desconhecido */
export function obterPais(codigo: string | null | undefined) {
  return (
    PAISES_DISPONIVEIS.find((p) => p.codigo === codigo) ?? PAISES_DISPONIVEIS[0]
  )
}

/**
 * Dados necessários para criar/editar um perfil (sem campos gerados pelo banco)
 */
export interface DadosPerfilForm {
  nome_empresa: string
  segmento: string
  cidade: string
  estado: string
  nome_contato: string
  whatsapp: string
  email_contato: string
  descricao: string
  website: string
  paisFoco: string
}

/**
 * Arquivo de portfólio/proposta enviado pelo prestador
 */
export interface ArquivoPortfolio {
  id: string
  profile_id: string
  nome_arquivo: string
  url_storage: string
  tipo: TipoArquivo
  tamanho_bytes: number | null
  criado_em: string
}

/**
 * Registro de assinatura/cobrança
 */
export interface Assinatura {
  id: string
  profile_id: string
  plano: TipoPlano
  mercadopago_preference_id: string | null
  mercadopago_payment_id: string | null
  mercadopago_subscription_id: string | null
  status: "pendente" | "aprovada" | "rejeitada" | "cancelada" | "em_atraso"
  valor: number
  data_inicio: string | null
  proxima_cobranca: string | null
  criado_em: string
}

/**
 * Estado de autenticação do usuário atual
 */
export interface SessaoUsuario {
  id: string
  email: string
}

/**
 * Segmentos sugeridos — texto livre, mas com autocomplete
 * Cobre prestadores industriais e de serviços em geral no Brasil
 */
/**
 * Saldo de créditos de busca do usuário, resetado a cada ciclo mensal
 */
export interface CreditosUsuario {
  id: string
  creditos_disponiveis: number
  creditos_totais_ciclo: number
  ciclo_inicio: string
  ciclo_fim: string
  atualizado_em: string
}

/**
 * Registro de uma busca no histórico (para auditoria de consumo)
 */
export interface HistoricoBusca {
  id: string
  profile_id: string
  segmento: string
  cidade: string
  estado: string | null
  raio_km: number
  quantidade_empresas: number
  creditos_gastos: number
  criado_em: string
}

/**
 * Faixas de tamanho de busca e seu custo em créditos.
 * Espelha a função calcular_custo_creditos() no banco — mantenha sincronizado.
 */
export const FAIXAS_CREDITO = [
  { max: 10, custo: 10, label: "Até 10 empresas" },
  { max: 20, custo: 18, label: "Até 20 empresas" },
  { max: 30, custo: 25, label: "Até 30 empresas" },
  { max: 40, custo: 30, label: "Até 40 empresas" },
] as const

export function custoCreditosPorQuantidade(quantidade: number): number {
  const faixa = FAIXAS_CREDITO.find((f) => quantidade <= f.max)
  return faixa?.custo ?? FAIXAS_CREDITO[FAIXAS_CREDITO.length - 1].custo
}

export const SEGMENTOS_SUGERIDOS = [
  "Jateamento abrasivo",
  "Pintura industrial",
  "Aluguel de containers",
  "Aluguel de caminhões",
  "Aluguel de betoneiras",
  "Locação de equipamentos",
  "Caldeiraria",
  "Ensaios não destrutivos (NDT)",
  "Andaimes e acesso",
  "Isolamento térmico industrial",
  "Solda industrial",
  "Manutenção mecânica industrial",
  "Montagem industrial",
  "Transporte de cargas",
  "Locação de guindastes",
  "Limpeza industrial",
  "Tratamento de superfícies",
  "Refratários",
  "Elétrica industrial",
  "Instrumentação industrial",
  "Marmoraria",
  "Clínica odontológica",
  "Restaurante",
  "Academia",
  "Mecânica automotiva",
  "Advocacia",
  "Contabilidade",
  "Construção civil",
] as const

/**
 * Centraliza a regra de "tem acesso liberado": tanto assinatura ativa
 * quanto período de teste (trial) dão acesso completo às funcionalidades.
 * Usar esta função em vez de comparar status_assinatura diretamente evita
 * esquecer de tratar o trial em algum lugar do app.
 */
export function temAcessoLiberado(perfil: Profile | null): boolean {
  if (!perfil) return false
  return perfil.status_assinatura === "ativa" || perfil.status_assinatura === "trial"
}

/**
 * Perfil público exibido no diretório de busca direta — separado do
 * perfil de prospecção. Mais rico, pensado para gerar conversão em
 * quem está buscando um prestador diretamente.
 */
export interface PerfilDiretorio {
  id: string
  titulo_publico: string
  descricao_completa: string
  area_atendimento: string | null
  anos_de_mercado: number | null
  certificacoes: string | null
  tempo_resposta_estimado: string | null
  logo_url: string | null
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

/**
 * Dados do formulário de edição do perfil de diretório (sem campos
 * gerados pelo banco).
 */
export interface DadosPerfilDiretorioForm {
  titulo_publico: string
  descricao_completa: string
  area_atendimento: string
  anos_de_mercado: string
  certificacoes: string
  tempo_resposta_estimado: string
}

/**
 * Foto de trabalho realizado, exibida na galeria do perfil público.
 */
export interface FotoTrabalho {
  id: string
  profile_id: string
  url_foto: string
  legenda: string | null
  ordem: number
  criado_em: string
}

/**
 * Resultado de busca no diretório: combina o perfil de prospecção
 * (dados básicos/contato) com o perfil de diretório (dados públicos)
 * e a galeria de fotos, tudo já filtrado para quem está publicado
 * e com assinatura ativa.
 */
export interface ResultadoBuscaDiretorio {
  profile: Profile
  diretorio: PerfilDiretorio
  fotos: FotoTrabalho[]
}

/**
 * Modo de busca de prospecção: "direta" busca exatamente o termo
 * digitado (útil quando o usuário já sabe o serviço que precisa
 * contratar); "clientes" busca segmentos que tipicamente CONTRATAM
 * o serviço do prestador — essa é a prospecção de venda ativa.
 */
export type ModoBusca = "direta" | "clientes"

/**
 * Mapeamento segmento → segmentos-clientes típicos. Cobre os ramos já
 * sugeridos no app. Esta tabela é a base inicial — conforme a base de
 * segmentos crescer (novos países, novos ramos), o caminho de evolução
 * é trocar esta função por uma chamada de IA que infere os segmentos-
 * clientes dinamicamente a partir de qualquer texto livre, em qualquer
 * idioma, sem depender de manutenção manual desta tabela.
 */
const MAPA_SEGMENTOS_CLIENTES: Record<string, string[]> = {
  // ── Industrial / Construção pesada ──
  "marmoraria": ["Construtora", "Arquitetura e design de interiores", "Loja de material de construção", "Marcenaria"],
  "jateamento abrasivo": ["Estaleiro naval", "Indústria metalúrgica", "Manutenção industrial", "Construção civil pesada"],
  "pintura industrial": ["Estaleiro naval", "Indústria metalúrgica", "Construtora", "Manutenção industrial"],
  "aluguel de containers": ["Construtora", "Eventos e feiras", "Logística e armazenagem", "Indústria"],
  "aluguel de caminhões": ["Construtora", "Transportadora", "Indústria", "Comércio de materiais"],
  "aluguel de betoneiras": ["Construtora", "Empreiteira", "Reforma residencial", "Engenharia civil"],
  "locação de equipamentos": ["Construtora", "Indústria", "Empreiteira", "Eventos"],
  "caldeiraria": ["Indústria metalúrgica", "Petroquímica", "Manutenção industrial", "Estaleiro naval"],
  "ensaios não destrutivos (ndt)": ["Indústria metalúrgica", "Petroquímica", "Construção civil pesada", "Manutenção industrial"],
  "andaimes e acesso": ["Construtora", "Pintura industrial", "Manutenção predial", "Eventos"],
  "isolamento térmico industrial": ["Petroquímica", "Indústria alimentícia", "Frigorífico", "Manutenção industrial"],
  "solda industrial": ["Indústria metalúrgica", "Construção civil pesada", "Manutenção industrial", "Estaleiro naval"],
  "manutenção mecânica industrial": ["Indústria", "Fábrica", "Mineração", "Petroquímica"],
  "montagem industrial": ["Indústria", "Construtora", "Petroquímica", "Mineração"],
  "transporte de cargas": ["Indústria", "Comércio", "Construtora", "Distribuidora"],
  "locação de guindastes": ["Construtora", "Indústria", "Estaleiro naval", "Montagem industrial"],
  "limpeza industrial": ["Indústria alimentícia", "Petroquímica", "Fábrica", "Frigorífico"],
  "tratamento de superfícies": ["Indústria metalúrgica", "Construção civil", "Estaleiro naval", "Manutenção industrial"],
  "refratários": ["Indústria metalúrgica", "Cerâmica", "Petroquímica", "Fundição"],
  "elétrica industrial": ["Indústria", "Construtora", "Condomínio comercial", "Fábrica"],
  "instrumentação industrial": ["Petroquímica", "Indústria", "Mineração", "Usina"],
  "construção civil": ["Incorporadora", "Loja de material de construção", "Engenharia", "Imobiliária"],
  "demolição": ["Construtora", "Incorporadora", "Prefeitura", "Engenharia civil"],
  "terraplanagem": ["Construtora", "Incorporadora", "Loteadora", "Engenharia civil"],
  "impermeabilização": ["Construtora", "Condomínio residencial", "Incorporadora", "Engenharia civil"],
  "fôrmas e escoramentos": ["Construtora", "Incorporadora", "Engenharia civil", "Empreiteira"],
  "usinagem cnc": ["Indústria metalúrgica", "Indústria automotiva", "Fabricante de máquinas", "Manutenção industrial"],
  "fundição": ["Indústria metalúrgica", "Indústria automotiva", "Fabricante de máquinas", "Construção civil"],
  "automação industrial": ["Indústria", "Fábrica", "Mineração", "Petroquímica"],
  "caldeiras e vasos de pressão": ["Indústria alimentícia", "Petroquímica", "Hospital", "Lavanderia industrial"],
  "manutenção predial": ["Condomínio residencial", "Condomínio comercial", "Shopping center", "Administradora de imóveis"],
  "dedetização e controle de pragas": ["Restaurante", "Condomínio residencial", "Indústria alimentícia", "Hospital"],

  // ── Saúde ──
  "clínica odontológica": ["Plano de saúde", "Empresa (convênio corporativo)", "Escola (parceria)"],
  "clínica médica": ["Plano de saúde", "Empresa (convênio corporativo)", "Hospital"],
  "fisioterapia": ["Plano de saúde", "Academia", "Clube esportivo", "Empresa (saúde ocupacional)"],
  "laboratório de análises clínicas": ["Plano de saúde", "Clínica médica", "Hospital", "Empresa (exames admissionais)"],
  "fornecedor de equipamentos hospitalares": ["Hospital", "Clínica médica", "Clínica odontológica", "Laboratório", "Plano de saúde"],
  "home care": ["Plano de saúde", "Hospital", "Família/Pessoa física", "Asilo e casa de repouso"],
  "psicologia clínica": ["Plano de saúde", "Empresa (saúde mental corporativa)", "Escola"],
  "nutrição": ["Academia", "Plano de saúde", "Empresa (wellness corporativo)", "Clínica médica"],

  // ── Beleza e estética ──
  "salão de beleza": ["Hotel", "Buffet de eventos", "Empresa (parceria corporativa)"],
  "clínica de estética": ["Plano de saúde", "Academia", "Spa", "Hotel"],
  "barbearia": ["Hotel", "Empresa (parceria corporativa)"],
  "distribuidor de cosméticos": ["Salão de beleza", "Clínica de estética", "Farmácia", "Loja de cosméticos"],

  // ── Varejo e comércio ──
  "loja de material de construção": ["Construtora", "Empreiteira", "Reforma residencial", "Arquitetura"],
  "distribuidora de alimentos": ["Restaurante", "Supermercado", "Hotel", "Buffet de eventos"],
  "atacadista": ["Varejo", "Restaurante", "Mercado", "Loja de conveniência"],
  "gráfica": ["Empresa em geral", "Escritório de marketing", "Editora", "Escola"],
  "papelaria": ["Escola", "Escritório", "Empresa em geral"],
  "loja de informática": ["Escritório", "Empresa em geral", "Escola", "Coworking"],

  // ── Tecnologia ──
  "desenvolvimento de software": ["Empresa em geral", "Startup", "Indústria", "Comércio"],
  "consultoria em ti": ["Empresa em geral", "Escritório de advocacia", "Clínica médica", "Indústria"],
  "segurança da informação": ["Empresa em geral", "Banco", "Hospital", "Escritório de advocacia"],
  "telecomunicações": ["Empresa em geral", "Condomínio comercial", "Indústria", "Escritório"],
  "impressão 3d": ["Indústria", "Arquitetura", "Startup de produto", "Fabricante de máquinas"],

  // ── Eventos e hospitalidade ──
  "buffet de eventos": ["Empresa (eventos corporativos)", "Casa de festas", "Hotel"],
  "decoração de eventos": ["Buffet de eventos", "Casa de festas", "Empresa (eventos corporativos)"],
  "fotografia e filmagem": ["Buffet de eventos", "Empresa (marketing/publicidade)", "Casa de festas"],
  "som e iluminação para eventos": ["Buffet de eventos", "Casa de festas", "Empresa (eventos corporativos)"],
  "hotel": ["Empresa (turismo corporativo)", "Agência de viagens", "Operadora de turismo"],
  "agência de viagens": ["Empresa (viagens corporativas)", "Operadora de turismo"],

  // ── Logística e transporte ──
  "transportadora": ["Indústria", "Comércio", "Distribuidora", "E-commerce"],
  "logística e armazenagem": ["Indústria", "Distribuidora", "E-commerce", "Comércio"],
  "frete e mudanças": ["Família/Pessoa física", "Empresa em geral", "Imobiliária"],
  "despachante aduaneiro": ["Indústria", "Importadora", "Exportadora", "Comércio exterior"],

  // ── Agro ──
  "consultoria agronômica": ["Fazenda", "Cooperativa agrícola", "Agroindústria"],
  "venda de insumos agrícolas": ["Fazenda", "Cooperativa agrícola", "Agroindústria"],
  "maquinário agrícola": ["Fazenda", "Cooperativa agrícola", "Agroindústria"],
  "irrigação agrícola": ["Fazenda", "Cooperativa agrícola", "Agroindústria"],
  "veterinária de grande porte": ["Fazenda", "Cooperativa agrícola", "Confinamento de gado"],

  // ── Educação ──
  "curso de idiomas": ["Empresa (treinamento corporativo)", "Escola", "Família/Pessoa física"],
  "treinamento corporativo": ["Empresa em geral", "Indústria", "Escritório"],
  "material didático": ["Escola", "Universidade", "Curso preparatório"],
  "consultoria educacional": ["Escola", "Universidade", "Secretaria de educação"],

  // ── Profissionais liberais e serviços B2B ──
  "mecânica automotiva": ["Locadora de veículos", "Frota empresarial", "Transportadora", "Concessionária"],
  "distribuidor de autopeças": ["Mecânica automotiva", "Concessionária", "Locadora de veículos", "Frota empresarial"],
  "distribuidor de rochas ornamentais": ["Marmoraria", "Construtora", "Arquitetura e design de interiores"],
  "fornecedor de máquinas para marmoraria": ["Marmoraria", "Serralheria", "Construtora"],
  "advocacia": ["Construtora", "Indústria", "Imobiliária", "Empresa em geral"],
  "contabilidade": ["Construtora", "Comércio", "Indústria", "Empresa em geral"],
  "consultoria financeira": ["Empresa em geral", "Indústria", "Comércio"],
  "recursos humanos / recrutamento": ["Empresa em geral", "Indústria", "Comércio", "Startup"],
  "marketing digital": ["Empresa em geral", "Comércio", "Clínica", "Escritório de advocacia"],
  "design gráfico": ["Empresa em geral", "Editora", "Agência de marketing"],
  "tradução e interpretação": ["Empresa (comércio exterior)", "Escritório de advocacia", "Universidade"],
  "auditoria e compliance": ["Empresa em geral", "Indústria", "Banco", "Hospital"],

  // ── Imóveis ──
  "imobiliária": ["Construtora", "Incorporadora", "Família/Pessoa física"],
  "administração de condomínios": ["Condomínio residencial", "Condomínio comercial", "Incorporadora"],
  "avaliação de imóveis": ["Banco", "Imobiliária", "Incorporadora", "Família/Pessoa física"],

  // ── Restaurantes e alimentação ──
  "restaurante": ["Empresa (eventos corporativos)", "Buffet e eventos", "Hotel"],
  "fornecedor de equipamentos para restaurantes": ["Restaurante", "Hotel", "Buffet de eventos", "Padaria"],
  "padaria e confeitaria": ["Empresa (café da manhã corporativo)", "Hotel", "Cafeteria"],
  "food truck": ["Empresa (eventos corporativos)", "Buffet de eventos", "Condomínio comercial"],

  // ── Saúde e bem-estar corporativo ──
  "academia": ["Empresa (parceria corporativa/wellness)", "Condomínio residencial", "Plano de saúde"],
  "personal trainer": ["Empresa (wellness corporativo)", "Condomínio residencial", "Plano de saúde"],
  "clínica veterinária": ["Pet shop", "ONG de animais", "Família/Pessoa física"],
  "pet shop": ["Clínica veterinária", "Hotel para pets", "Família/Pessoa física"],

  // ── Setor financeiro ──
  "factoring": ["Indústria", "Comércio", "Construtora", "Transportadora"],
  "corretora de seguros": ["Empresa em geral", "Indústria", "Construtora", "Transportadora"],
  "corretora de investimentos": ["Empresa em geral", "Família/Pessoa física"],

  // ── Energia e meio ambiente ──
  "energia solar": ["Indústria", "Condomínio residencial", "Construtora", "Comércio"],
  "consultoria ambiental": ["Indústria", "Construtora", "Mineração", "Agroindústria"],
  "gestão de resíduos": ["Indústria", "Construtora", "Hospital", "Condomínio comercial"],
  "tratamento de água e efluentes": ["Indústria", "Condomínio residencial", "Agroindústria", "Hospital"],
}

/**
 * Chama uma função de IA (a definir no backend) para inferir segmentos
 * clientes quando o segmento digitado não está na tabela fixa acima.
 * Mantém a mesma assinatura de obterSegmentosClientes para que o
 * restante do código não precise saber qual fonte está sendo usada.
 *
 * Ainda não implementada — placeholder para a Edge Function futura
 * (ex: `inferir-segmentos-clientes`, usando a API da Anthropic ou
 * outro provedor de IA configurado nos secrets do Supabase).
 */
export async function obterSegmentosClientesPorIA(
  segmentoPrestador: string
): Promise<string[]> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    if (!supabaseUrl) return []

    const resposta = await fetch(`${supabaseUrl}/functions/v1/inferir-segmentos-clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmento: segmentoPrestador }),
    })

    if (!resposta.ok) return []

    const dados = await resposta.json()
    return Array.isArray(dados.segmentos) ? dados.segmentos : []
  } catch (erro) {
    console.error("Erro ao inferir segmentos-clientes por IA:", erro)
    return []
  }
}

/**
 * Retorna os segmentos-clientes típicos para um segmento de prestador.
 * Faz correspondência por substring (case-insensitive) para tolerar
 * pequenas variações no texto digitado.
 */
export function obterSegmentosClientes(segmentoPrestador: string): string[] {
  const chave = segmentoPrestador.toLowerCase().trim()

  for (const [seg, clientes] of Object.entries(MAPA_SEGMENTOS_CLIENTES)) {
    if (chave.includes(seg) || seg.includes(chave)) {
      return clientes
    }
  }

  // Sem mapeamento conhecido: retorna vazio — quem chama deve tratar
  // esse caso (ex: cair no modo "direta", ou avisar que o segmento é
  // novo e ainda não tem mapeamento de clientes configurado).
  return []
}

/**
 * BUSCA INVERSA — quem VENDE PARA um determinado segmento.
 *
 * É o oposto de obterSegmentosClientes(). Usada pelo banner de
 * destaque: se quem está navegando é um dentista, faz sentido mostrar
 * fornecedores de consultório — não outra clínica odontológica (que é
 * concorrente) nem uma oficina mecânica (que não tem relação nenhuma).
 *
 * Funciona percorrendo o mapa ao contrário: se o segmento "X" tem
 * "dentista" na sua lista de clientes, então X vende para dentistas.
 */
export function obterFornecedoresPara(segmentoDoVisitante: string): string[] {
  const alvo = segmentoDoVisitante.toLowerCase().trim()
  if (!alvo) return []

  const fornecedores: string[] = []

  for (const [segmentoFornecedor, clientes] of Object.entries(MAPA_SEGMENTOS_CLIENTES)) {
    // Ignora o próprio segmento — não faz sentido anunciar concorrente
    if (segmentoFornecedor === alvo) continue

    const atendeEsseSegmento = clientes.some((cliente) => {
      const c = cliente.toLowerCase()
      return c.includes(alvo) || alvo.includes(c)
    })

    if (atendeEsseSegmento) {
      fornecedores.push(segmentoFornecedor)
    }
  }

  return fornecedores
}

/**
 * Versão combinada: tenta a tabela fixa primeiro (instantânea, cobre
 * ~100 segmentos comuns). Se não encontrar nada, recorre à inferência
 * por IA (assíncrona, cobre qualquer segmento novo ou em outro idioma/
 * país, sem precisar de manutenção manual desta tabela).
 */
export async function obterSegmentosClientesComFallback(
  segmentoPrestador: string
): Promise<{ segmentos: string[]; fonte: "tabela" | "ia" | "nenhuma" }> {
  const daTabela = obterSegmentosClientes(segmentoPrestador)
  if (daTabela.length > 0) {
    return { segmentos: daTabela, fonte: "tabela" }
  }

  const daIA = await obterSegmentosClientesPorIA(segmentoPrestador)
  if (daIA.length > 0) {
    return { segmentos: daIA, fonte: "ia" }
  }

  return { segmentos: [], fonte: "nenhuma" }
}
