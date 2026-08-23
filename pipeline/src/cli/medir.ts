// ═══════════════════════════════════════════════════════════════
// CLI: remedir a amostra congelada e comparar com a linha de base
//
//   node pipeline/src/cli/medir.ts [--n 100] [--saida caminho.json]
//
// A amostra é a MESMA de 16/08/2026 (100 empresas de Grande Manchester,
// 25 por segmento, semente 20260816), congelada em
// pipeline/dados/amostra-linha-base.json. Remedir com outra amostra
// tornaria a comparação inútil — o ponto do exercício é isolar o efeito
// do pipeline, não o do sorteio.
//
// A contagem e a impressão moram em ../relatorio.ts, compartilhadas com
// reavaliar.ts, para que os dois nunca divirjam.
// ═══════════════════════════════════════════════════════════════

import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { diagnosticoDeChaves, lerConfiguracao } from "../config.ts"
import type { EmpresaEnriquecida, SituacaoEmpresa } from "../tipos.ts"
import { ProvedorHeuristica } from "../descoberta/heuristica.ts"
import { ProvedorCommonCrawl } from "../descoberta/commonCrawl.ts"
import { ProvedorSerpApi } from "../descoberta/serpapi.ts"
import { VerificadorGratuito } from "../verificacao/gratuito.ts"
import { VerificadorPago } from "../verificacao/pago.ts"
import { enriquecerEmpresa } from "../enriquecer.ts"
import { emParalelo } from "../util/http.ts"
import { distritoPostal, normalizarCep } from "../util/texto.ts"
import { imprimir, LINHA_BASE, type LinhaVerdade } from "../relatorio.ts"

interface LinhaAmostra {
  nome: string
  numero: string
  segmento: string
  sic: string[]
  l1: string
  l2: string
  cidade: string
  cep: string
  categoria: string
  incorporacao: string
  contas_cat: string
  contas_ult: string
  conf_ult: string
  coabitantes_endereco: number
}

function opcao(nome: string): string | null {
  const i = process.argv.indexOf("--" + nome)
  if (i < 0) return null
  const v = process.argv[i + 1]
  return typeof v === "string" && !v.startsWith("--") ? v : null
}

function paraIso(d: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d.trim())
  return m === null ? null : `${m[3]}-${m[2]}-${m[1]}`
}

function converter(l: LinhaAmostra): EmpresaEnriquecida {
  const cep = normalizarCep(l.cep)
  const situacao: SituacaoEmpresa = "ativa"
  return {
    numeroRegistro: l.numero,
    nome: l.nome,
    endereco1: l.l1,
    endereco2: l.l2,
    cidade: l.cidade.length > 0 ? l.cidade : null,
    condado: "",
    pais: "United Kingdom",
    cep,
    distritoPostal: distritoPostal(cep),
    categoria: l.categoria,
    situacao,
    situacaoBruta: "Active",
    codigosSic: l.sic,
    dataConstituicao: paraIso(l.incorporacao),
    categoriaContas: l.contas_cat,
    dataUltimaConfirmacao: paraIso(l.conf_ult),
    fonte: "companies-house-snapshot:BasicCompanyData-2026-08-01 (amostra congelada)",
    coletadoEm: "2026-08-16T00:00:00.000Z",
    empresasNoMesmoEndereco: l.coabitantes_endereco,
    enderecoDeMassa: l.coabitantes_endereco >= 5,
  }
}

async function principal(): Promise<void> {
  const cfg = lerConfiguracao()
  const diag = diagnosticoDeChaves(cfg)

  console.log("═".repeat(74))
  console.log("REMEDIÇÃO — amostra congelada de Grande Manchester, semente 20260816")
  console.log("═".repeat(74))
  console.log("LIGADO:")
  for (const l of diag.ligado) console.log(`  ✓ ${l}`)
  console.log("DESLIGADO (esperando pagamento — ver estrategia/PENDENTE-PAGAMENTO.md):")
  for (const d of diag.desligado) console.log(`  ✗ ${d.nome}  [${d.variavel}] → ${d.efeito}`)
  console.log("")

  const brutas = JSON.parse(
    await readFile("pipeline/dados/amostra-linha-base.json", "utf8")
  ) as LinhaAmostra[]
  const verdade = JSON.parse(
    await readFile("pipeline/dados/verdade-amostra.json", "utf8")
  ) as LinhaVerdade[]

  const limite = Number(opcao("n") ?? brutas.length)
  const amostra = brutas.slice(0, limite).map(converter)

  const rede = { userAgent: cfg.userAgent, timeoutMs: cfg.timeoutMs }
  const op = {
    rede,
    maxPaginasContato: cfg.maxPaginasContato,
    provedores: [
      new ProvedorHeuristica({ maxResolvidos: 6, maxConsultasDns: 40 }),
      new ProvedorCommonCrawl(rede, 6),
      new ProvedorSerpApi(cfg.serpApiKey, rede, 5),
    ],
    verificadores: [
      new VerificadorGratuito(),
      new VerificadorPago(
        cfg.verificadorEmailUrl,
        cfg.verificadorEmailKey,
        cfg.verificadorEmailFornecedor,
        rede
      ),
    ],
  }

  console.log(`processando ${amostra.length} empresas com concorrência ${cfg.concorrencia}…`)
  const inicio = Date.now()
  const resultados = await emParalelo(
    amostra,
    cfg.concorrencia,
    (e) => enriquecerEmpresa(e, op),
    (feitos, total) => {
      if (feitos % 10 === 0 || feitos === total) process.stdout.write(`\r  ${feitos}/${total}`)
    }
  )
  process.stdout.write("\n\n")
  const segundos = (Date.now() - inicio) / 1000

  const resumo = imprimir(resultados, verdade, { segundos })

  const saida = opcao("saida") ?? `${cfg.diretorioDados}/medicao-fase1.json`
  await mkdir(dirname(saida), { recursive: true })
  await writeFile(
    saida,
    JSON.stringify(
      {
        executadoEm: new Date().toISOString(),
        chavesLigadas: diag.ligado,
        chavesDesligadas: diag.desligado,
        linhaBase: LINHA_BASE,
        resumo,
        registros: resultados,
      },
      null,
      1
    ),
    "utf8"
  )
  console.log(`resultado completo em ${saida}`)
}

await principal()
