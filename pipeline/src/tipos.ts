// ═══════════════════════════════════════════════════════════════
// TIPOS DO PIPELINE DE DADOS — Reino Unido
//
// Estes tipos SÃO o contrato do dado. Todo campo que pode vir vazio
// está marcado como `| null` de propósito: o TypeScript obriga quem
// consome a decidir o que fazer com a ausência, em vez de deixar um
// `undefined` virar string "undefined" na tela do assinante.
//
// Regra que atravessa o arquivo inteiro: NADA de tipo opcional para
// contato. Contato ou existe, ou é `null` com motivo declarado.
// ═══════════════════════════════════════════════════════════════

/** Camada de custo de um provedor. A `paga` só entra com chave configurada. */
export type Camada = "gratuita" | "paga"

/** Contrato mínimo de qualquer peça plugável do pipeline. */
export interface Provedor {
  /** Identificador estável — vai gravado em cada registro, para auditoria. */
  readonly id: string
  readonly camada: Camada
  /** Descrição curta, usada no relatório de execução. */
  readonly descricao: string
  /**
   * `false` quando falta chave/credencial. O orquestrador PULA o provedor
   * indisponível e segue para o próximo — nunca lança erro. Ausência de
   * chave paga reduz a taxa de acerto; não quebra o fluxo.
   */
  disponivel(): boolean
}

// ── Registro oficial ──────────────────────────────────────────────

export type SituacaoEmpresa =
  | "ativa"
  | "dissolvida"
  | "liquidacao"
  | "insolvencia"
  | "outra"

/**
 * Empresa como o registro público a entrega. Todos os campos aqui são
 * de completude medida em 99% ou mais na amostra de Grande Manchester —
 * por isso não são anuláveis, com exceção de `cidade`.
 */
export interface EmpresaRegistro {
  /** Chave natural. Único e estável. É a chave de deduplicação. */
  numeroRegistro: string
  nome: string
  endereco1: string
  endereco2: string
  cidade: string | null
  condado: string
  pais: string
  cep: string
  /** Distrito postal (parte externa do CEP): "M28" de "M28 3PT". */
  distritoPostal: string
  categoria: string
  situacao: SituacaoEmpresa
  situacaoBruta: string
  /** Códigos de atividade. 1 a 4 na prática. */
  codigosSic: string[]
  dataConstituicao: string | null
  /** Categoria de contas — `DORMANT` e `NO ACCOUNTS FILED` = sem sinal de operação. */
  categoriaContas: string
  dataUltimaConfirmacao: string | null
  /** Procedência: qual arquivo/versão da fonte produziu este registro. */
  fonte: string
  coletadoEm: string
}

/**
 * Sinal de que o endereço registrado é de contador/agente de constituição.
 * Medido: 38% da amostra tem 5 ou mais coabitantes, 17% tem mais de 100.
 */
export interface DensidadeEndereco {
  empresasNoMesmoEndereco: number
  enderecoDeMassa: boolean
}

export type EmpresaEnriquecida = EmpresaRegistro & DensidadeEndereco

// ── Trava de identidade ───────────────────────────────────────────

/**
 * Força da prova de que um site pertence à empresa do registro.
 * A ordem do union é a ordem de força — ver `FORCA_DA_PROVA`.
 */
export type NivelDeProva =
  | "numero_registro"
  | "cep_registrado"
  | "nome_e_dominio"
  | "nenhuma"

/** Peso numérico de cada nível, para ordenar candidatos concorrentes. */
export const FORCA_DA_PROVA: Record<NivelDeProva, number> = {
  numero_registro: 100,
  cep_registrado: 80,
  nome_e_dominio: 55,
  nenhuma: 0,
}

/**
 * Confiança publicável ao assinante. Casada com o nível de prova,
 * nunca inventada.
 */
export const CONFIANCA_DA_PROVA: Record<NivelDeProva, number> = {
  numero_registro: 0.99,
  cep_registrado: 0.92,
  nome_e_dominio: 0.7,
  nenhuma: 0,
}

