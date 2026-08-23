// ═══════════════════════════════════════════════════════════════
// ARMAZENAMENTO — camada bruta e camada publicada em JSONL
//
// Idempotência por `numeroRegistro`: rodar duas vezes o mesmo lote não
// duplica nada e não infla contagem. Isso não é preciosismo — sem essa
// garantia, um reprocessamento parcial depois de uma queda de rede
// deixaria a base com registros repetidos e a contagem de "empresas
// disponíveis" mentindo para o assinante.
//
// JSONL e não banco de propósito: a Fase 1 é gratuita, e um arquivo por
// lote roda em qualquer lugar sem credencial. A tabela equivalente está
// modelada em supabase/migrations/026_registro_uk.sql, com a mesma chave
// e a mesma semântica de upsert.
// ═══════════════════════════════════════════════════════════════

import { createReadStream } from "node:fs"
import { mkdir, rename, writeFile } from "node:fs/promises"
import { createInterface } from "node:readline"
import { dirname } from "node:path"
import type { EmpresaEnriquecida, RepositorioDeEmpresas } from "../tipos.ts"

async function garantirDiretorio(caminho: string): Promise<void> {
  await mkdir(dirname(caminho), { recursive: true })
}

/** Lê um JSONL inteiro. Linha malformada é pulada, não derruba a carga. */
export async function lerJsonl<T>(caminho: string): Promise<T[]> {
  const saida: T[] = []
  try {
    const leitor = createInterface({
      input: createReadStream(caminho),
      crlfDelay: Infinity,
    })
    for await (const linha of leitor) {
      const l = linha.trim()
      if (l.length === 0) continue
      try {
        saida.push(JSON.parse(l) as T)
      } catch {
        // linha corrompida não invalida o arquivo
      }
    }
  } catch {
    return []
  }
  return saida
}

/** Grava de forma atômica: escreve em `.tmp` e renomeia. */
export async function gravarJsonl<T>(caminho: string, itens: T[]): Promise<void> {
  await garantirDiretorio(caminho)
  const tmp = caminho + ".tmp"
  await writeFile(tmp, itens.map((i) => JSON.stringify(i)).join("\n") + "\n", "utf8")
  await rename(tmp, caminho)
}

export class RepositorioJsonl implements RepositorioDeEmpresas {
  readonly id: string

  private readonly caminho: string

  constructor(caminho: string) {
    this.caminho = caminho
    this.id = `jsonl:${caminho}`
  }

  /**
   * Upsert por `numeroRegistro`. O registro novo substitui o antigo por
   * inteiro — o snapshot é a verdade, e um campo que sumiu na fonte
   * precisa sumir aqui também.
   */
  async gravarLote(
    registros: EmpresaEnriquecida[]
  ): Promise<{ inseridos: number; atualizados: number }> {
    const existentes = await lerJsonl<EmpresaEnriquecida>(this.caminho)
    const mapa = new Map<string, EmpresaEnriquecida>()
    for (const e of existentes) mapa.set(e.numeroRegistro, e)

    let inseridos = 0
    let atualizados = 0
    for (const r of registros) {
      if (mapa.has(r.numeroRegistro)) atualizados++
      else inseridos++
      mapa.set(r.numeroRegistro, r)
    }

    // Ordem estável pela chave natural: dois processamentos do mesmo
    // conjunto produzem arquivos byte a byte iguais, o que torna o
    // reprocessamento auditável por diff.
    const ordenado = [...mapa.values()].sort((a, b) =>
      a.numeroRegistro.localeCompare(b.numeroRegistro)
    )
    await gravarJsonl(this.caminho, ordenado)
    return { inseridos, atualizados }
  }

  async contar(): Promise<number> {
    return (await lerJsonl<EmpresaEnriquecida>(this.caminho)).length
  }
}
