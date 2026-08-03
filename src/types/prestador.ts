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
  CA: { mensal: 137, trimestral: 369, semestral: 697, anual: 1317 },
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
  CA: { mensal: 57, trimestral: 153, semestral: 287, anual: 547 },
  GB: { mensal: 29, trimestral: 78, semestral: 147, anual: 279 },
  PT: { mensal: 35, trimestral: 94, semestral: 177, anual: 337 },
  MX: { mensal: 597, trimestral: 1597, semestral: 2997, anual: 5697 },
  PY: { mensal: 157000, trimestral: 423000, semestral: 797000, anual: 1507000 },
}

/**
 * Planos que dão direito ao preço de fundador.
 *
 * O mensal fica de fora de propósito, por três motivos que se somam:
 *
 *   CAIXA — 100 fundadores no semestral são cerca de R$ 99.700 à vista,
 *     contra R$ 19.700 por mês no mensal. O dinheiro para pagar Google,
 *     Vercel e Supabase precisa entrar agora, não daqui a seis meses.
 *
 *   REEMBOLSO — quem paga seis meses adiantado pensou mais do que quem
 *     paga um mês. O compromisso maior filtra o comprador impulsivo,
 *     que é justamente quem exerce o direito de arrependimento.
 *
 *   CLAREZA DA OFERTA — desconto que vale para tudo não é oferta, é
 *     tabela de preço. Restringir deixa a troca explícita: quer o preço
 *     de fundador, assume o compromisso.
 */
export const PLANOS_COM_PRECO_FUNDADOR: TipoPlano[] = ["semestral", "anual"]

export function temPrecoFundador(plano: TipoPlano): boolean {
  return PLANOS_COM_PRECO_FUNDADOR.includes(plano)
}

/**
 * Preço de fundador do plano no país informado. Planos fora da lista
 * acima devolvem o preço cheio — não existe fundador no mensal.
 */
