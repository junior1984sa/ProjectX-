// ═══════════════════════════════════════════════════════════════
// LEITURA DO SNAPSHOT — ZIP com deflate + CSV com aspas, em streaming
//
// Zero dependência de propósito. O arquivo do Companies House tem 418 MB
// descompactados por parte; carregar em memória não é opção, e instalar
// biblioteca de zip para ler UM formato conhecido é peso desnecessário.
//
// O ZIP do Companies House tem uma entrada só, comprimida com deflate
// (método 8) — verificado no arquivo de 01/08/2026.
// ═══════════════════════════════════════════════════════════════

import { createReadStream } from "node:fs"
import { open } from "node:fs/promises"
import { createInflateRaw } from "node:zlib"
import { Readable } from "node:stream"
import { createInterface } from "node:readline"

const ASSINATURA_LOCAL = 0x04034b50
const METODO_ARMAZENADO = 0
const METODO_DEFLATE = 8

interface EntradaZip {
  nome: string
  metodo: number
  inicioDados: number
}

/** Lê o cabeçalho local da primeira entrada do ZIP. */
async function primeiraEntrada(caminho: string): Promise<EntradaZip> {
  const fd = await open(caminho, "r")
  try {
    const cab = Buffer.alloc(30)
    await fd.read(cab, 0, 30, 0)
    const assinatura = cab.readUInt32LE(0)
    if (assinatura !== ASSINATURA_LOCAL) {
      throw new Error(
        `Não parece um ZIP: assinatura 0x${assinatura.toString(16)} em ${caminho}`
      )
    }
    const metodo = cab.readUInt16LE(8)
    const tamNome = cab.readUInt16LE(26)
    const tamExtra = cab.readUInt16LE(28)
    const nomeBuf = Buffer.alloc(tamNome)
    await fd.read(nomeBuf, 0, tamNome, 30)
    return {
      nome: nomeBuf.toString("utf8"),
      metodo,
      inicioDados: 30 + tamNome + tamExtra,
    }
  } finally {
    await fd.close()
  }
}

/**
 * Linhas do CSV de dentro do ZIP, uma a uma, sem materializar o arquivo.
 * Aceita também `.csv` solto, para quem já descompactou.
 */
export async function* linhasDoArquivo(caminho: string): AsyncGenerator<string> {
  let entrada: Readable
  if (caminho.toLowerCase().endsWith(".zip")) {
    const e = await primeiraEntrada(caminho)
    if (e.metodo !== METODO_DEFLATE && e.metodo !== METODO_ARMAZENADO) {
      throw new Error(`Método de compressão ${e.metodo} não suportado (${e.nome})`)
    }
    const bruto = createReadStream(caminho, { start: e.inicioDados })
    entrada = e.metodo === METODO_DEFLATE ? bruto.pipe(createInflateRaw()) : bruto
  } else {
    entrada = createReadStream(caminho)
  }
  const leitor = createInterface({ input: entrada, crlfDelay: Infinity })
  for await (const linha of leitor) yield linha
}

/**
 * Divide uma linha de CSV respeitando aspas duplas e aspas escapadas
 * (`""`). O arquivo do Companies House tem vírgula dentro de campo
 * (nome de empresa, linha de endereço), então divisão por `split(",")`
 * corrompe os dados silenciosamente.
 */
export function dividirLinhaCsv(linha: string): string[] {
  const campos: string[] = []
  let atual = ""
  let dentroDeAspas = false
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]!
    if (dentroDeAspas) {
      if (c === '"') {
        if (linha[i + 1] === '"') {
          atual += '"'
          i++
        } else {
          dentroDeAspas = false
        }
      } else {
        atual += c
      }
    } else if (c === '"') {
      dentroDeAspas = true
    } else if (c === ",") {
      campos.push(atual)
      atual = ""
    } else {
      atual += c
    }
  }
  campos.push(atual)
  return campos
}

/**
 * Percorre o CSV devolvendo cada linha como mapa cabeçalho→valor.
 * Os cabeçalhos do Companies House vêm com espaço à esquerda em
 * várias colunas (` CompanyNumber`) — são aparados aqui.
 */
export async function* registrosCsv(
  caminho: string
): AsyncGenerator<Record<string, string>> {
  let cabecalho: string[] | null = null
  for await (const linha of linhasDoArquivo(caminho)) {
    if (linha.length === 0) continue
    const campos = dividirLinhaCsv(linha)
    if (cabecalho === null) {
      cabecalho = campos.map((c) => c.trim())
      continue
    }
    const reg: Record<string, string> = {}
    for (let i = 0; i < cabecalho.length; i++) reg[cabecalho[i]!] = (campos[i] ?? "").trim()
    yield reg
  }
}
