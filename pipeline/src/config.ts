// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO — quem está ligado e quem está esperando pagamento
//
// Regra inegociável do projeto: a ausência de uma chave paga NUNCA
// quebra o fluxo. Ela só reduz a taxa de acerto. Por isso este arquivo
// não lança erro em nenhum caminho — ele apenas responde `false` para
// `disponivel()` e o orquestrador segue para o próximo provedor.
//
// Toda variável listada aqui está documentada em
// `estrategia/PENDENTE-PAGAMENTO.md`, com custo e ganho esperado.
// ═══════════════════════════════════════════════════════════════

function texto(nome: string): string | null {
  const v = process.env[nome]
  if (typeof v !== "string") return null
  const limpo = v.trim()
  return limpo.length > 0 ? limpo : null
}

function numero(nome: string, padrao: number): number {
  const v = texto(nome)
  if (v === null) return padrao
  const n = Number(v)
  return Number.isFinite(n) ? n : padrao
}

export interface Configuracao {
  // ── Gratuito, funciona hoje ──
  /** Chave da API do Companies House. Cadastro gratuito, sem pagamento. */
  companiesHouseApiKey: string | null

  // ── Encaixes pagos, desligados por falta de chave ──
  /** SerpApi — descoberta de site por motor de busca. US$ 10/mil (plano Production). */
  serpApiKey: string | null
  /** Verificador de e-mail por SMTP com IP limpo. ~US$ 8/mil. */
  verificadorEmailUrl: string | null
  verificadorEmailKey: string | null
  /** Qual verificador pago usar, quando houver chave. */
  verificadorEmailFornecedor: string

  // ── Ajustes de execução ──
  /** Concorrência de rede. Mais que 12 começa a derrubar o alcance. */
  concorrencia: number
  /** Timeout de cada requisição HTTP, em ms. */
  timeoutMs: number
  /** Páginas de contato lidas por site, além da home. */
  maxPaginasContato: number
  /** User-Agent declarado. Identificar-se é obrigação, não cortesia. */
  userAgent: string
  /** Diretório onde a camada bruta e a publicada são gravadas. */
  diretorioDados: string
}

export function lerConfiguracao(): Configuracao {
  return {
    companiesHouseApiKey: texto("COMPANIES_HOUSE_API_KEY"),

    serpApiKey: texto("SERPAPI_KEY"),
    verificadorEmailUrl: texto("VERIFICADOR_EMAIL_URL"),
    verificadorEmailKey: texto("VERIFICADOR_EMAIL_KEY"),
    verificadorEmailFornecedor: texto("VERIFICADOR_EMAIL_FORNECEDOR") ?? "generico",

    concorrencia: numero("PIPELINE_CONCORRENCIA", 8),
    timeoutMs: numero("PIPELINE_TIMEOUT_MS", 15000),
    maxPaginasContato: numero("PIPELINE_MAX_PAGINAS_CONTATO", 3),
    userAgent:
      texto("PIPELINE_USER_AGENT") ??
      "ProspectXBot/1.0 (+https://prospectx-oficial.vercel.app/robots)",
    diretorioDados: texto("PIPELINE_DIR_DADOS") ?? "pipeline/dados",
  }
}

/**
 * Lista o que está ligado e o que está esperando pagamento.
 * Impressa no começo de toda execução — sem isso, ninguém sabe se um
 * número ruim veio da regra ou de uma chave que faltou.
 */
export function diagnosticoDeChaves(cfg: Configuracao): {
  ligado: string[]
  desligado: Array<{ nome: string; variavel: string; efeito: string }>
} {
  const ligado: string[] = ["companies-house-snapshot (gratuito)", "heuristica-dominio (gratuito)", "common-crawl (gratuito)", "verificador-gratuito (sintaxe + MX + descartavel)"]
  const desligado: Array<{ nome: string; variavel: string; efeito: string }> = []

  if (cfg.companiesHouseApiKey) ligado.push("companies-house-api (chave gratuita)")
  else
    desligado.push({
      nome: "API do Companies House",
      variavel: "COMPANIES_HOUSE_API_KEY",
      efeito: "sem atualização diária; o snapshot mensal continua funcionando",
    })

  if (cfg.serpApiKey) ligado.push("serpapi (pago)")
  else
    desligado.push({
      nome: "SerpApi — descoberta de site por busca",
      variavel: "SERPAPI_KEY",
      efeito: "descoberta fica limitada a heurística + Common Crawl",
    })

  if (cfg.verificadorEmailUrl && cfg.verificadorEmailKey) ligado.push("verificador-pago (SMTP com IP limpo)")
  else
    desligado.push({
      nome: "Verificador de e-mail (SMTP com IP limpo)",
      variavel: "VERIFICADOR_EMAIL_URL + VERIFICADOR_EMAIL_KEY",
      efeito: "e-mail para no nível 'mx_presente'; nunca chega a 'verificado'",
    })

  return { ligado, desligado }
}