export function precoLancamentoNoPais(plano: TipoPlano, pais: string): number {
  if (!temPrecoFundador(plano)) return precoTotalNoPais(plano, pais)
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
    codigo: "CA",
    nome: "Canadá",
    nomeGeocodificacao: "Canada",
    exemploCidade: "Toronto, ON",
    cidadesSugeridas: [
      "Toronto, ON",
      "Vancouver, BC",
      "Montréal, QC",
      "Calgary, AB",
      "Ottawa, ON",
      "Edmonton, AB",
    ],
    codigoISO2: "ca",
    codigoTelefone: "1",
    moeda: "CAD",
    idioma: "en-CA",
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

  // ═══════════════════════════════════════════════════════════
  // EXPANSÃO — o princípio é sempre o mesmo: para toda empresa em
  // operação existe outra que precisa do serviço dela. Uma empresa de
  // redes de proteção não vende para outra de redes; vende para
  // condomínio, construtora e escola.
  //
  // Por isso a lista de clientes NUNCA repete o próprio segmento: é
  // exatamente o que obterFornecedoresPara() usa para nunca mostrar
  // concorrente como oportunidade.
  // ═══════════════════════════════════════════════════════════

  // ── Segurança predial e patrimonial ──
  "redes de proteção": ["Condomínio residencial", "Construtora", "Escola", "Creche"],
  "instalação de câmeras e cftv": ["Condomínio residencial", "Condomínio comercial", "Comércio", "Indústria"],
  "alarme e monitoramento": ["Comércio", "Condomínio residencial", "Indústria", "Escritório"],
  "controle de acesso e portaria": ["Condomínio residencial", "Condomínio comercial", "Indústria", "Escola"],
  "portaria remota": ["Condomínio residencial", "Condomínio comercial", "Loteamento"],
  "segurança patrimonial": ["Indústria", "Condomínio comercial", "Shopping", "Evento"],
  "vigilância eletrônica": ["Comércio", "Indústria", "Condomínio comercial", "Banco"],
  "cerca elétrica e concertina": ["Condomínio residencial", "Indústria", "Depósito", "Escola"],
  "brigada de incêndio": ["Indústria", "Condomínio comercial", "Shopping", "Hospital"],
  "extintores e combate a incêndio": ["Indústria", "Condomínio comercial", "Comércio", "Frota de veículos"],
  "sprinklers e hidrantes": ["Construtora", "Indústria", "Condomínio comercial", "Shopping"],
  "para-raios e spda": ["Indústria", "Condomínio residencial", "Construtora", "Telecomunicações"],
  "laudo técnico e avcb": ["Condomínio comercial", "Indústria", "Comércio", "Escola"],
  "blindagem de veículos": ["Empresa (frota executiva)", "Segurança patrimonial", "Família/Pessoa física"],
  "insulfilm e película de segurança": ["Condomínio comercial", "Comércio", "Escritório", "Frota de veículos"],

  // ── Serviços prediais e facilities ──
  "limpeza de fachadas": ["Condomínio comercial", "Condomínio residencial", "Hotel", "Shopping"],
  "limpeza pós-obra": ["Construtora", "Incorporadora", "Reforma comercial", "Imobiliária"],
  "limpeza de caixa d'água": ["Condomínio residencial", "Escola", "Restaurante", "Indústria alimentícia"],
  "desentupimento": ["Condomínio residencial", "Restaurante", "Comércio", "Escola"],
  "jardinagem e paisagismo": ["Condomínio residencial", "Condomínio comercial", "Hotel", "Prefeitura"],
  "poda de árvores": ["Condomínio residencial", "Prefeitura", "Loteamento", "Indústria"],
  "conservação e zeladoria": ["Condomínio residencial", "Condomínio comercial", "Escola", "Hospital"],
  "portaria e recepção terceirizada": ["Condomínio comercial", "Escritório", "Clínica", "Escola"],
  "manutenção de elevadores": ["Condomínio residencial", "Condomínio comercial", "Hotel", "Hospital"],
  "manutenção de ar-condicionado": ["Condomínio comercial", "Escritório", "Clínica", "Restaurante"],
  "instalação de ar-condicionado": ["Construtora", "Escritório", "Comércio", "Condomínio residencial"],
  "climatização industrial": ["Indústria", "Frigorífico", "Data center", "Hospital"],
  "refrigeração comercial": ["Supermercado", "Restaurante", "Padaria", "Farmácia"],
  "câmara fria": ["Frigorífico", "Supermercado", "Indústria alimentícia", "Restaurante"],
  "manutenção de geradores": ["Hospital", "Data center", "Indústria", "Condomínio comercial"],
  "locação de geradores": ["Evento", "Construtora", "Indústria", "Hospital"],
  "nobreak e energia de emergência": ["Data center", "Hospital", "Escritório", "Comércio"],

  // ── Construção: acabamento e especialidades ──
  "vidraçaria": ["Construtora", "Comércio", "Condomínio residencial", "Arquitetura"],
  "esquadrias de alumínio": ["Construtora", "Incorporadora", "Reforma comercial", "Condomínio residencial"],
  "serralheria": ["Construtora", "Indústria", "Condomínio residencial", "Comércio"],
  "gesso e drywall": ["Construtora", "Arquitetura e design de interiores", "Reforma comercial", "Loja"],
  "forro de pvc e modular": ["Construtora", "Comércio", "Escritório", "Clínica"],
  "piso vinílico e laminado": ["Arquitetura e design de interiores", "Escritório", "Clínica", "Academia"],
  "piso industrial e epóxi": ["Indústria", "Depósito", "Estacionamento", "Frigorífico"],
  "porcelanato e revestimento": ["Construtora", "Arquitetura e design de interiores", "Reforma residencial"],
  "pintura predial": ["Condomínio residencial", "Condomínio comercial", "Construtora", "Escola"],
  "textura e grafiato": ["Construtora", "Condomínio residencial", "Reforma residencial"],
  "impermeabilização de lajes": ["Condomínio residencial", "Construtora", "Indústria", "Estacionamento"],
  "telhado e cobertura metálica": ["Indústria", "Construtora", "Depósito", "Comércio"],
  "estrutura metálica": ["Construtora", "Indústria", "Depósito", "Agroindústria"],
  "pré-moldados de concreto": ["Construtora", "Loteamento", "Indústria", "Prefeitura"],
  "concreto usinado": ["Construtora", "Empreiteira", "Loteamento", "Prefeitura"],
  "sondagem de solo": ["Construtora", "Incorporadora", "Engenharia civil", "Mineração"],
  "fundações e estacas": ["Construtora", "Incorporadora", "Indústria", "Engenharia civil"],
  "escavação e movimentação de terra": ["Construtora", "Loteamento", "Mineração", "Prefeitura"],
  "drenagem e saneamento": ["Construtora", "Loteamento", "Prefeitura", "Indústria"],
  "pavimentação asfáltica": ["Prefeitura", "Loteamento", "Indústria", "Condomínio comercial"],
  "marcenaria sob medida": ["Arquitetura e design de interiores", "Escritório", "Clínica", "Comércio"],
  "móveis planejados": ["Incorporadora", "Arquitetura e design de interiores", "Escritório"],
  "vidro temperado e box": ["Construtora", "Comércio", "Hotel", "Academia"],
  "persianas e cortinas": ["Escritório", "Clínica", "Hotel", "Condomínio residencial"],
  "papel de parede e adesivagem": ["Comércio", "Escritório", "Clínica", "Arquitetura"],
  "iluminação e luminotécnica": ["Arquitetura e design de interiores", "Comércio", "Hotel", "Restaurante"],
  "automação residencial": ["Incorporadora", "Arquitetura e design de interiores", "Condomínio de alto padrão"],

  // ── Indústria: mais especialidades ──
  "corte e dobra de chapas": ["Indústria metalúrgica", "Serralheria", "Construtora", "Fabricante de máquinas"],
  "corte a laser": ["Indústria metalúrgica", "Serralheria", "Fabricante de máquinas", "Comunicação visual"],
  "galvanização e zincagem": ["Indústria metalúrgica", "Serralheria", "Construtora", "Estrutura metálica"],
  "anodização": ["Indústria de alumínio", "Esquadrias de alumínio", "Fabricante de máquinas"],
  "pintura eletrostática": ["Indústria metalúrgica", "Serralheria", "Fabricante de móveis", "Esquadrias"],
  "tratamento térmico de metais": ["Indústria metalúrgica", "Usinagem", "Fabricante de máquinas", "Autopeças"],
  "injeção plástica": ["Indústria de embalagens", "Fabricante de eletrodomésticos", "Autopeças", "Brinquedos"],
  "sopro de plásticos": ["Indústria de embalagens", "Distribuidora de bebidas", "Cosméticos", "Alimentícia"],
  "termoformagem": ["Indústria alimentícia", "Embalagens", "Cosméticos", "Farmacêutica"],
  "fabricação de embalagens": ["Indústria alimentícia", "Cosméticos", "Farmacêutica", "Comércio"],
  "rotulagem e etiquetas": ["Indústria alimentícia", "Cosméticos", "Farmacêutica", "Vinícola"],
  "borracha e vedação": ["Indústria", "Autopeças", "Manutenção industrial", "Petroquímica"],
  "mangueiras industriais": ["Indústria", "Mineração", "Agroindústria", "Petroquímica"],
  "correias transportadoras": ["Mineração", "Indústria alimentícia", "Logística", "Agroindústria"],
  "rolamentos e transmissão": ["Indústria", "Manutenção industrial", "Agroindústria", "Mineração"],
  "manutenção de motores elétricos": ["Indústria", "Mineração", "Saneamento", "Agroindústria"],
  "bombas industriais": ["Saneamento", "Petroquímica", "Indústria química", "Mineração"],
  "compressores de ar": ["Indústria", "Oficina mecânica", "Hospital", "Mineração"],
  "vasos de pressão": ["Petroquímica", "Indústria alimentícia", "Usina", "Frigorífico"],
  "tubulação industrial": ["Petroquímica", "Indústria química", "Usina", "Saneamento"],
  "calibração de instrumentos": ["Indústria", "Laboratório", "Farmacêutica", "Metrologia"],
  "manutenção preditiva": ["Indústria", "Mineração", "Usina", "Papel e celulose"],
  "lubrificação industrial": ["Indústria", "Mineração", "Frota de veículos", "Agroindústria"],
  "abrasivos e ferramentas de corte": ["Indústria metalúrgica", "Usinagem", "Serralheria", "Marmoraria"],
  "epi e segurança do trabalho": ["Indústria", "Construtora", "Mineração", "Frigorífico"],
  "sinalização industrial": ["Indústria", "Construtora", "Logística", "Estacionamento"],

  // ── Automotivo ──
  "funilaria e pintura automotiva": ["Frota de veículos", "Locadora de veículos", "Seguradora", "Transportadora"],
  "auto elétrica": ["Transportadora", "Frota de veículos", "Locadora de veículos", "Ônibus"],
  "retífica de motores": ["Transportadora", "Frota de veículos", "Maquinário agrícola", "Ônibus"],
  "borracharia e pneus": ["Transportadora", "Frota de veículos", "Locadora de veículos", "Construtora"],
  "guincho e reboque": ["Seguradora", "Locadora de veículos", "Transportadora", "Concessionária"],
  "rastreamento veicular": ["Transportadora", "Locadora de veículos", "Frota de veículos", "Seguradora"],
  "higienização de veículos": ["Locadora de veículos", "Concessionária", "Frota de veículos", "Aplicativo de transporte"],
  "adesivagem de frota": ["Transportadora", "Distribuidora", "Franquia", "Frota de veículos"],
  "manutenção de empilhadeiras": ["Logística e armazenagem", "Indústria", "Supermercado", "Construtora"],
  "locação de empilhadeiras": ["Logística e armazenagem", "Indústria", "Evento", "Construtora"],

  // ── Tecnologia e comunicação ──
  "cabeamento estruturado": ["Escritório", "Indústria", "Condomínio comercial", "Escola"],
  "infraestrutura de rede": ["Escritório", "Indústria", "Hotel", "Hospital"],
  "provedor de internet": ["Condomínio residencial", "Escritório", "Comércio", "Indústria"],
  "telefonia voip e pabx": ["Escritório", "Clínica", "Call center", "Hotel"],
  "suporte técnico de ti": ["Escritório", "Clínica", "Comércio", "Escola"],
  "backup e nuvem": ["Escritório", "Clínica", "Contabilidade", "Advocacia"],
  "manutenção de computadores": ["Escritório", "Escola", "Comércio", "Clínica"],
  "locação de equipamentos de ti": ["Evento", "Escritório", "Escola", "Call center"],
  "outsourcing de impressão": ["Escritório", "Escola", "Clínica", "Contabilidade"],
  "digitalização de documentos": ["Contabilidade", "Advocacia", "Cartório", "Hospital"],
  "assinatura digital e certificado": ["Contabilidade", "Advocacia", "Empresa em geral", "Cartório"],
  "erp e sistemas de gestão": ["Indústria", "Comércio", "Distribuidora", "Construtora"],
  "automação comercial e pdv": ["Comércio", "Restaurante", "Farmácia", "Supermercado"],
  "e-commerce e marketplace": ["Indústria", "Distribuidora", "Comércio", "Confecção"],

  // ── Marketing e comunicação ──
  "comunicação visual e fachadas": ["Comércio", "Franquia", "Restaurante", "Condomínio comercial"],
  "produção de vídeo institucional": ["Indústria", "Construtora", "Franquia", "Escola"],
  "assessoria de imprensa": ["Indústria", "Startup", "Hospital", "Instituição de ensino"],
  "gestão de redes sociais": ["Comércio", "Restaurante", "Clínica", "Academia"],
  "tráfego pago": ["E-commerce", "Clínica", "Imobiliária", "Escola"],
  "brindes corporativos": ["Indústria", "Empresa em geral", "Evento", "Franquia"],
  "uniformes profissionais": ["Indústria", "Restaurante", "Hospital", "Construtora"],
  "sinalização e placas": ["Condomínio comercial", "Comércio", "Indústria", "Prefeitura"],

  // ── Eventos ──
  "locação de tendas e estruturas": ["Evento", "Prefeitura", "Construtora", "Feira"],
  "locação de mobiliário para eventos": ["Buffet de eventos", "Evento corporativo", "Hotel", "Feira"],
  "montagem de estandes": ["Feira e exposição", "Indústria", "Franquia", "Shopping"],
  "segurança para eventos": ["Evento", "Casa de shows", "Prefeitura", "Feira"],
  "banheiro químico": ["Construtora", "Evento", "Prefeitura", "Feira"],
  "catering corporativo": ["Empresa em geral", "Indústria", "Escritório", "Evento"],

  // ── Logística e comércio exterior ──
  "armazém geral": ["Indústria", "Distribuidora", "E-commerce", "Importadora"],
  "fulfillment e-commerce": ["E-commerce", "Marketplace", "Confecção", "Cosméticos"],
  "transporte refrigerado": ["Indústria alimentícia", "Frigorífico", "Farmacêutica", "Supermercado"],
  "transporte de cargas perigosas": ["Petroquímica", "Indústria química", "Mineração", "Posto de combustível"],
  "agenciamento de cargas": ["Importadora", "Exportadora", "Indústria", "Distribuidora"],
  "assessoria em importação": ["Importadora", "Indústria", "Comércio", "Distribuidora"],
  "paletes e embalagem para transporte": ["Indústria", "Logística e armazenagem", "Exportadora", "Distribuidora"],

  // ── Agro ──
  "pulverização agrícola com drone": ["Fazenda", "Agroindústria", "Cooperativa agrícola", "Usina de cana"],
  "colheita mecanizada": ["Fazenda", "Usina de cana", "Cooperativa agrícola", "Agroindústria"],
  "manutenção de máquinas agrícolas": ["Fazenda", "Cooperativa agrícola", "Usina de cana", "Agroindústria"],
  "silos e armazenagem de grãos": ["Fazenda", "Cooperativa agrícola", "Agroindústria", "Cerealista"],
  "análise de solo": ["Fazenda", "Cooperativa agrícola", "Consultoria agronômica", "Agroindústria"],
  "sementes e mudas": ["Fazenda", "Cooperativa agrícola", "Paisagismo", "Reflorestamento"],
  "nutrição animal": ["Fazenda", "Frigorífico", "Cooperativa agrícola", "Avicultura"],
  "medicamentos veterinários": ["Clínica veterinária", "Fazenda", "Pet shop", "Frigorífico"],
  "cercas e currais": ["Fazenda", "Cooperativa agrícola", "Haras", "Frigorífico"],

  // ── Saúde ──
  "manutenção de equipamentos médicos": ["Hospital", "Clínica médica", "Laboratório", "Clínica odontológica"],
  "gases medicinais": ["Hospital", "Clínica médica", "Home care", "Laboratório"],
  "esterilização de materiais": ["Hospital", "Clínica odontológica", "Clínica médica", "Laboratório"],
  "descarte de resíduos hospitalares": ["Hospital", "Clínica médica", "Laboratório", "Clínica veterinária"],
  "software para clínicas": ["Clínica médica", "Clínica odontológica", "Laboratório", "Fisioterapia"],
  "prótese dentária": ["Clínica odontológica", "Dentista", "Hospital"],
  "óptica e lentes": ["Clínica oftalmológica", "Plano de saúde", "Família/Pessoa física"],
  "equipamentos de fisioterapia": ["Clínica de fisioterapia", "Hospital", "Academia", "Home care"],
  "medicina do trabalho": ["Indústria", "Construtora", "Transportadora", "Empresa em geral"],
  "exames ocupacionais": ["Indústria", "Construtora", "Empresa em geral", "Transportadora"],

  // ── Serviços empresariais ──
  "consultoria tributária": ["Indústria", "Comércio", "Distribuidora", "Construtora"],
  "perícia contábil": ["Advocacia", "Empresa em geral", "Seguradora"],
  "assessoria trabalhista": ["Indústria", "Construtora", "Comércio", "Transportadora"],
  "terceirização de mão de obra": ["Indústria", "Condomínio comercial", "Construtora", "Hospital"],
  "cobrança e recuperação de crédito": ["Comércio", "Clínica", "Escola", "Distribuidora"],
  "consultoria em lgpd": ["E-commerce", "Clínica", "Escola", "Empresa em geral"],
  "certificação iso": ["Indústria", "Construtora", "Laboratório", "Transportadora"],
  "consultoria em processos": ["Indústria", "Distribuidora", "Comércio", "Hospital"],
  "pesquisa de mercado": ["Indústria", "Franquia", "E-commerce", "Incorporadora"],
  "coworking e escritório virtual": ["Startup", "Profissional autônomo", "Empresa em geral", "Representante comercial"],
  "locação de impressoras": ["Escritório", "Escola", "Contabilidade", "Clínica"],
  "arquivo e guarda de documentos": ["Contabilidade", "Advocacia", "Hospital", "Cartório"],

  // ── Educação e capacitação ──
  "treinamento nr (segurança)": ["Indústria", "Construtora", "Transportadora", "Mineração"],
  "escola de idiomas corporativa": ["Empresa em geral", "Indústria", "Multinacional", "Hotel"],
  "cursos técnicos": ["Indústria", "Empresa em geral", "Prefeitura", "Sindicato"],
  "consultoria pedagógica": ["Escola", "Creche", "Instituição de ensino", "Editora"],

  // ── Alimentação e bebidas ──
  "distribuidora de bebidas": ["Restaurante", "Bar", "Hotel", "Supermercado"],
  "distribuidora de embalagens": ["Restaurante", "Padaria", "E-commerce", "Indústria alimentícia"],
  "fornecedor de hortifruti": ["Restaurante", "Supermercado", "Hotel", "Buffet de eventos"],
  "frigorífico e distribuição de carnes": ["Restaurante", "Supermercado", "Açougue", "Buffet de eventos"],
  "torrefação de café": ["Cafeteria", "Restaurante", "Hotel", "Empresa (café corporativo)"],
  "manutenção de equipamentos de cozinha": ["Restaurante", "Hotel", "Padaria", "Buffet de eventos"],
  "consultoria em segurança alimentar": ["Restaurante", "Indústria alimentícia", "Supermercado", "Hotel"],

  // ── Têxtil e confecção ──
  "confecção de uniformes": ["Indústria", "Escola", "Hospital", "Restaurante"],
  "bordado e estamparia": ["Confecção", "Franquia", "Escola", "Evento"],
  "lavanderia industrial": ["Hotel", "Hospital", "Restaurante", "Indústria"],
  "tinturaria e acabamento têxtil": ["Confecção", "Indústria têxtil", "Malharia"],

  // ── Imobiliário ──
  "administração de imóveis": ["Proprietário de imóvel", "Incorporadora", "Investidor imobiliário"],
  "vistoria de imóveis": ["Imobiliária", "Construtora", "Seguradora", "Administradora de condomínios"],
  "regularização de imóveis": ["Proprietário de imóvel", "Incorporadora", "Loteamento", "Construtora"],
  "corretagem comercial": ["Franquia", "Indústria", "Comércio", "Investidor imobiliário"],
  "home staging e decoração para venda": ["Imobiliária", "Incorporadora", "Corretor de imóveis"],

  // ── Fornecedores dos próprios prestadores ──
  // Sem estes, quem presta serviço industrial não via anúncio nenhum:
  // ninguém listava "jateamento abrasivo" ou "caldeiraria" como cliente.
  "distribuidora de abrasivos": ["Jateamento abrasivo", "Marmoraria", "Serralheria", "Caldeiraria"],
  "distribuidora de tintas industriais": ["Pintura industrial", "Jateamento abrasivo", "Serralheria", "Construtora"],
  "consumíveis de solda": ["Solda industrial", "Caldeiraria", "Serralheria", "Estrutura metálica"],
  "distribuidora de aço e metais": ["Serralheria", "Caldeiraria", "Estrutura metálica", "Usinagem"],
  "peças para máquinas pesadas": ["Terraplanagem", "Demolição", "Locação de equipamentos", "Mineração"],
  "seguro de frota": ["Transportadora", "Transporte de cargas", "Aluguel de caminhões", "Locadora de veículos"],
  "combustível e arla para frotas": ["Transportadora", "Transporte de cargas", "Frota de veículos", "Terraplanagem"],
  "produtos químicos para limpeza": ["Dedetização e controle de pragas", "Limpeza industrial", "Conservação e zeladoria", "Lavanderia industrial"],
  "distribuidora de material elétrico": ["Elétrica industrial", "Instalação de ar-condicionado", "Automação residencial", "Construtora"],
  "distribuidora de material hidráulico": ["Desentupimento", "Impermeabilização", "Construtora", "Manutenção predial"],
  "fornecedor de andaimes e escoras": ["Andaimes e acesso", "Construtora", "Pintura predial", "Manutenção predial"],
  "locação de plataformas elevatórias": ["Limpeza de fachadas", "Pintura predial", "Manutenção predial", "Montagem industrial"],
  "distribuidora de epi": ["Jateamento abrasivo", "Caldeiraria", "Demolição", "Dedetização e controle de pragas"],
  "software de gestão de obras": ["Construtora", "Empreiteira", "Terraplanagem", "Incorporadora"],
  "software para transportadoras": ["Transportadora", "Transporte de cargas", "Agenciamento de cargas", "Armazém geral"],
  "software para escritórios": ["Advocacia", "Contabilidade", "Arquitetura e design de interiores", "Empresa em geral"],

  // ── Universais: atendem qualquer empresa em operação ──
  "contabilidade digital": ["Empresa em geral", "Startup", "Profissional autônomo"],
  "abertura e regularização de empresas": ["Empresa em geral", "Profissional autônomo", "Startup"],
  "seguro empresarial": ["Empresa em geral", "Indústria", "Comércio"],
  "plano de saúde empresarial": ["Empresa em geral", "Indústria", "Comércio"],
  "vale-refeição e benefícios": ["Empresa em geral", "Indústria", "Comércio"],
  "consultoria de marketing": ["Empresa em geral", "Comércio", "Clínica"],
  "criação de site e landing page": ["Empresa em geral", "Comércio", "Clínica"],
  "telefonia empresarial": ["Empresa em geral", "Escritório", "Comércio"],
  "energia no mercado livre": ["Indústria", "Empresa em geral", "Supermercado", "Shopping"],
  "consultoria de crédito empresarial": ["Empresa em geral", "Indústria", "Comércio"],
  "maquininha de cartão e meios de pagamento": ["Comércio", "Restaurante", "Clínica", "Empresa em geral"],
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
 * Normaliza para comparação: minúsculas, sem acento, sem espaço extra.
 *
 * Sem tirar os acentos, "industrial" não casava com "Indústria" e um
 * assinante de manutenção industrial nunca via fornecedor nenhum — o
 * `includes` compara caractere a caractere, e "ú" não é "u". Era a
 * causa de 75% dos segmentos ficarem sem anúncio direcionado.
 */
function normalizarSegmento(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

/**
 * Rótulos de cliente que valem para QUALQUER empresa.
 *
 * Contabilidade, seguro, uniforme e TI atendem todo mundo — uma agência
 * de marketing é "empresa em geral" tanto quanto uma metalúrgica. Sem
 * esta regra, a comparação por substring nunca ligava as duas pontas
 * ("marketing digital" não contém "empresa em geral"), e 71% dos
 * segmentos ficavam sem nenhum anunciante direcionado.
 *
 * É o que sustenta a ideia central do produto: os serviços se cruzam.
 * Um condomínio contrata rede de proteção, jardinagem e piscina; uma
 * marmoraria contrata contador, seguro e uniforme.
 */
const CLIENTES_UNIVERSAIS = [
  "empresa em geral",
  "empresa",
  "pme",
  "pequena empresa",
  "escritorio",
]

function ehClienteUniversal(clienteNormalizado: string): boolean {
  return CLIENTES_UNIVERSAIS.some(
    (u) => clienteNormalizado === u || clienteNormalizado.startsWith(u + " (")
  )
}

/**
 * Retorna os segmentos-clientes típicos para um segmento de prestador.
 * Faz correspondência por substring (sem acento, case-insensitive) para
 * tolerar variações no texto digitado.
 */
export function obterSegmentosClientes(segmentoPrestador: string): string[] {
  const chave = normalizarSegmento(segmentoPrestador)

  for (const [seg, clientes] of Object.entries(MAPA_SEGMENTOS_CLIENTES)) {
    const segNorm = normalizarSegmento(seg)
    if (chave.includes(segNorm) || segNorm.includes(chave)) {
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
  const alvo = normalizarSegmento(segmentoDoVisitante)
  if (!alvo) return []

  // Separa em duas listas porque a ordem importa: um distribuidor de
  // rochas ornamentais é muito mais relevante para uma marmoraria do
  // que um seguro empresarial. Misturados, o específico se perderia
  // entre dezenas de universais e o banner viraria ruído.
  const especificos: string[] = []
  const universais: string[] = []

  for (const [segmentoFornecedor, clientes] of Object.entries(MAPA_SEGMENTOS_CLIENTES)) {
    // Ignora o próprio segmento — não faz sentido anunciar concorrente
    if (normalizarSegmento(segmentoFornecedor) === alvo) continue

    let casouEspecifico = false
    let casouUniversal = false

    for (const cliente of clientes) {
      const c = normalizarSegmento(cliente)

      if (ehClienteUniversal(c)) {
        casouUniversal = true
        continue
      }
      // Termos muito curtos casariam com quase tudo por substring
      // ("ti" dentro de "construtora"), então exige igualdade neles.
      const casa = c.length <= 3 ? c === alvo : c.includes(alvo) || alvo.includes(c)
      if (casa) {
        casouEspecifico = true
        break
      }
    }

    if (casouEspecifico) especificos.push(segmentoFornecedor)
    else if (casouUniversal) universais.push(segmentoFornecedor)
  }

  return [...especificos, ...universais]
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