export interface ResultadoIdentidade {
  nivel: NivelDeProva
  /** `false` para `nenhuma`. É a trava: sem prova, o site não é aceito. */
  aceito: boolean
  confianca: number
  /** Texto curto e auditável do que casou. Vai para o registro. */
  detalhe: string
  /** Sinais contrários encontrados (CEP de outro distrito, página estacionada). */
  contraindicacoes: string[]
}

// ── Descoberta de site ────────────────────────────────────────────

export interface CandidatoDominio {
  /** Host completo, já com `www.` quando for o caso. */
  host: string
  /** Id do provedor que sugeriu — vai gravado no registro final. */
  origemProvedorId: string
  /** Ordem de tentativa dentro do provedor. Menor = mais provável. */
  ordem: number
}

export interface ProvedorDeDominio extends Provedor {
  /**
   * Devolve candidatos SEM validar. Quem valida é a trava de identidade.
   * Isso é de propósito: separar "palpitar" de "provar" é o que torna
   * o palpite seguro.
   */
  candidatos(empresa: EmpresaRegistro): Promise<CandidatoDominio[]>
}

// ── Contato ───────────────────────────────────────────────────────

/**
 * Nível de verificação que o endereço EFETIVAMENTE recebeu.
 * Nunca prometer mais do que a camada que rodou.
 */
export type NivelVerificacao =
  | "nao_verificado"
  | "sintaxe"
  | "mx_presente"
  | "smtp_fornecedor"

export type StatusEmail =
  | "verificado"
  | "provavel"
  | "arriscado_catchall"
  | "dominio_descartavel"
  | "sem_mx"
  | "sintaxe_invalida"
  | "nao_verificado"

export interface EmailEncontrado {
  endereco: string
  /** `true` só para role account (`info@`, `sales@`…). Nominal é descartado. */
  generico: boolean
  /** Rótulo do papel: "info", "sales", "enquiries". */
  papel: string
  nivelVerificacao: NivelVerificacao
  status: StatusEmail
  /** Id do verificador que produziu o status. */
  verificadoPor: string
  /** URL exata de onde o endereço foi extraído. Procedência de campo. */
  encontradoEm: string
}

export interface TelefoneEncontrado {
  /** Formato E.164 quando possível. */
  e164: string
  /** Como aparecia na página. Normalização destrói informação. */
  original: string
  /** `true` quando o código de área corresponde ao distrito registrado. */
  areaCompativel: boolean
  encontradoEm: string
}

// ── Registro final publicado ──────────────────────────────────────

export interface RegistroPublicado {
  empresa: EmpresaEnriquecida

  /** `null` quando nenhum candidato passou na trava de identidade. */
  site: string | null
  identidade: ResultadoIdentidade
  /** Id do provedor de domínio que produziu o site aceito. */
  descobertoPor: string | null

  emails: EmailEncontrado[]
  telefones: TelefoneEncontrado[]

  /** Auditoria da execução. */
  provedoresTentados: string[]
  candidatosAvaliados: number
  paginasLidas: number
  processadoEm: string
  /** Versão do pipeline — muda quando a regra muda, para reprocessar. */
  versaoPipeline: string
}

export const VERSAO_PIPELINE = "1.0.0"

// ── Verificação de e-mail ─────────────────────────────────────────

export interface ResultadoVerificacao {
  status: StatusEmail
  nivel: NivelVerificacao
  detalhe: string
}

export interface VerificadorDeEmail extends Provedor {
  /** O nível máximo que este verificador consegue atingir. */
  readonly nivelMaximo: NivelVerificacao
  verificar(endereco: string): Promise<ResultadoVerificacao>
}

// ── Armazenamento ─────────────────────────────────────────────────

export interface RepositorioDeEmpresas {
  readonly id: string
  /**
   * Idempotente por `numeroRegistro`. Rodar duas vezes com o mesmo lote
   * não pode duplicar nada nem multiplicar contagem.
   */
  gravarLote(registros: EmpresaEnriquecida[]): Promise<{ inseridos: number; atualizados: number }>
  contar(): Promise<number>
}
