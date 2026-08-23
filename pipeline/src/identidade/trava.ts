// ═══════════════════════════════════════════════════════════════
// A TRAVA DE IDENTIDADE
//
// É a peça mais importante do pipeline. Sem ela, a descoberta de site
// por heurística tem 26% de precisão medida — ou seja, entrega 74% de
// contato errado com cara de contato certo, que é o pior defeito que um
// produto de dados pode ter.
//
// A trava inverte o ônus da prova: um site NÃO pertence à empresa até
// que se prove que pertence. Rejeitar é o comportamento correto.
//
// Hierarquia (PLANO.md, seção 1.1):
//   1. número de registro na página     → PROVA        → aceita
//   2. CEP registrado na página         → FORTE        → aceita
//   3. nome bate E domínio contém nome  → MÉDIO        → aceita com
//      + corroboração geográfica                          confiança reduzida
//   4. só nome parecido                 → FRACO        → REJEITA
//
// O item 3 exige corroboração geográfica de propósito. Sem ela,
// "ATLAS INDUSTRIAL GROUP LIMITED" de Manchester casa com
// `atlasindustrial.com`, que é outra empresa — foi um dos 26 erros
// medidos na linha de base.
// ═══════════════════════════════════════════════════════════════

import type { EmpresaRegistro, NivelDeProva, ResultadoIdentidade } from "../tipos.ts"
import {
  CONFIANCA_DA_PROVA,
} from "../tipos.ts"
import {
  areaPostal,
  cepsNoTexto,
  codigoDeArea,
  distritoPostal,
  normalizarCep,
  telefonesNoTexto,
  textoVisivel,
  tokensDistintivos,
} from "../util/texto.ts"

/**
 * Contexto que as regras de divulgação comercial britânicas obrigam a
 * exibir junto do número de registro. Exigir o contexto evita que uma
 * sequência de 8 dígitos qualquer (um telefone, um preço) seja lida
 * como prova.
 */
const RE_CONTEXTO_REGISTRO =
  /registered\s+(in\s+)?(england|wales|scotland|northern\s+ireland)|compan(y|ies)\s+(registration\s+)?(no|number)|registered\s+(office|in)|companies\s+house|reg(istered)?\.?\s*no\.?\s*\d/i

/** Marcas de página estacionada, template não preenchido ou domínio à venda. */
const SINAIS_DE_PARKING = [
  "this domain is for sale",
  "buy this domain",
  "domain for sale",
  "domain name for sale",
  "the domain name",
  "parked domain",
  "domain parking",
  "hugedomains",
  "sedoparking",
  "website coming soon",
  "coming soon",
  "under construction",
  "site not published",
  "future home of",
  "default web site page",
  "lorem ipsum",
  "you@company.com",
  "your company name",
  "yourdomain.com",
]

/**
 * Códigos de discagem geográficos por área postal britânica.
 * Serve só para CORROBORAR o nível médio quando o site não publica CEP.
 * Área ausente da tabela = sinal neutro, nunca contrário — inventar
 * conflito onde não há conhecimento produziria rejeição errada.
 */
const DISCAGEM_POR_AREA: Record<string, string[]> = {
  M: ["0161", "01942", "01706", "01457", "01204"],
  BL: ["01204", "01942", "0161", "01706"],
  OL: ["0161", "01706", "01457", "01254"],
  SK: ["0161", "01625", "01663", "01298"],
  WN: ["01942", "01257", "0161", "01695"],
  WA: ["01925", "01928", "0151", "01565"],
  L: ["0151", "01704", "01695"],
  PR: ["01772", "01253", "01254", "01995"],
  BB: ["01254", "01282", "01200", "01706"],
  LS: ["0113", "01937", "01977"],
  BD: ["01274", "01535", "01756"],
  S: ["0114", "01709", "01226"],
  NG: ["0115", "01636", "01777"],
  B: ["0121", "01527", "01564"],
  CV: ["024", "01926", "01788"],
  LE: ["0116", "01455", "01530"],
  NE: ["0191", "01670", "01661"],
  G: ["0141", "01236", "01355"],
  EH: ["0131", "01506", "01620"],
  CF: ["029", "01443", "01446"],
  BS: ["0117", "01454", "01275"],
  E: ["020"], EC: ["020"], N: ["020"], NW: ["020"], SE: ["020"],
  SW: ["020"], W: ["020"], WC: ["020"], IG: ["020"], RM: ["020"],
  CR: ["020"], BR: ["020"], DA: ["020", "01322"], HA: ["020"],
  UB: ["020"], TW: ["020"], KT: ["020"], SM: ["020"], EN: ["020"],
}

