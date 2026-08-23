// ═══════════════════════════════════════════════════════════════
// RELATÓRIO DA MEDIÇÃO — contagem e impressão, num lugar só
//
// Fica separado dos CLIs porque duas entradas diferentes precisam da
// MESMA contagem: `medir.ts`, que rastreia a rede, e `reavaliar.ts`,
// que recalcula sobre um resultado já salvo. Duplicar a regra de
// pontuação em dois arquivos é como o número começa a divergir.
// ═══════════════════════════════════════════════════════════════

import type { RegistroPublicado } from "./tipos.ts"

/** Linha de base medida em 16/08/2026, sem trava de identidade. */
export const LINHA_BASE = {
  total: 100,
  sitesEncontrados: 35,
  sitesCorretos: 9,
  comEmail: 8,
  comTelefone: 8,
  comContato: 8,
  precisao: 9 / 35,
  icPrecisao: "[14,2 ; 42,1]",
} as const

export type Veredito = "correto" | "duvidoso" | "errado"

/**
 * Adjudicação manual congelada, chaveada por (empresa, SITE).
 *
 * Chavear só por empresa foi um erro da primeira versão. O pipeline novo
 * encontrou, para a RADIAL LINE SHEETMETAL, um site DIFERENTE do que a
 * linha de base entregava — `radialline.co.uk` em vez de `radial.com` —
 * e herdava o veredito "errado" do site antigo, que era de outra
 * empresa. O veredito é sobre a LIGAÇÃO empresa↔site, não sobre a
 * empresa.
 */
export interface LinhaVerdade {
  numeroRegistro: string
  nome: string
  site: string
  veredito: Veredito
  adjudicadoEm: string
  evidencia: string
}

export function mesmoSite(a: string, b: string): boolean {
  const n = (s: string): string =>
    s.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
  return n(a) === n(b)
}

export function julgar(
  verdade: LinhaVerdade[],
  numeroRegistro: string,
  site: string
): LinhaVerdade | null {
  return verdade.find((v) => v.numeroRegistro === numeroRegistro && mesmoSite(v.site, site)) ?? null
}

/** Intervalo de Wilson 95%. Sem ele, 9/100 e 9/1000 pareceriam a mesma coisa. */
export function wilson(k: number, n: number): [number, number] {
  if (n === 0) return [0, 0]
  const z = 1.96
  const p = k / n
  const d = 1 + (z * z) / n
  const centro = (p + (z * z) / (2 * n)) / d
  const meia = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d
  return [Math.max(0, centro - meia) * 100, Math.min(1, centro + meia) * 100]
}

export function pct(p: number, t: number): string {
  return t === 0 ? "0,0%" : `${((p / t) * 100).toFixed(1).replace(".", ",")}%`
}

export interface Resumo {
  n: number
  sitesAceitos: number
  corretos: number
  duvidosos: number
  errados: number
  naoAdjudicados: number
  precisao: number
  precisaoOtimista: number
  comEmail: number
  comTelefone: number
  comContato: number
  portaoPrecisao: boolean
  portaoContato: boolean
}

export function apurar(registros: RegistroPublicado[], verdade: LinhaVerdade[]): {
  resumo: Resumo
  comSite: RegistroPublicado[]
  semAdjudicacao: RegistroPublicado[]
} {
  const n = registros.length
  const comSite = registros.filter((r) => r.site !== null)
  const comEmail = registros.filter((r) => r.emails.length > 0).length
  const comTelefone = registros.filter((r) => r.telefones.length > 0).length
  const comContato = registros.filter((r) => r.emails.length > 0 || r.telefones.length > 0).length

  let corretos = 0
  let errados = 0
  let duvidosos = 0
  const semAdjudicacao: RegistroPublicado[] = []
  for (const r of comSite) {
    const v = julgar(verdade, r.empresa.numeroRegistro, r.site ?? "")
    if (v === null) {
      semAdjudicacao.push(r)
      continue
    }
    if (v.veredito === "correto") corretos++
    else if (v.veredito === "duvidoso") duvidosos++
    else errados++
  }

  // Conservadora: duvidoso conta como erro. Otimista: conta como acerto.
  // Publicar as duas evita escolher a que favorece o resultado.
  const precisao = comSite.length === 0 ? 0 : corretos / comSite.length
  const precisaoOtimista = comSite.length === 0 ? 0 : (corretos + duvidosos) / comSite.length

  return {
    comSite,
    semAdjudicacao,
    resumo: {
      n,
      sitesAceitos: comSite.length,
      corretos,
      duvidosos,
      errados,
      naoAdjudicados: semAdjudicacao.length,
      precisao,
      precisaoOtimista,
      comEmail,
      comTelefone,
      comContato,
      portaoPrecisao: precisao >= 0.9,
      portaoContato: n > 0 && comContato / n >= 0.25,
    },
  }
}

