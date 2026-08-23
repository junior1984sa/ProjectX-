// ═══════════════════════════════════════════════════════════════
// CLI: ingerir o snapshot do Companies House
//
//   node pipeline/src/cli/ingerir.ts <arquivo.zip|csv> [...] \
//        [--areas M,BL,OL,SK,WN] [--sic 41201,49410] [--saida caminho.jsonl]
//
// Idempotente: rodar duas vezes com o mesmo arquivo não duplica.
// ═══════════════════════════════════════════════════════════════

import { lerConfiguracao } from "../config.ts"
import { ATRIBUICAO_OGL, lerSnapshot, semSinalDeOperacao } from "../fonte/companiesHouseSnapshot.ts"
import { RepositorioJsonl } from "../armazenamento/jsonl.ts"

function opcao(nome: string): string | null {
  const i = process.argv.indexOf("--" + nome)
  if (i < 0) return null
  const v = process.argv[i + 1]
  return typeof v === "string" && !v.startsWith("--") ? v : null
}

function listaDeOpcao(nome: string): string[] {
  const v = opcao(nome)
  if (v === null) return []
  return v.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
}

async function principal(): Promise<void> {
  const cfg = lerConfiguracao()
  const arquivos = process.argv.slice(2).filter((a) => !a.startsWith("--") && /\.(zip|csv)$/i.test(a))
  if (arquivos.length === 0) {
    console.error("Uso: node pipeline/src/cli/ingerir.ts <arquivo.zip|csv> [...] [--areas M,BL] [--sic 41201] [--saida x.jsonl]")
    console.error("Baixe o snapshot em https://download.companieshouse.gov.uk/en_output.html (gratuito, OGL v3.0)")
    process.exitCode = 1
    return
  }

  const areas = listaDeOpcao("areas")
  const sic = listaDeOpcao("sic")
  const saida = opcao("saida") ?? `${cfg.diretorioDados}/empresas-uk.jsonl`

  console.log("═".repeat(72))
  console.log("INGESTÃO — Companies House Free Company Data Product")
  console.log(ATRIBUICAO_OGL)
  console.log("═".repeat(72))
  console.log(`arquivos : ${arquivos.join(", ")}`)
  console.log(`áreas    : ${areas.length > 0 ? areas.join(",") : "(todas)"}`)
  console.log(`SIC      : ${sic.length > 0 ? sic.join(",") : "(todos)"}`)
  console.log(`saída    : ${saida}`)
  console.log("")

  const inicio = Date.now()
  const r = await lerSnapshot(arquivos, {
    areasPostais: areas,
    codigosSic: sic,
    somenteAtivas: true,
  })

  const semOperacao = r.empresas.filter(semSinalDeOperacao).length
  const massa = r.empresas.filter((e) => e.enderecoDeMassa).length

  const repo = new RepositorioJsonl(saida)
  const { inseridos, atualizados } = await repo.gravarLote(r.empresas)
  const total = await repo.contar()

  console.log(`linhas lidas             : ${r.linhasLidas.toLocaleString("pt-BR")}`)
  console.log(`aceitas pelo filtro      : ${r.aceitas.toLocaleString("pt-BR")}`)
  console.log(`  sem sinal de operação  : ${semOperacao} (${pct(semOperacao, r.aceitas)})`)
  console.log(`  endereço de massa (≥5) : ${massa} (${pct(massa, r.aceitas)})`)
  console.log("")
  console.log(`gravadas: ${inseridos} novas, ${atualizados} atualizadas`)
  console.log(`total no repositório: ${total.toLocaleString("pt-BR")}`)
  console.log(`tempo: ${((Date.now() - inicio) / 1000).toFixed(1)}s`)
}

function pct(parte: number, total: number): string {
  if (total === 0) return "0%"
  return `${((parte / total) * 100).toFixed(1)}%`
}

await principal()
