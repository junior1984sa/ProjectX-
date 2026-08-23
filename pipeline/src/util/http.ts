// ═══════════════════════════════════════════════════════════════
// REDE — busca de páginas com timeout, robots.txt e limite de tamanho
//
// Duas coisas medidas na avaliação da fonte moldaram este arquivo:
//  1. 10% dos hosts candidatos não conectam. Timeout curto e falha
//     silenciosa são o comportamento certo — um site fora do ar não
//     pode travar o lote inteiro.
//  2. Só `www` responde em parte dos sites de PME britânica
//     (medido: monarchshelving.co.uk não serve HTTP, www serve).
//     Por isso todo host é tentado nas duas formas.
// ═══════════════════════════════════════════════════════════════

import { setTimeout as aguardar } from "node:timers/promises"

export interface RespostaPagina {
  urlFinal: string
  html: string
  status: number
}

export interface OpcoesRede {
  userAgent: string
  timeoutMs: number
}

const TAMANHO_MAXIMO = 3_000_000 // 3 MB. Página maior que isso não é página de contato.

/** GET com timeout e teto de tamanho. Nunca lança: devolve `null` na falha. */
export async function buscarPagina(
  url: string,
  op: OpcoesRede
): Promise<RespostaPagina | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), op.timeoutMs)
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": op.userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    })
    if (!r.ok) return null
    const tipo = r.headers.get("content-type") ?? ""
    if (!tipo.toLowerCase().includes("html")) return null
    const tamanho = Number(r.headers.get("content-length") ?? "0")
    if (tamanho > TAMANHO_MAXIMO) return null
    const html = await r.text()
    if (html.length < 200 || html.length > TAMANHO_MAXIMO) return null
    return { urlFinal: r.url || url, html, status: r.status }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** GET de texto puro (robots.txt, JSON de índice). Nunca lança. */
export async function buscarTexto(url: string, op: OpcoesRede): Promise<string | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), op.timeoutMs)
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": op.userAgent },
    })
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/**
 * Tenta https e http, no host dado e no seu par com/sem `www`.
 * Devolve a primeira resposta útil.
 */
export async function buscarHome(host: string, op: OpcoesRede): Promise<RespostaPagina | null> {
  const semWww = host.startsWith("www.") ? host.slice(4) : host
  const comWww = host.startsWith("www.") ? host : "www." + host
  const ordem = host.startsWith("www.") ? [comWww, semWww] : [semWww, comWww]
  for (const h of ordem) {
    for (const esquema of ["https://", "http://"]) {
      const r = await buscarPagina(esquema + h, op)
      if (r !== null) return r
    }
  }
  return null
}

// ── robots.txt ───────────────────────────────────────────────────

interface RegrasRobots {
  proibidos: string[]
}

const cacheRobots = new Map<string, RegrasRobots>()

/**
 * Leitura simplificada de robots.txt: aplica os `Disallow` do grupo
 * `User-agent: *`. Ausência de arquivo ou erro = liberado, que é o
 * comportamento do padrão.
 */
export async function podeBuscar(
  base: string,
  caminho: string,
  op: OpcoesRede
): Promise<boolean> {
  let regras = cacheRobots.get(base)
  if (regras === undefined) {
    const txt = await buscarTexto(new URL("/robots.txt", base).toString(), op)
    regras = { proibidos: [] }
    if (txt !== null && txt.length < 200_000) {
      let dentroDoGrupo = false
      for (const linhaBruta of txt.split(/\r?\n/)) {
        const linha = linhaBruta.split("#")[0]!.trim()
        if (linha.length === 0) continue
        const sep = linha.indexOf(":")
        if (sep < 0) continue
        const chave = linha.slice(0, sep).trim().toLowerCase()
        const valor = linha.slice(sep + 1).trim()
        if (chave === "user-agent") dentroDoGrupo = valor === "*"
        else if (chave === "disallow" && dentroDoGrupo && valor.length > 0) {
          regras.proibidos.push(valor)
        }
      }
    }
    cacheRobots.set(base, regras)
  }
  return !regras.proibidos.some((p) => caminho.startsWith(p))
}

// ── Concorrência ─────────────────────────────────────────────────

/**
 * Executa `tarefa` sobre `itens` com no máximo `limite` em voo.
 * Sem dependência externa e sem estourar o pool de sockets.
 */
export async function emParalelo<T, R>(
  itens: T[],
  limite: number,
  tarefa: (item: T, indice: number) => Promise<R>,
  aoConcluir?: (feitos: number, total: number) => void
): Promise<R[]> {
  const saida = new Array<R>(itens.length)
  let proximo = 0
  let feitos = 0
  const trabalhadores = Array.from({ length: Math.max(1, Math.min(limite, itens.length)) }, async () => {
    for (;;) {
      const i = proximo++
      if (i >= itens.length) return
      saida[i] = await tarefa(itens[i]!, i)
      feitos++
      if (aoConcluir) aoConcluir(feitos, itens.length)
    }
  })
  await Promise.all(trabalhadores)
  return saida
}

/** Pausa educada entre requisições ao mesmo host. */
export function pausa(ms: number): Promise<void> {
  return aguardar(ms)
}