export interface EntradaTrava {
  empresa: EmpresaRegistro
  /** Host do candidato, com ou sem `www`. */
  host: string
  /** HTML concatenado da home + páginas de contato lidas. */
  html: string
}

interface Achados {
  texto: string
  textoMaiusculo: string
  semEspaco: string
  cepsDaPagina: string[]
  telefones: Array<{ e164: string; original: string }>
}

function coletar(html: string): Achados {
  const texto = textoVisivel(html)
  const textoMaiusculo = texto.toUpperCase()
  return {
    texto,
    textoMaiusculo,
    semEspaco: textoMaiusculo.replace(/\s+/g, ""),
    cepsDaPagina: cepsNoTexto(texto),
    telefones: telefonesNoTexto(texto),
  }
}

/** Variantes do número de registro que aparecem na prática. */
function variantesDoNumero(numero: string): string[] {
  const n = numero.trim().toUpperCase()
  const v = new Set<string>([n])
  const semZeros = n.replace(/^0+/, "")
  if (semZeros.length >= 5) v.add(semZeros)
  if (/^\d+$/.test(n)) v.add(n.padStart(8, "0"))
  return [...v]
}

function achouNumeroDeRegistro(empresa: EmpresaRegistro, a: Achados): string | null {
  if (!RE_CONTEXTO_REGISTRO.test(a.texto)) return null
  for (const v of variantesDoNumero(empresa.numeroRegistro)) {
    // Fronteira à esquerda e à direita: nada de dígito colado, para não
    // casar dentro de um telefone ou de outro número maior.
    const re = new RegExp(`(?<![0-9A-Z])${v}(?![0-9])`)
    if (re.test(a.semEspaco)) return v
  }
  return null
}

function achouCepRegistrado(empresa: EmpresaRegistro, a: Achados): boolean {
  const alvo = normalizarCep(empresa.cep)
  return a.cepsDaPagina.some((c) => normalizarCep(c) === alvo)
}

interface Geografia {
  mesmoDistrito: boolean
  mesmaArea: boolean
  areaConflitante: boolean
  discagemCompativel: string | null
}

function avaliarGeografia(empresa: EmpresaRegistro, a: Achados): Geografia {
  const distrito = distritoPostal(empresa.cep)
  const area = areaPostal(empresa.cep)
  const areasDaPagina = a.cepsDaPagina.map((c) => areaPostal(c))
  const distritosDaPagina = a.cepsDaPagina.map((c) => distritoPostal(c))

  const mesmoDistrito = distritosDaPagina.includes(distrito)
  const mesmaArea = areasDaPagina.includes(area)
  const areaConflitante = a.cepsDaPagina.length > 0 && !mesmaArea

  let discagemCompativel: string | null = null
  const permitidos = DISCAGEM_POR_AREA[area]
  if (permitidos !== undefined) {
    for (const t of a.telefones) {
      const codigo = codigoDeArea(t.e164)
      if (codigo !== null && permitidos.includes(codigo)) {
        discagemCompativel = codigo
        break
      }
    }
  }
  return { mesmoDistrito, mesmaArea, areaConflitante, discagemCompativel }
}

function achouNomeEDominio(
  empresa: EmpresaRegistro,
  host: string,
  a: Achados
): { ok: boolean; detalhe: string } {
  const distintivos = tokensDistintivos(empresa.nome)
  if (distintivos.length === 0) {
    return { ok: false, detalhe: "nome sem token distintivo (só palavras genéricas)" }
  }
  // TODOS os tokens distintivos precisam aparecer no texto da página.
  const ausentes = distintivos.filter((t) => !a.textoMaiusculo.includes(t))
  if (ausentes.length > 0) {
    return { ok: false, detalhe: `tokens ausentes na página: ${ausentes.join(",")}` }
  }
  // E o domínio precisa carregar o nome — não basta a página citá-lo.
  const rotulo = host
    .toLowerCase()
    .replace(/^www\./, "")
    .split(".")[0]!
    .replace(/[^a-z0-9]/g, "")
  const juntos = distintivos.join("").toLowerCase()
  const contem = rotulo.includes(juntos) || juntos.includes(rotulo)
  if (!contem) {
    return { ok: false, detalhe: `domínio "${rotulo}" não carrega o nome "${juntos}"` }
  }
  return { ok: true, detalhe: `tokens ${distintivos.join("+")} em domínio "${rotulo}"` }
}

