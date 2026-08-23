// ═══════════════════════════════════════════════════════════════
// NORMALIZAÇÃO DE TEXTO
//
// Regra do projeto: normalizar destrói informação. Toda função aqui
// devolve o valor normalizado SEM apagar o original — quem chama guarda
// os dois lados. Ver `TelefoneEncontrado.original` em tipos.ts.
// ═══════════════════════════════════════════════════════════════

/** Sufixos societários e ruído que não identificam a empresa. */
const SUFIXOS_SOCIETARIOS = new Set([
  "LTD", "LTD.", "LIMITED", "PLC", "P.L.C.", "LLP", "LP", "CIC", "CIO",
  "COMPANY", "CO", "CO.", "THE", "AND", "&", "HOLDINGS", "HOLDING",
  "UK", "U.K.", "GB", "UNITED", "KINGDOM",
])

/**
 * Palavras que aparecem em milhares de nomes e não distinguem ninguém.
 * "CONSTRUCTION SERVICES LTD" existe às centenas — casar por essas
 * palavras é o que produzia os falsos positivos medidos (26% de precisão).
 */
const PALAVRAS_GENERICAS = new Set([
  "SERVICES", "SERVICE", "SOLUTIONS", "GROUP", "TRADING", "SUPPLIES",
  "SUPPLY", "CONSTRUCTION", "CONSTRUCTIONS", "BUILDING", "BUILDINGS",
  "BUILDERS", "BUILDER", "CONTRACTORS", "CONTRACTING", "ENGINEERING",
  "ENGINEERS", "TRANSPORT", "TRANSPORTATION", "LOGISTICS", "HAULAGE",
  "DEVELOPMENTS", "DEVELOPMENT", "PROPERTIES", "PROPERTY", "INTERNATIONAL",
  "GLOBAL", "NATIONAL", "NORTH", "SOUTH", "EAST", "WEST", "NORTHERN",
  "MANCHESTER", "LONDON", "BIRMINGHAM", "LEEDS", "BOLTON", "OLDHAM",
  "STOCKPORT", "WIGAN", "SALFORD", "ROCHDALE", "BURY",
  "PROJECTS", "PROJECT", "CONSULTING", "CONSULTANCY", "MANAGEMENT",
  "ENTERPRISES", "ENTERPRISE", "INDUSTRIES", "INDUSTRIAL", "COMMERCIAL",
  "GENERAL", "ASSOCIATES", "PARTNERS", "PARTNERSHIP", "WORKS",
])

export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "")
}

/**
 * Tokens úteis do nome da empresa: maiúsculas, sem pontuação,
 * sem sufixo societário.
 */
export function tokensDoNome(nome: string): string[] {
  const limpo = semAcento(nome).toUpperCase().replace(/&/g, " AND ")
  return limpo
    .replace(/[^A-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !SUFIXOS_SOCIETARIOS.has(t))
}

/**
 * Tokens que de fato distinguem a empresa: os do nome, menos os
 * genéricos. É o conjunto que a trava de identidade exige casar.
 */
export function tokensDistintivos(nome: string): string[] {
  const t = tokensDoNome(nome).filter((x) => !PALAVRAS_GENERICAS.has(x))
  // Nome inteiro genérico ("NORTH WEST CONSTRUCTION LTD"): sem token
  // distintivo, nenhuma prova de nome é possível — e é correto que não
  // seja. Devolve vazio e a trava rejeita.
  return t.filter((x) => x.length >= 3)
}

export function ehGenerica(token: string): boolean {
  return PALAVRAS_GENERICAS.has(token)
}

/** Remove tags, script e style; devolve o texto visível em linha única. */
export function textoVisivel(html: string): string {
  return html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
}

// ── CEP britânico ────────────────────────────────────────────────

const RE_CEP = /\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s?(\d[A-Z]{2})\b/g

export function normalizarCep(cep: string): string {
  const c = cep.toUpperCase().replace(/\s+/g, "")
  if (c.length < 5) return c
  return `${c.slice(0, c.length - 3)} ${c.slice(c.length - 3)}`
}

export function distritoPostal(cep: string): string {
  const c = normalizarCep(cep)
  const p = c.split(" ")
  return p[0] ?? ""
}

/** Área postal: a parte só de letras. "M28" → "M", "BL6" → "BL". */
export function areaPostal(cep: string): string {
  const m = /^([A-Z]{1,2})/.exec(distritoPostal(cep))
  return m ? m[1]! : ""
}

/** Todos os CEPs britânicos citados num texto, em forma canônica. */
export function cepsNoTexto(texto: string): string[] {
  const alvo = texto.toUpperCase()
  const achados = new Set<string>()
  RE_CEP.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = RE_CEP.exec(alvo)) !== null) {
    achados.add(`${m[1]} ${m[2]}`)
  }
  return [...achados]
}

// ── Telefone britânico ───────────────────────────────────────────

const RE_TELEFONE = /(?:\+44\s?|\b0)(?:\d[\s\-.()]?){8,10}\d/g

export function normalizarTelefoneUk(bruto: string): string | null {
  let d = bruto.replace(/[^\d+]/g, "")
  if (d.startsWith("+44")) d = "0" + d.slice(3)
  else if (d.startsWith("0044")) d = "0" + d.slice(4)
  else if (d.startsWith("44") && d.length >= 11) d = "0" + d.slice(2)
  if (!d.startsWith("0")) return null
  if (d.length < 10 || d.length > 11) return null
  // 011x/01x1 e 02x são geográficos; 03/07/08 são não-geográficos válidos.
  if (!/^0[1-8]/.test(d)) return null
  return "+44" + d.slice(1)
}

export function telefonesNoTexto(texto: string): Array<{ e164: string; original: string }> {
  const vistos = new Map<string, string>()
  RE_TELEFONE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = RE_TELEFONE.exec(texto)) !== null) {
    const original = m[0].trim()
    const e164 = normalizarTelefoneUk(original)
    if (e164 !== null && !vistos.has(e164)) vistos.set(e164, original)
  }
  return [...vistos].map(([e164, original]) => ({ e164, original }))
}

/**
 * Código de área geográfico de um número em E.164 britânico.
 * Devolve `null` para não-geográficos (03, 07, 08) — para esses não
 * existe "área compatível", e fingir que existe seria dado errado.
 */
export function codigoDeArea(e164: string): string | null {
  if (!e164.startsWith("+44")) return null
  const nacional = "0" + e164.slice(3)
  if (/^0[378]/.test(nacional)) return null
  // 0161, 0113… (4 dígitos) — cidades grandes
  if (/^01\d1/.test(nacional) || /^02\d/.test(nacional)) {
    return /^02/.test(nacional) ? nacional.slice(0, 3) : nacional.slice(0, 4)
  }
  // 01204, 01942… (5 dígitos) — o resto
  return nacional.slice(0, 5)
}