export function imprimir(
  registros: RegistroPublicado[],
  verdade: LinhaVerdade[],
  extra: { segundos?: number } = {}
): Resumo {
  const { resumo: s, comSite, semAdjudicacao } = apurar(registros, verdade)

  const linha = (r: string, base: string, agora: string): void =>
    console.log(`${r.padEnd(38)}${base.padStart(16)}${agora.padStart(18)}`)

  console.log("─".repeat(74))
  console.log(`${"ETAPA".padEnd(38)}${"LINHA DE BASE".padStart(16)}${"PIPELINE NOVO".padStart(18)}`)
  console.log("─".repeat(74))
  linha("empresas na amostra", String(LINHA_BASE.total), String(s.n))
  linha(
    "candidatos de domínio avaliados",
    "(não instrumentado)",
    String(registros.reduce((a, r) => a + r.candidatosAvaliados, 0))
  )
  linha(
    "sites ACEITOS",
    `${LINHA_BASE.sitesEncontrados} (${pct(LINHA_BASE.sitesEncontrados, LINHA_BASE.total)})`,
    `${s.sitesAceitos} (${pct(s.sitesAceitos, s.n)})`
  )
  linha("  dos quais CORRETOS", String(LINHA_BASE.sitesCorretos), String(s.corretos))
  linha("  dos quais DUVIDOSOS", "5", String(s.duvidosos))
  linha(
    "  dos quais ERRADOS",
    String(LINHA_BASE.sitesEncontrados - LINHA_BASE.sitesCorretos - 5),
    String(s.errados)
  )
  if (s.naoAdjudicados > 0) linha("  SEM ADJUDICAÇÃO", "0", String(s.naoAdjudicados))

  const [pLo, pHi] = wilson(s.corretos, s.sitesAceitos)
  linha(
    "PRECISÃO (conservadora)",
    `${(LINHA_BASE.precisao * 100).toFixed(1).replace(".", ",")}%`,
    `${(s.precisao * 100).toFixed(1).replace(".", ",")}%`
  )
  console.log(
    `${"  IC 95% da precisão".padEnd(38)}${LINHA_BASE.icPrecisao.padStart(16)}${`[${pLo.toFixed(1)} ; ${pHi.toFixed(1)}]`.padStart(18)}`
  )
  linha(
    "com e-mail entregável",
    `${LINHA_BASE.comEmail} (${pct(LINHA_BASE.comEmail, LINHA_BASE.total)})`,
    `${s.comEmail} (${pct(s.comEmail, s.n)})`
  )
  linha(
    "com telefone",
    `${LINHA_BASE.comTelefone} (${pct(LINHA_BASE.comTelefone, LINHA_BASE.total)})`,
    `${s.comTelefone} (${pct(s.comTelefone, s.n)})`
  )
  linha(
    "com ALGUM contato",
    `${LINHA_BASE.comContato} (${pct(LINHA_BASE.comContato, LINHA_BASE.total)})`,
    `${s.comContato} (${pct(s.comContato, s.n)})`
  )
  console.log("─".repeat(74))

  const [cLo, cHi] = wilson(s.comContato, s.n)
  console.log("")
  console.log("PORTÕES DA FASE 1 (PLANO.md):")
  console.log(
    `  ${s.portaoPrecisao ? "PASSOU    " : "NÃO PASSOU"}  precisão > 90%  →  ${(s.precisao * 100).toFixed(1)}%  IC 95% [${pLo.toFixed(1)} ; ${pHi.toFixed(1)}]`
  )
  console.log(
    `  ${s.portaoContato ? "PASSOU    " : "NÃO PASSOU"}  contato > 25%   →  ${pct(s.comContato, s.n)}  IC 95% [${cLo.toFixed(1)} ; ${cHi.toFixed(1)}]`
  )
  if (s.sitesAceitos < 30) {
    console.log(
      `  RESSALVA: precisão apurada sobre ${s.sitesAceitos} casos. Um erro a mais levaria a ${(((s.corretos - 1) / s.sitesAceitos) * 100).toFixed(1)}%.`
    )
  }

  console.log("")
  console.log("SITES ACEITOS, POR SINAL QUE CONFIRMOU:")
  for (const nivel of ["numero_registro", "cep_registrado", "nome_e_dominio"] as const) {
    const q = comSite.filter((r) => r.identidade.nivel === nivel)
    if (q.length === 0) continue
    const ok = q.filter(
      (r) => julgar(verdade, r.empresa.numeroRegistro, r.site ?? "")?.veredito === "correto"
    ).length
    console.log(
      `  ${nivel.padEnd(18)} ${String(q.length).padStart(3)} aceitos, ${ok} corretos (${pct(ok, q.length)})`
    )
  }

  console.log("")
  console.log("QUEM ENTREGOU CADA SITE (implementação que atendeu):")
  const porProvedor = new Map<string, number>()
  for (const r of comSite) porProvedor.set(r.descobertoPor ?? "(nenhum)", (porProvedor.get(r.descobertoPor ?? "(nenhum)") ?? 0) + 1)
  for (const [k, v] of porProvedor) console.log(`  ${k.padEnd(24)} ${v}`)

  console.log("")
  console.log("NÍVEL DE VERIFICAÇÃO DOS E-MAILS ENTREGUES:")
  const porNivel = new Map<string, number>()
  for (const r of registros) {
    for (const e of r.emails) porNivel.set(e.nivelVerificacao, (porNivel.get(e.nivelVerificacao) ?? 0) + 1)
  }
  for (const [k, v] of porNivel) console.log(`  ${k.padEnd(24)} ${v}`)

  if (semAdjudicacao.length > 0) {
    console.log("")
    console.log(`ATENÇÃO — ${semAdjudicacao.length} site(s) aceito(s) fora da adjudicação congelada.`)
    console.log("NÃO entram na conta de precisão até serem conferidos à mão:")
    for (const r of semAdjudicacao) {
      console.log(`  ${r.empresa.nome} → ${r.site}  [${r.identidade.nivel}] ${r.identidade.detalhe}`)
    }
  }

  console.log("")
  console.log("SITES ACEITOS, UM A UM:")
  for (const r of comSite) {
    const v = julgar(verdade, r.empresa.numeroRegistro, r.site ?? "")
    console.log(
      `  [${(v?.veredito ?? "nao-adjudicado").padEnd(14)}] ${r.empresa.nome.slice(0, 36).padEnd(36)} ${String(r.site).padEnd(30)} ${r.identidade.nivel}`
    )
    console.log(`      prova: ${r.identidade.detalhe}`)
    if (r.emails.length > 0) {
      console.log(
        `      mail : ${r.emails.map((e) => `${e.endereco} (${e.status}/${e.nivelVerificacao})`).join(", ")}`
      )
    }
    if (r.telefones.length > 0) {
      console.log(`      tel  : ${r.telefones.map((t) => t.e164 + (t.areaCompativel ? "*" : "")).join(", ")}`)
    }
  }

  const totalPaginas = registros.reduce((a, r) => a + r.paginasLidas, 0)
  console.log("")
  console.log(
    `${extra.segundos !== undefined ? `tempo: ${extra.segundos.toFixed(0)}s  ·  ` : ""}candidatos avaliados: ${registros.reduce((a, r) => a + r.candidatosAvaliados, 0)}  ·  páginas lidas: ${totalPaginas}`
  )
  return s
}
