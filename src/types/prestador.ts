// Tipos relacionados a autenticação, perfis de prestadores e assinaturas

/**
 * Status possíveis de uma assinatura
 */
export type StatusAssinatura = "pendente" | "trial" | "ativa" | "atraso" | "cancelada"

/**
 * Planos de assinatura disponíveis
 */
export type TipoPlano = "mensal" | "anual"

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
 * Apenas 'BR' está funcional agora — os demais aparecem na UI
 * como "em breve" até a internacionalização ser implementada.
 */
export const PAISES_DISPONIVEIS = [
  { codigo: "BR", nome: "Brasil", moeda: "BRL", idioma: "pt-BR", disponivel: true },
  { codigo: "US", nome: "Estados Unidos", moeda: "USD", idioma: "en-US", disponivel: false },
  { codigo: "PT", nome: "Portugal", moeda: "EUR", idioma: "pt-PT", disponivel: false },
] as const

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
