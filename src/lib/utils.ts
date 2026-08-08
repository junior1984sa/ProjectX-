import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Empresa, Estatisticas, ExportacaoCSV } from "@/types/empresa"
import i18n from "@/i18n"

/**
 * Combina classes CSS com suporte a Tailwind (shadcn/ui padrão)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata número de telefone para exibição
 */
export function formatarTelefone(tel: string | null): string {
  if (!tel) return "—"
  return tel
}

/**
 * Formata score como estrelas (ex: "★★★☆☆")
 */
export function formatarEstrelas(score: number): string {
  const cheia = "★"
  const vazia = "☆"
  const inteiro = Math.floor(score)
  const meio = score - inteiro >= 0.5 ? "½" : ""
  return cheia.repeat(inteiro) + meio + vazia.repeat(5 - inteiro - (meio ? 1 : 0))
}

/**
 * Retorna classe CSS baseada no score
 */
export function classeScore(score: number): string {
  if (score >= 4) return "score-alto"
  if (score >= 2) return "score-medio"
  return "score-baixo"
}

/**
 * Retorna cor do marcador do mapa baseada no score
 */
export function corMarcadorPorScore(score: number): string {
  if (score >= 4) return "#5fbf7a"   // verde (alta aderência)
  if (score >= 2) return "#d4b06a"   // dourado fosco (média)
  return "#c0635c"                    // vermelho fosco (baixa)
}

/**
 * Calcula estatísticas de um array de empresas
 */
export function calcularEstatisticas(empresas: Empresa[]): Estatisticas {
  if (empresas.length === 0) {
    return {
      total: 0,
      comTelefone: 0,
      comEmail: 0,
      scoreMedia: 0,
      porBairro: {},
      porCanal: { telefone: 0, email: 0, website: 0, redesSociais: 0 },
    }
  }

  const comTelefone = empresas.filter((e) => e.telefone).length
  const comEmail = empresas.filter((e) => e.email).length
  const scoreMedia =
    empresas.reduce((acc, e) => acc + e.score, 0) / empresas.length

  // Contagem por bairro
  const porBairro: Record<string, number> = {}
  empresas.forEach((e) => {
    porBairro[e.bairro] = (porBairro[e.bairro] || 0) + 1
  })

  // Canais de contato
  const porCanal = {
    telefone: comTelefone,
    email: comEmail,
    website: empresas.filter((e) => e.website).length,
    redesSociais: empresas.filter((e) => e.instagram || e.facebook).length,
  }

  return {
    total: empresas.length,
    comTelefone,
    comEmail,
    scoreMedia: Math.round(scoreMedia * 10) / 10,
    porBairro,
    porCanal,
  }
}

/**
 * Exporta empresas para CSV
 */
export function exportarCSV(empresas: Empresa[]): ExportacaoCSV {
  const cabecalho = [
    "Nome",
    "Segmento",
    "Bairro",
    "Cidade",
    "Estado",
    "Endereço",
    "Telefone",
    "E-mail",
    "Website",
    "Instagram",
    "Score",
    "Avaliação Google",
  ].join(";")

  const linhas = empresas.map((e) =>
    [
      `"${e.nome}"`,
      `"${e.segmento}"`,
      `"${e.bairro}"`,
      `"${e.cidade}"`,
      `"${e.estado}"`,
      `"${e.endereco}"`,
      `"${e.telefone || ""}"`,
      `"${e.email || ""}"`,
      `"${e.website || ""}"`,
      `"${e.instagram || ""}"`,
      e.score,
      e.avaliacaoGoogle || "",
    ].join(";")
  )

  const conteudo = [cabecalho, ...linhas].join("\n")
  const data = new Date().toISOString().split("T")[0]
  const nomeArquivo = `prospectpro_${data}.csv`

  return { conteudo, nomeArquivo }
}

/**
 * Copia texto para a área de transferência
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Fallback para navegadores mais antigos
    const el = document.createElement("textarea")
    el.value = texto
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(el)
    return ok
  }
}

/**
 * Gera ID único simples
 */
export function gerarId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Espera N milissegundos (simula delay de API)
 */
export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Trunca texto longo com reticências
 */
export function truncar(texto: string, maxChars: number): string {
  if (texto.length <= maxChars) return texto
  return texto.substring(0, maxChars - 3) + "..."
}

/**
 * Formata número com separadores brasileiros
 */
export function formatarNumero(num: number): string {
  return num.toLocaleString("pt-BR")
}

/**
 * Gera um link do WhatsApp já direcionado para um número específico,
 * usado quando o lead tem um telefone celular válido cadastrado.
 * Inclui a mensagem com o link do portfólio/panfleto do prestador.
 */
/**
 * Texto da abordagem por WhatsApp, no idioma da interface.
 *
 * A mensagem é lida pela EMPRESA ABORDADA, não pelo assinante. Um
 * prestador em Sydney mandando "Olá! Sou..." para uma construtora
 * australiana não é só estranho: é mensagem descartada. Como o idioma
 * da interface já acompanha o país da prospecção, ele é a melhor
 * aproximação disponível do idioma de quem recebe.
 */
export function montarMensagemAbordagem(
  nomeEmpresa: string,
  nomeContatoPrestador: string,
  urlPortfolio?: string | null
): string[] {
  const linhas = [
    i18n.t("whatsapp.saudacao", { contato: nomeContatoPrestador }),
    i18n.t("whatsapp.motivo", { empresa: nomeEmpresa }),
  ]
  if (urlPortfolio) {
    linhas.push(i18n.t("whatsapp.portfolio", { url: urlPortfolio }))
  }
  linhas.push(i18n.t("whatsapp.fecho"))
  return linhas
}

export function gerarLinkWhatsAppComNumero(
  telefone: string,
  nomeEmpresa: string,
  nomeContatoPrestador: string,
  urlPortfolio?: string | null,
  codigoTelefonePais = "55"
): string {
  // O código vem do país da busca: prefixar 55 num telefone de Miami
  // ou Sydney gera link para um número brasileiro que não existe.
  const numeros = telefone.replace(/\D/g, "")

  // Austrália (0412...) e Reino Unido (07700...) escrevem o número
  // local com um zero na frente, que NÃO entra no formato
  // internacional. Mantê-lo geraria 610412... em vez de 61412...,
  // e o link não abriria conversa nenhuma.
  const semZeroInicial = numeros.replace(/^0+/, "")

  const numeroComPais = semZeroInicial.startsWith(codigoTelefonePais)
    ? semZeroInicial
    : `${codigoTelefonePais}${semZeroInicial}`

  const linhas = montarMensagemAbordagem(nomeEmpresa, nomeContatoPrestador, urlPortfolio)

  const mensagem = encodeURIComponent(linhas.join("\n"))
  return `https://wa.me/${numeroComPais}?text=${mensagem}`
}

/**
 * Gera um link do WhatsApp sem número pré-definido (modo "compartilhar"),
 * usado quando o lead não tem celular cadastrado — o prestador escolhe
 * o contato manualmente dentro do próprio WhatsApp.
 */
export function gerarLinkWhatsAppSemNumero(
  nomeEmpresa: string,
  nomeContatoPrestador: string,
  urlPortfolio?: string | null
): string {
  const linhas = montarMensagemAbordagem(nomeEmpresa, nomeContatoPrestador, urlPortfolio)

  const mensagem = encodeURIComponent(linhas.join("\n"))
  return `https://wa.me/?text=${mensagem}`
}
