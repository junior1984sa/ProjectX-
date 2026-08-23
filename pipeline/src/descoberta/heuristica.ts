// ═══════════════════════════════════════════════════════════════
// PROVEDOR GRATUITO: heurística de domínio a partir do nome
//
// Gera candidatos e NÃO valida nenhum. Quem valida é a trava de
// identidade. Essa separação é o que torna o palpite seguro: palpite
// errado é rejeitado pela trava, então gerar MUITOS candidatos aumenta
// a taxa de acerto sem baixar a precisão.
//
// Custo: zero. Só consulta de DNS, que é gratuita e ilimitada.
// ═══════════════════════════════════════════════════════════════

import { resolve4, resolveCname } from "node:dns/promises"
import type { CandidatoDominio, EmpresaRegistro, ProvedorDeDominio } from "../tipos.ts"
import { ehGenerica, tokensDistintivos, tokensDoNome } from "../util/texto.ts"

const TLDS = [".co.uk", ".com", ".uk", ".org.uk", ".ltd.uk", ".net", ".london"] as const

/** Sufixos que PME britânica costuma pendurar no domínio. */
const SUFIXOS_DE_DOMINIO = ["", "uk", "ltd", "group", "online", "direct"] as const

function limparRotulo(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "")
}

/**
 * Bases de domínio plausíveis para o nome. A ordem importa: quanto mais
 * cedo, mais provável, e o pipeline para no primeiro candidato aprovado.
 */
export function basesDeDominio(nome: string): string[] {
  const todos = tokensDoNome(nome)
  const distintivos = tokensDistintivos(nome)
  if (todos.length === 0) return []

  const bases: string[] = []
  const add = (b: string): void => {
    const limpo = limparRotulo(b)
    if (limpo.length >= 3 && limpo.length <= 40 && !bases.includes(limpo)) bases.push(limpo)
  }

  const nucleo = distintivos.length > 0 ? distintivos : todos

  add(todos.join(""))
  add(nucleo.join(""))
  add(todos.join("-"))
  add(nucleo.join("-"))

  // Iniciais + palavras. "P & K SHUTTER SERVICES" tem duas formas usadas
  // na prática: `pkshutterservices` e `pkshutter` — e era a segunda que
  // faltava. Medido no autoteste: sem esta linha, a base perde o domínio
  // real de empresas que abreviam o nome dos sócios.
  const iniciais = todos.filter((t) => t.length <= 2).join("")
  const palavras = todos.filter((t) => t.length > 2)
  if (iniciais.length >= 2 && palavras.length > 0) {
    add(iniciais + palavras.join(""))
    add(iniciais + nucleo.filter((t) => t.length > 2).join(""))
    add(iniciais + palavras[0]!)
    add(iniciais)
  }

  // Duas primeiras palavras longas, para nome comprido:
  // "ABBOTT MELLOR ENGINEERING SERVICES" → "abbottmellor".
  if (palavras.length >= 2) add(palavras.slice(0, 2).join(""))

  // Primeira palavra distintiva sozinha, se for longa o bastante para
  // não ser genérica. "PENDLE HARDWOODS" → "pendle".
  const primeira = nucleo[0]
  if (primeira !== undefined && primeira.length >= 5 && !ehGenerica(primeira)) add(primeira)

  // Duas primeiras palavras do nome completo, para quando a genérica
  // faz parte da marca: "PURE FABS" → "purefabs".
  if (todos.length >= 2) add(todos.slice(0, 2).join(""))

  return bases.slice(0, 8)
}

/**
 * Candidatos em ordem de probabilidade, NÃO agrupados por base.
 *
 * A ordem importa porque o orçamento de consultas de DNS é finito. Numa
 * versão anterior, a primeira base recebia todas as variantes de sufixo
 * antes de a segunda base receber a primeira — e as 42 combinações de
 * `atlasindustrialgroup` consumiam o orçamento inteiro antes de
 * `atlasindustrial.com`, que era o domínio real. Duas empresas da amostra
 * deixaram de ter candidato por causa disso.
 *
 * Passa em ondas: primeiro o TLD mais provável de TODAS as bases, depois
 * o segundo, e só no fim as variantes com sufixo.
 */
