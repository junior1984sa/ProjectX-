// Tipos relacionados a autenticação, perfis de prestadores e assinaturas

/**
 * Status possíveis de uma assinatura
 */
export type StatusAssinatura = "pendente" | "trial" | "ativa" | "atraso" | "cancelada"

/**
 * Planos de assinatura disponíveis
 */
export type TipoPlano = "mensal" | "semestral" | "anual"

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
 * Modo de busca de prospecção: "pares" busca o mesmo segmento (útil
 * para benchmarking, parcerias, ou achar quem terceiriza); "clientes"
 * busca segmentos que tipicamente CONTRATAM o serviço do prestador —
 * essa é a prospecção de verdade, voltada a gerar leads de venda.
 */
export type ModoBusca = "pares" | "clientes"

/**
 * Mapeamento segmento → segmentos-clientes típicos. Cobre os ramos já
 * sugeridos no app. Esta tabela é a base inicial — conforme a base de
 * segmentos crescer (novos países, novos ramos), o caminho de evolução
 * é trocar esta função por uma chamada de IA que infere os segmentos-
 * clientes dinamicamente a partir de qualquer texto livre, em qualquer
 * idioma, sem depender de manutenção manual desta tabela.
 */
const MAPA_SEGMENTOS_CLIENTES: Record<string, string[]> = {
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
  "clínica odontológica": ["Plano de saúde", "Empresa (convênio corporativo)", "Escola (parceria)"],
  "restaurante": ["Empresa (eventos corporativos)", "Buffet e eventos", "Hotel"],
  "academia": ["Empresa (parceria corporativa/wellness)", "Condomínio residencial", "Plano de saúde"],
  "mecânica automotiva": ["Locadora de veículos", "Frota empresarial", "Transportadora", "Concessionária"],
  "advocacia": ["Construtora", "Indústria", "Imobiliária", "Empresa em geral"],
  "contabilidade": ["Construtora", "Comércio", "Indústria", "Empresa em geral"],
  "construção civil": ["Incorporadora", "Loja de material de construção", "Engenharia", "Imobiliária"],
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
  // esse caso (ex: cair no modo "pares", ou avisar que o segmento é
  // novo e ainda não tem mapeamento de clientes configurado).
  return []
}
