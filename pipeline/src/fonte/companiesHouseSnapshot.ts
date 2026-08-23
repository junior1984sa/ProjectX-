// ═══════════════════════════════════════════════════════════════
// FONTE: Companies House — Free Company Data Product (snapshot mensal)
//
// Licença: Open Government Licence v3.0.
//   • uso comercial: permitido
//   • redistribuição: permitida
//   • share-alike: NÃO existe — a nossa classificação de segmento
//     continua nossa (diferente da ODbL do OpenStreetMap)
//   • atribuição: OBRIGATÓRIA e visível na tela de resultados
//
// Custo: zero. Frescor: mensal, publicado no dia 1º.
// Contato (site, e-mail, telefone): NÃO EXISTE nesta fonte, em campo
// nenhum. Esse buraco é o motivo de todo o resto do pipeline.
// ═══════════════════════════════════════════════════════════════

import { basename } from "node:path"
import type { EmpresaRegistro, EmpresaEnriquecida, SituacaoEmpresa } from "../tipos.ts"
import { distritoPostal, normalizarCep } from "../util/texto.ts"
import { registrosCsv } from "../util/zipcsv.ts"

export const ATRIBUICAO_OGL =
  "Contém informação do setor público licenciada sob a Open Government Licence v3.0 (Companies House)."

const COL = {
  nome: "CompanyName",
  numero: "CompanyNumber",
  end1: "RegAddress.AddressLine1",
  end2: "RegAddress.AddressLine2",
  cidade: "RegAddress.PostTown",
  condado: "RegAddress.County",
  pais: "RegAddress.Country",
  cep: "RegAddress.PostCode",
  categoria: "CompanyCategory",
  situacao: "CompanyStatus",
  constituicao: "IncorporationDate",
  contas: "Accounts.AccountCategory",
  confirmacao: "ConfStmtLastMadeUpDate",
  sic: ["SICCode.SicText_1", "SICCode.SicText_2", "SICCode.SicText_3", "SICCode.SicText_4"],
} as const

function mapearSituacao(bruta: string): SituacaoEmpresa {
  const s = bruta.trim().toLowerCase()
  if (s === "active") return "ativa"
  if (s.includes("dissolved")) return "dissolvida"
  if (s.includes("liquidation")) return "liquidacao"
  if (s.includes("insolvency") || s.includes("administration") || s.includes("receiver")) {
    return "insolvencia"
  }
  return "outra"
}

/** Data `DD/MM/AAAA` do CSV → ISO `AAAA-MM-DD`. Vazio ou inválido vira `null`. */
function paraIso(d: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d.trim())
  if (m === null) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

function codigosSic(reg: Record<string, string>): string[] {
  const saida: string[] = []
  for (const c of COL.sic) {
    const v = (reg[c] ?? "").trim()
    if (v.length === 0) continue
    const codigo = v.split(" - ")[0]!.trim()
    if (codigo.length > 0 && !saida.includes(codigo)) saida.push(codigo)
  }
  return saida
}

export interface FiltroIngestao {
  /** Áreas postais aceitas ("M", "BL"…). Vazio = todas. */
  areasPostais?: string[]
  /** Códigos SIC aceitos. Vazio = todos. */
  codigosSic?: string[]
  /** Só empresas ativas. Padrão: `true`. */
  somenteAtivas?: boolean
}

export interface ResultadoIngestao {
  linhasLidas: number
  aceitas: number
  empresas: EmpresaEnriquecida[]
  /** Contagem por endereço, usada para marcar endereço de contador. */
  densidadePorEndereco: Map<string, number>
  fonte: string
}

function chaveEndereco(cep: string, end1: string): string {
  return `${cep.replace(/\s+/g, "")}|${end1.toUpperCase().trim()}`
}

/**
 * Lê um ou mais arquivos do snapshot e devolve as empresas que passam
 * no filtro, já com a contagem de coabitantes por endereço.
 *
 * A contagem de endereço é feita sobre TODAS as linhas do arquivo, não
 * só sobre as filtradas — senão o número fica errado por baixo. Medido:
 * 38% das empresas dividem endereço com 5 ou mais, e o CEP M40 8WN
 * sozinho abriga 1.054.
 */
export async function lerSnapshot(
  caminhos: string[],
  filtro: FiltroIngestao = {}
): Promise<ResultadoIngestao> {
  const somenteAtivas = filtro.somenteAtivas ?? true
  const areas = new Set((filtro.areasPostais ?? []).map((a) => a.toUpperCase()))
  const sics = new Set(filtro.codigosSic ?? [])
  const coletadoEm = new Date().toISOString()

  const densidade = new Map<string, number>()
  const brutas: Array<{ reg: EmpresaRegistro; chave: string }> = []
  let linhasLidas = 0

  for (const caminho of caminhos) {
    const fonte = `companies-house-snapshot:${basename(caminho)}`
    for await (const reg of registrosCsv(caminho)) {
      linhasLidas++
      const cep = normalizarCep(reg[COL.cep] ?? "")
      const end1 = reg[COL.end1] ?? ""
      const chave = chaveEndereco(cep, end1)
      densidade.set(chave, (densidade.get(chave) ?? 0) + 1)

      const distrito = distritoPostal(cep)
      const area = /^([A-Z]{1,2})/.exec(distrito)?.[1] ?? ""
      if (areas.size > 0 && !areas.has(area)) continue

      const situacaoBruta = reg[COL.situacao] ?? ""
      const situacao = mapearSituacao(situacaoBruta)
      if (somenteAtivas && situacao !== "ativa") continue

      const sic = codigosSic(reg)
      if (sics.size > 0 && !sic.some((c) => sics.has(c))) continue

      const numero = (reg[COL.numero] ?? "").trim()
      const nome = (reg[COL.nome] ?? "").trim()
      if (numero.length === 0 || nome.length === 0) continue

      brutas.push({
        chave,
        reg: {
          numeroRegistro: numero,
          nome,
          endereco1: end1,
          endereco2: reg[COL.end2] ?? "",
          cidade: (reg[COL.cidade] ?? "").trim() || null,
          condado: reg[COL.condado] ?? "",
          pais: reg[COL.pais] ?? "",
          cep,
          distritoPostal: distrito,
          categoria: reg[COL.categoria] ?? "",
          situacao,
          situacaoBruta,
          codigosSic: sic,
          dataConstituicao: paraIso(reg[COL.constituicao] ?? ""),
          categoriaContas: reg[COL.contas] ?? "",
          dataUltimaConfirmacao: paraIso(reg[COL.confirmacao] ?? ""),
          fonte,
          coletadoEm,
        },
      })
    }
  }

  const empresas: EmpresaEnriquecida[] = brutas.map(({ reg, chave }) => {
    const n = densidade.get(chave) ?? 1
    return { ...reg, empresasNoMesmoEndereco: n, enderecoDeMassa: n >= 5 }
  })

  return {
    linhasLidas,
    aceitas: empresas.length,
    empresas,
    densidadePorEndereco: densidade,
    fonte: caminhos.map((c) => basename(c)).join(","),
  }
}

/**
 * Empresa sem sinal contábil de operação. Medido: 41% da amostra.
 * Filtrar aqui é grátis e evita gastar consulta paga em quem não
 * tem site nem telefone.
 */
export function semSinalDeOperacao(e: EmpresaRegistro): boolean {
  const c = e.categoriaContas.trim().toUpperCase()
  return c === "DORMANT" || c === "NO ACCOUNTS FILED"
}
