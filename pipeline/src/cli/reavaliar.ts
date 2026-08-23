// ═══════════════════════════════════════════════════════════════
// CLI: reavaliar uma medição já salva, sem tocar na rede
//
//   node pipeline/src/cli/reavaliar.ts [arquivo.json]
//
// Existe porque a adjudicação manual muda com o tempo — um site novo é
// conferido à mão e entra na verdade-terreno — e refazer o rastreio de
// 100 empresas só para recontar custa 16 minutos e mexe em sites de
// terceiros sem necessidade.
//
// Também serve de trava contra o erro mais fácil de cometer aqui:
// recontar a precisão com uma regra escrita na mão, diferente da que o
// pipeline usa. A contagem é a mesma de `medir.ts`, importada do mesmo
// módulo.
// ═══════════════════════════════════════════════════════════════

import { readFile, writeFile } from "node:fs/promises"
import type { RegistroPublicado } from "../tipos.ts"
import { imprimir, type LinhaVerdade } from "../relatorio.ts"

interface ArquivoDeMedicao {
  executadoEm: string
  chavesLigadas: string[]
  chavesDesligadas: Array<{ nome: string; variavel: string; efeito: string }>
  registros: RegistroPublicado[]
  [k: string]: unknown
}

async function principal(): Promise<void> {
  const caminho =
    process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "pipeline/dados/medicao-fase1.json"

  const arq = JSON.parse(await readFile(caminho, "utf8")) as ArquivoDeMedicao
  const verdade = JSON.parse(
    await readFile("pipeline/dados/verdade-amostra.json", "utf8")
  ) as LinhaVerdade[]

  console.log("═".repeat(74))
  console.log("REAVALIAÇÃO — recontagem sobre medição salva, sem rede")
  console.log("═".repeat(74))
  console.log(`arquivo   : ${caminho}`)
  console.log(`rastreado : ${arq.executadoEm}`)
  console.log(`verdade   : ${verdade.length} adjudicações manuais`)
  console.log("LIGADO NO RASTREIO:")
  for (const l of arq.chavesLigadas) console.log(`  ✓ ${l}`)
  console.log("DESLIGADO NO RASTREIO:")
  for (const d of arq.chavesDesligadas) console.log(`  ✗ ${d.nome}  [${d.variavel}]`)
  console.log("")

  const resumo = imprimir(arq.registros, verdade)

  arq["resumo"] = resumo
  arq["reavaliadoEm"] = new Date().toISOString()
  await writeFile(caminho, JSON.stringify(arq, null, 1), "utf8")
  console.log(`resumo atualizado em ${caminho}`)
}

await principal()