export function candidatosDeDominio(nome: string): string[] {
  const bases = basesDeDominio(nome)
  const saida: string[] = []
  const add = (rotulo: string, tld: string): void => {
    if (rotulo.length < 3 || rotulo.length > 40) return
    const d = rotulo + tld
    if (!saida.includes(d)) saida.push(d)
  }

  // Onda 1 e 2: os dois TLDs que respondem por quase todo o mercado
  // britânico, para todas as bases.
  for (const tld of [".co.uk", ".com"]) {
    for (const base of bases) add(base, tld)
  }
  // Onda 3: os demais TLDs, ainda para todas as bases.
  for (const tld of TLDS) {
    if (tld === ".co.uk" || tld === ".com") continue
    for (const base of bases) add(base, tld)
  }
  // Onda 4: variantes com sufixo, só para a base mais provável.
  const principal = bases[0]
  if (principal !== undefined) {
    for (const s of SUFIXOS_DE_DOMINIO) {
      if (s.length === 0) continue
      for (const tld of [".co.uk", ".com"]) add(principal + s, tld)
    }
  }
  return saida
}

/** Resolve apex e `www`. Devolve o host que respondeu, ou `null`. */
export async function resolverHost(dominio: string): Promise<string | null> {
  for (const host of [dominio, "www." + dominio]) {
    try {
      const enderecos = await resolve4(host)
      if (enderecos.length > 0) return host
    } catch {
      try {
        const c = await resolveCname(host)
        if (c.length > 0) return host
      } catch {
        // segue para a próxima forma
      }
    }
  }
  return null
}

export interface OpcoesHeuristica {
  /** Teto de candidatos resolvidos por empresa. Mais que isso não paga. */
  maxResolvidos: number
  /** Teto de consultas de DNS por empresa. Protege o resolvedor. */
  maxConsultasDns: number
}

export class ProvedorHeuristica implements ProvedorDeDominio {
  readonly id = "heuristica-dominio"
  readonly camada = "gratuita" as const
  readonly descricao = "Adivinha o domínio a partir do nome registrado e confirma por DNS"

  // Campo explícito em vez de parameter property: o Node executa este
  // arquivo em modo strip-only, que não suporta `constructor(private x)`.
  private readonly op: OpcoesHeuristica

  constructor(op: OpcoesHeuristica = { maxResolvidos: 6, maxConsultasDns: 40 }) {
    this.op = op
  }

  disponivel(): boolean {
    return true
  }

  async candidatos(empresa: EmpresaRegistro): Promise<CandidatoDominio[]> {
    const lista = candidatosDeDominio(empresa.nome).slice(0, this.op.maxConsultasDns)
    const saida: CandidatoDominio[] = []

    // Em ondas paralelas, preservando a ordem de probabilidade: a onda
    // inteira é consultada de uma vez, e o resultado é lido na ordem
    // original. Sequencial, 40 consultas de DNS levavam ~2 minutos por
    // empresa; assim caem para segundos, sem perder a preferência.
    const tamanhoDaOnda = 10
    for (let i = 0; i < lista.length; i += tamanhoDaOnda) {
      const onda = lista.slice(i, i + tamanhoDaOnda)
      const hosts = await Promise.all(onda.map((d) => resolverHost(d)))
      for (const host of hosts) {
        if (host === null) continue
        if (saida.some((c) => c.host === host)) continue
        saida.push({ host, origemProvedorId: this.id, ordem: saida.length })
      }
      if (saida.length >= this.op.maxResolvidos) break
    }
    return saida.slice(0, this.op.maxResolvidos)
  }
}
