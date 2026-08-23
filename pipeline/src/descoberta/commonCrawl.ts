// ═══════════════════════════════════════════════════════════════
// PROVEDOR GRATUITO: índice do Common Crawl
//
// O que ele faz e o que ele NÃO faz — a distinção importa, porque é
// fácil superestimar esta fonte:
//
//   FAZ:     dado um domínio candidato, dizer se ele já foi rastreado
//            e se respondia 200. Isso separa domínio vivo de domínio
//            registrado-e-vazio SEM gastar uma requisição no site.
//   NÃO FAZ: dado o nome de uma empresa, devolver o domínio dela.
//            O índice é chaveado por URL, não por conteúdo.
//
// Por isso ele entra como FILTRO e desempate da heurística, não como
// descobridor independente. O caminho que o transformaria em
// descobridor de verdade — índice reverso por número de registro
// extraído do corpo das páginas — exige processar os arquivos WARC e
// está registrado como trabalho futuro em PENDENTE-PAGAMENTO.md
// (é gratuito em licença, caro em computação).
//
// Licença: corpus público, sem restrição de uso comercial.
// Custo: zero. Limite: a API do índice é lenta e não gosta de rajada.
// ═══════════════════════════════════════════════════════════════

import type { CandidatoDominio, EmpresaRegistro, ProvedorDeDominio } from "../tipos.ts"
import { buscarTexto, type OpcoesRede } from "../util/http.ts"
import { candidatosDeDominio } from "./heuristica.ts"

const RAIZ_INDICE = "https://index.commoncrawl.org"

interface ColecaoCc {
  id: string
  "cdx-api": string
}

let cacheColecao: string | null = null

/** Descobre a coleção mais recente do índice. Falha vira `null`, nunca erro. */
export async function colecaoMaisRecente(op: OpcoesRede): Promise<string | null> {
  if (cacheColecao !== null) return cacheColecao
  const txt = await buscarTexto(`${RAIZ_INDICE}/collinfo.json`, op)
  if (txt === null) return null
  try {
    const lista = JSON.parse(txt) as ColecaoCc[]
    const primeira = lista[0]
    if (primeira === undefined) return null
    cacheColecao = primeira["cdx-api"]
    return cacheColecao
  } catch {
    return null
  }
}

export interface PresencaCc {
  presente: boolean
  /** Quantas capturas com status 200. Zero = domínio existe mas não servia página. */
  capturas200: number
  /** URL da primeira captura útil — serve de dica do host correto (apex ou www). */
  exemplo: string | null
}

/** Consulta o índice para um domínio. Nunca lança. */
export async function consultarDominio(
  dominio: string,
  op: OpcoesRede
): Promise<PresencaCc> {
  const api = await colecaoMaisRecente(op)
  if (api === null) return { presente: false, capturas200: 0, exemplo: null }
  const url = `${api}?url=${encodeURIComponent(dominio + "/*")}&output=json&limit=5&filter=status:200`
  const txt = await buscarTexto(url, op)
  if (txt === null || txt.trim().length === 0) {
    return { presente: false, capturas200: 0, exemplo: null }
  }
  let capturas = 0
  let exemplo: string | null = null
  for (const linha of txt.split("\n")) {
    const l = linha.trim()
    if (l.length === 0) continue
    try {
      const j = JSON.parse(l) as { url?: string; status?: string }
      if (j.status === "200") {
        capturas++
        if (exemplo === null && typeof j.url === "string") exemplo = j.url
      }
    } catch {
      // linha malformada não invalida as outras
    }
  }
  return { presente: capturas > 0, capturas200: capturas, exemplo }
}

/**
 * Provedor: consulta o índice para os primeiros candidatos da heurística
 * e devolve os que o Common Crawl já viu servindo página.
 *
 * Vale a pena quando a heurística sozinha não achou nada, porque o
 * índice conhece hosts que o nosso DNS ou a nossa rota não alcançam —
 * medido na avaliação da fonte: 10% dos hosts candidatos não conectam
 * daqui.
 */
export class ProvedorCommonCrawl implements ProvedorDeDominio {
  readonly id = "common-crawl"
  readonly camada = "gratuita" as const
  readonly descricao = "Confirma no índice do Common Crawl domínios candidatos que servem página"

  private readonly op: OpcoesRede
  private readonly maxConsultas: number

  constructor(op: OpcoesRede, maxConsultas = 6) {
    this.op = op
    this.maxConsultas = maxConsultas
  }

  disponivel(): boolean {
    return true
  }

  async candidatos(empresa: EmpresaRegistro): Promise<CandidatoDominio[]> {
    const lista = candidatosDeDominio(empresa.nome).slice(0, this.maxConsultas)
    const saida: CandidatoDominio[] = []
    for (const d of lista) {
      const p = await consultarDominio(d, this.op)
      if (!p.presente) continue
      let host = d
      if (p.exemplo !== null) {
        try {
          host = new URL(p.exemplo).host
        } catch {
          host = d
        }
      }
      if (!saida.some((c) => c.host === host)) {
        saida.push({ host, origemProvedorId: this.id, ordem: saida.length })
      }
    }
    return saida
  }
}