function detectarParking(a: Achados): string | null {
  const baixo = a.texto.toLowerCase()
  const inicio = baixo.slice(0, 4000)
  for (const s of SINAIS_DE_PARKING) {
    if (inicio.includes(s)) return s
  }
  if (a.texto.length < 400) return "página com menos de 400 caracteres de texto"
  return null
}

function reprovado(detalhe: string, contraindicacoes: string[]): ResultadoIdentidade {
  return {
    nivel: "nenhuma",
    aceito: false,
    confianca: 0,
    detalhe,
    contraindicacoes,
  }
}

function aprovado(
  nivel: Exclude<NivelDeProva, "nenhuma">,
  detalhe: string,
  contraindicacoes: string[],
  ajusteConfianca = 0
): ResultadoIdentidade {
  const base = CONFIANCA_DA_PROVA[nivel]
  return {
    nivel,
    aceito: true,
    confianca: Math.max(0, Math.min(1, Number((base + ajusteConfianca).toFixed(2)))),
    detalhe,
    contraindicacoes,
  }
}

/**
 * Decide se `html` é o site de `empresa`.
 *
 * Nunca devolve "talvez". Ou tem prova e o site é aceito com o nível
 * declarado, ou não tem e o registro sai sem site — o que na prática
 * significa sair sem contato, e isso é o resultado correto.
 */
export function avaliarIdentidade(e: EntradaTrava): ResultadoIdentidade {
  const a = coletar(e.html)
  const contra: string[] = []

  const parking = detectarParking(a)
  if (parking !== null) {
    return reprovado(`página estacionada ou template vazio: "${parking}"`, [
      `parking:${parking}`,
    ])
  }

  const geo = avaliarGeografia(e.empresa, a)
  if (geo.areaConflitante) {
    contra.push(
      `CEPs da página em outra área postal (${[...new Set(a.cepsDaPagina.map(areaPostal))].join(",")}) — registrado em ${areaPostal(e.empresa.cep)}`
    )
  }

  // ── 1. PROVA: número de registro na página ──
  const numero = achouNumeroDeRegistro(e.empresa, a)
  if (numero !== null) {
    return aprovado("numero_registro", `número de registro ${numero} publicado na página`, contra)
  }

  // ── 2. FORTE: CEP registrado na página ──
  if (achouCepRegistrado(e.empresa, a)) {
    return aprovado("cep_registrado", `CEP ${normalizarCep(e.empresa.cep)} publicado na página`, contra)
  }

  // ── 3. MÉDIO: nome + domínio + corroboração geográfica ──
  const nome = achouNomeEDominio(e.empresa, e.host, a)
  if (!nome.ok) {
    return reprovado(nome.detalhe, contra)
  }
  if (geo.areaConflitante) {
    return reprovado(
      `nome bate, mas a geografia contradiz: ${contra[0] ?? "área postal divergente"}`,
      contra
    )
  }
  if (geo.mesmoDistrito) {
    return aprovado(
      "nome_e_dominio",
      `${nome.detalhe}; CEP do mesmo distrito (${distritoPostal(e.empresa.cep)}) na página`,
      contra,
      +0.1
    )
  }
  if (geo.mesmaArea) {
    return aprovado(
      "nome_e_dominio",
      `${nome.detalhe}; CEP da mesma área postal (${areaPostal(e.empresa.cep)}) na página`,
      contra
    )
  }
  if (geo.discagemCompativel !== null) {
    return aprovado(
      "nome_e_dominio",
      `${nome.detalhe}; telefone com código de área ${geo.discagemCompativel}, compatível com ${areaPostal(e.empresa.cep)}`,
      contra,
      -0.05
    )
  }

  // 4. FRACO: só o nome parecido. Rejeita — é a regra que corrige os
  // 26 falsos positivos da linha de base.
  return reprovado(
    `${nome.detalhe}, mas sem corroboração geográfica (nenhum CEP nem telefone da região registrada)`,
    contra
  )
}
