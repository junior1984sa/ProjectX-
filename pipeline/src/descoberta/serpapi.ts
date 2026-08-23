// ═══════════════════════════════════════════════════════════════
// ENCAIXE PAGO: SerpApi — descoberta de site por motor de busca
//
// ESTADO: implementado e DESLIGADO por falta de chave.
// Para ligar: definir SERPAPI_KEY. Nada mais precisa mudar.
//
// Custo: US$ 10 por mil consultas no plano Production (US$ 150/mês por
// 15 mil). Planos menores custam mais por consulta: Starter US$ 25/mil.
//
// Por que este e não outro:
//   • Brave Search API — os planos padrão NÃO dão direito de armazenar
//     o resultado ("you will need to subscribe to a plan that explicitly
//     grants storage rights"). É o mesmo problema do Google Places, que
//     já custou uma reescrita. Descartada.
//   • Google Custom Search — fechada para novos clientes, encerra em
//     01/01/2027. Descartada.
//   • SerpApi — declara "U.S. Legal Shield" e modo ZeroTrace a partir do
//     plano Production. É o único com direito de uso compatível em preço
//     público.
//
// A chamada é feita com `num=10` e o resultado é filtrado: sai tudo que
// é agregador (Companies House, Yell, 192, Endole…), porque o que
// queremos é o site DA empresa, não o perfil dela num diretório de
// terceiros — e raspar diretório proprietário não está no cardápio.
// ═══════════════════════════════════════════════════════════════

import type { CandidatoDominio, EmpresaRegistro, ProvedorDeDominio } from "../tipos.ts"
import { buscarTexto, type OpcoesRede } from "../util/http.ts"

/**
 * Domínios que respondem por quase toda a primeira página de busca de
 * uma PME britânica, e que NÃO são o site da empresa. Medido durante a
 * avaliação da fonte: em 7 buscas manuais, os 10 primeiros resultados
 * eram dominados por estes.
 */
const AGREGADORES = [
  "find-and-update.company-information.service.gov.uk",
  "companieshouse.gov.uk",
  "endole.co.uk",
  "yell.com",
  "192.com",
  "b2bhint.com",
  "companiesintheuk.co.uk",
  "approvedbusiness.co.uk",
  "businessmagnet.co.uk",
  "cylex-uk.co.uk",
  "firmania.co.uk",
  "secret-bases.co.uk",
  "yellowtom.co.uk",
  "thegazette.co.uk",
  "opencorporates.com",
  "bizdb.co.uk",
  "checkcompany.co.uk",
  "companycheck.co.uk",
  "duedil.com",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tiktok.com",
  "indeed.com",
  "totaljobs.com",
  "reed.co.uk",
  "glassdoor.com",
  "trustpilot.com",
  "checkatrade.com",
  "houzz.co.uk",
  "wikipedia.org",
  "gov.uk",
  "amazon.co.uk",
  "ebay.co.uk",
]

function ehAgregador(host: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, "")
  return AGREGADORES.some((a) => h === a || h.endsWith("." + a))
}

interface RespostaSerp {
  organic_results?: Array<{ link?: string; position?: number }>
  error?: string
}

export class ProvedorSerpApi implements ProvedorDeDominio {
  readonly id = "serpapi"
  readonly camada = "paga" as const
  readonly descricao =
    "Descobre o site por motor de busca (SerpApi, US$ 10/mil no plano Production)"

  private readonly chave: string | null
  private readonly op: OpcoesRede
  private readonly maxResultados: number

  constructor(chave: string | null, op: OpcoesRede, maxResultados = 5) {
    this.chave = chave
    this.op = op
    this.maxResultados = maxResultados
  }

  /**
   * Sem chave, responde `false` e o orquestrador segue adiante.
   * Este é o ponto exato onde a regra "ausência de chave paga nunca
   * quebra o fluxo" é cumprida.
   */
  disponivel(): boolean {
    return this.chave !== null && this.chave.length > 0
  }

  /** Consulta montada para achar o site próprio, não o perfil em diretório. */
  consultaPara(empresa: EmpresaRegistro): string {
    const local = empresa.cidade ?? empresa.condado ?? ""
    return `"${empresa.nome.replace(/"/g, "")}" ${local} ${empresa.distritoPostal}`.trim()
  }

  async candidatos(empresa: EmpresaRegistro): Promise<CandidatoDominio[]> {
    if (!this.disponivel()) return []
    const url =
      "https://serpapi.com/search.json?engine=google" +
      `&q=${encodeURIComponent(this.consultaPara(empresa))}` +
      `&google_domain=google.co.uk&gl=uk&hl=en&num=10` +
      `&api_key=${encodeURIComponent(this.chave!)}`

    const txt = await buscarTexto(url, this.op)
    if (txt === null) return []
    let dados: RespostaSerp
    try {
      dados = JSON.parse(txt) as RespostaSerp
    } catch {
      return []
    }
    if (typeof dados.error === "string") return []

    const saida: CandidatoDominio[] = []
    for (const r of dados.organic_results ?? []) {
      if (typeof r.link !== "string") continue
      let host: string
      try {
        host = new URL(r.link).host
      } catch {
        continue
      }
      if (ehAgregador(host)) continue
      if (saida.some((c) => c.host === host)) continue
      saida.push({ host, origemProvedorId: this.id, ordem: saida.length })
      if (saida.length >= this.maxResultados) break
    }
    return saida
  }
}
