// ═══════════════════════════════════════════════════════════════
// AUTOTESTE — verifica as regras do pipeline SEM tocar na rede
//
//   node pipeline/src/cli/autoteste.ts
//
// Cada caso da trava de identidade é um erro real medido na linha de
// base. Se algum voltar a passar, a precisão cai de novo — e é melhor
// descobrir aqui que na base do assinante.
// ═══════════════════════════════════════════════════════════════

import { avaliarIdentidade } from "../identidade/trava.ts"
import type { EmpresaRegistro } from "../tipos.ts"
import { basesDeDominio, candidatosDeDominio } from "../descoberta/heuristica.ts"
import { ehGenerico, extrairEmails, extrairTelefones, linksDeContato } from "../contato/extrator.ts"
import { dividirLinhaCsv } from "../util/zipcsv.ts"
import { codigoDeArea, normalizarTelefoneUk, tokensDistintivos } from "../util/texto.ts"

let falhas = 0
let total = 0

function conferir(rotulo: string, condicao: boolean, detalhe = ""): void {
  total++
  if (condicao) {
    console.log(`  ok   ${rotulo}`)
  } else {
    falhas++
    console.log(`  FALHA ${rotulo}${detalhe.length > 0 ? ` — ${detalhe}` : ""}`)
  }
}

function empresa(p: Partial<EmpresaRegistro>): EmpresaRegistro {
  return {
    numeroRegistro: "01234567",
    nome: "EXEMPLO LTD",
    endereco1: "1 Test Street",
    endereco2: "",
    cidade: "MANCHESTER",
    condado: "",
    pais: "England",
    cep: "M1 1AA",
    distritoPostal: "M1",
    categoria: "Private Limited Company",
    situacao: "ativa",
    situacaoBruta: "Active",
    codigosSic: ["41201"],
    dataConstituicao: "2015-01-01",
    categoriaContas: "MICRO ENTITY",
    dataUltimaConfirmacao: "2026-01-01",
    fonte: "teste",
    coletadoEm: "2026-08-23T00:00:00.000Z",
    ...p,
  }
}

/** Corpo de página longo o bastante para não cair no filtro de página curta. */
function pagina(miolo: string): string {
  const enchimento =
    "We supply and install across the region with over twenty years of experience serving commercial and industrial clients throughout the north west of the country. ".repeat(
      4
    )
  return `<html><head><title>t</title></head><body><p>${miolo}</p><p>${enchimento}</p></body></html>`
}

console.log("═".repeat(70))
console.log("AUTOTESTE DO PIPELINE — sem rede")
console.log("═".repeat(70))

// ── 1. Trava de identidade: os casos que DEVEM ser aceitos ──
console.log("\n1. Trava de identidade — aceita com prova")

{
  const e = empresa({ nome: "AUTO MARINE CABLES LIMITED", numeroRegistro: "02074574", cep: "M28 3PT" })
  const r = avaliarIdentidade({
    empresa: e,
    host: "www.amc-tcg.com",
    html: pagina("AMC Auto Marine Cables. Registered in England No. 02074574. Companies House."),
  })
  conferir("número de registro na página = PROVA", r.aceito && r.nivel === "numero_registro", r.detalhe)
}

{
  const e = empresa({ nome: "BRIAN MOORES LIMITED", numeroRegistro: "00999111", cep: "BL9 5BN" })
  const r = avaliarIdentidade({
    empresa: e,
    host: "brianmoores.co.uk",
    html: pagina("Brian Moores, Unit 4, Bury, BL9 5BN. Call 0161 533 0399."),
  })
  conferir("CEP registrado na página = FORTE", r.aceito && r.nivel === "cep_registrado", r.detalhe)
}

{
  const e = empresa({ nome: "PENDLE HARDWOODS LIMITED", numeroRegistro: "00888222", cep: "M4 5DL" })
  const r = avaliarIdentidade({
    empresa: e,
    host: "www.pendlehardwoods.co.uk",
    html: pagina("Pendle Hardwoods timber merchants, Salford M5 0TB, telephone 0161 786 8308."),
  })
  conferir("nome + domínio + CEP da mesma área = MÉDIO", r.aceito && r.nivel === "nome_e_dominio", r.detalhe)
}

{
  const e = empresa({ nome: "BARROWMIX LIMITED", numeroRegistro: "00777333", cep: "M20 6WN" })
  const r = avaliarIdentidade({
    empresa: e,
    html: pagina("Barrowmix ready mix concrete Manchester. Call 0161 748 4500 or 01942 722629."),
    host: "barrowmixconcrete.com",
  })
  conferir("nome + domínio + telefone da área = MÉDIO", r.aceito && r.nivel === "nome_e_dominio", r.detalhe)
}

// ── 2. Trava de identidade: os erros reais da linha de base ──
console.log("\n2. Trava de identidade — rejeita os 26 falsos positivos medidos")

const casosDeRejeicao: Array<[string, EmpresaRegistro, string, string]> = [
  [
    "BRADLEYS CONSTRUCTION → 360lawservices.com (escritório de advocacia)",
    empresa({ nome: "BRADLEYS CONSTRUCTION LTD", cep: "WN6 9DX", numeroRegistro: "11111111" }),
    "www.360lawservices.com",
    pagina("360 Law Services Limited, full-service law firm. Registered in England. GU18 5SA."),
  ],
  [
    "ATLAS INDUSTRIAL → atlasindustrial.com (sem corroboração britânica)",
    empresa({ nome: "ATLAS INDUSTRIAL GROUP LIMITED", cep: "M12 6AE", numeroRegistro: "22222222" }),
    "atlasindustrial.com",
    pagina("Atlas Industrial designers and manufacturers of heat exchangers and equipment."),
  ],
  [
    "NERO FOR TRADING → nero.co.uk (Birmingham, B69)",
    empresa({ nome: "NERO FOR TRADING LTD", cep: "M40 8WN", numeroRegistro: "33333333" }),
    "www.nero.co.uk",
    pagina("NERO Pipeline Connections Ltd, Oldbury B69 3EX. Telephone 0121 665 3900."),
  ],
  [
    "P.D.S. (SHEET METAL) → pdssheetmetal.co.uk (Portsmouth, não Bolton)",
    empresa({ nome: "P.D.S. (SHEET METAL) LIMITED", cep: "BL6 6RD", numeroRegistro: "44444444" }),
    "www.pdssheetmetal.co.uk",
    pagina("PDS sheet metal fabrication and laser cutting, Portsmouth, Hampshire. Call 023 9223 4567."),
  ],
  [
    "QUAYS LOGISTICS → domainstore.co.uk (domínio à venda)",
    empresa({ nome: "QUAYS LOGISTICS LTD", cep: "M41 5RU", numeroRegistro: "55555555" }),
    "www.domainstore.co.uk",
    pagina("Premium UK domain names for sale. This domain is for sale. Quays logistics."),
  ],
  [
    "RADIAL LINE SHEETMETAL → radial.com (placeholder you@company.com)",
    empresa({ nome: "RADIAL LINE SHEETMETAL LIMITED", cep: "WN7 2TG", numeroRegistro: "66666666" }),
    "www.radial.com",
    pagina("Radial eCommerce fulfillment. Contact you@company.com for radial line sheetmetal."),
  ],
  [
    "ARM GATE → armgate.am (Armênia)",
    empresa({ nome: "ARM GATE LTD", cep: "M45 6FF", numeroRegistro: "77777777" }),
    "armgate.am",
    pagina("ArmGate Advisers, company registration and accounting services in Armenia. Arm Gate."),
  ],
  [
    "PHOENIX HOME PROJECTS → phoenix.org.uk (Leicester, LE1)",
    empresa({ nome: "PHOENIX HOME PROJECTS LTD", cep: "M30 7EF", numeroRegistro: "88888888" }),
    "www.phoenix.org.uk",
    pagina("Phoenix Leicester, LE1 1TG. Telephone 0116 242 2800. Home projects and cinema."),
  ],
  [
    "PRIMROSE HOLDINGS → primrose.co.uk (loja de jardinagem, Reading)",
    empresa({ nome: "PRIMROSE HOLDINGS GROUP LIMITED", cep: "BL8 4DT", numeroRegistro: "99999999" }),
    "www.primrose.co.uk",
    pagina("Primrose, the UK's leading online garden centre. Call 0118 903 5210. Primrose holdings group."),
  ],
]

for (const [rotulo, e, host, html] of casosDeRejeicao) {
  const r = avaliarIdentidade({ empresa: e, host, html })
  conferir(`rejeita ${rotulo}`, !r.aceito, `aceitou como ${r.nivel}: ${r.detalhe}`)
}

// ── 3. Nome inteiramente genérico não pode gerar prova ──
console.log("\n3. Nome sem token distintivo")
{
  const e = empresa({ nome: "NORTH WEST CONSTRUCTION SERVICES LTD", cep: "M1 1AA", numeroRegistro: "10101010" })
  const r = avaliarIdentidade({
    empresa: e,
    host: "northwestconstructionservices.co.uk",
    html: pagina("North West Construction Services, Manchester M1 2BB. Call 0161 000 0000."),
  })
  conferir("nome só com palavras genéricas é rejeitado", !r.aceito, r.detalhe)
  conferir("tokensDistintivos devolve vazio", tokensDistintivos("NORTH WEST CONSTRUCTION SERVICES LTD").length === 0)
}

// ── 4. Heurística de domínio ──
console.log("\n4. Heurística de domínio")
{
  const bases = basesDeDominio("P & K SHUTTER SERVICES LIMITED")
  conferir("gera 'pkshutterservices'", bases.includes("pkshutterservices"), bases.join(","))
  conferir("gera 'pkshutter'", bases.includes("pkshutter"), bases.join(","))
  const cands = candidatosDeDominio("MONARCH SHELVING LIMITED")
  conferir("gera 'monarchshelving.co.uk'", cands.includes("monarchshelving.co.uk"))
  conferir("gera menos de 60 candidatos", cands.length < 60, `gerou ${cands.length}`)

  // Regressão do defeito de ordenação: as variantes de sufixo da primeira
  // base consumiam o orçamento de DNS e o domínio real ficava fora.
  const atlas = candidatosDeDominio("ATLAS INDUSTRIAL GROUP LIMITED")
  const posAtlas = atlas.indexOf("atlasindustrial.com")
  conferir("'atlasindustrial.com' entra nos 40 primeiros", posAtlas >= 0 && posAtlas < 40, `posição ${posAtlas} de ${atlas.length}`)
  const nexa = candidatosDeDominio("NEXABUILD NW LTD")
  const posNexa = nexa.indexOf("nexabuild.co.uk")
  conferir("'nexabuild.co.uk' entra nos 40 primeiros", posNexa >= 0 && posNexa < 40, `posição ${posNexa} de ${nexa.length}`)
  const pendle = candidatosDeDominio("PENDLE HARDWOODS LIMITED")
  conferir("'pendlehardwoods.co.uk' é o 1º candidato", pendle[0] === "pendlehardwoods.co.uk", String(pendle[0]))
}

// ── 5. Contato: só genérico ──
console.log("\n5. Extração de contato")
{
  conferir("info@ é genérico", ehGenerico("info@x.co.uk"))
  conferir("sales@ é genérico", ehGenerico("sales@x.co.uk"))
  conferir("joao.silva@ NÃO é genérico", !ehGenerico("joao.silva@x.co.uk"))
  conferir("rodneya@ NÃO é genérico", !ehGenerico("rodneya@accumac.co.uk"))

  const paginas = [
    {
      url: "https://x.co.uk/contact",
      html: '<a href="mailto:info@x.co.uk">info</a> <a href="mailto:john.smith@x.co.uk">john</a> logo@2x.png sentry.io/abc@sentry.io',
    },
  ]
  const emails = extrairEmails(paginas, "x.co.uk")
  conferir("extrai o genérico", emails.some((e) => e.endereco === "info@x.co.uk"))
  conferir("descarta o nominal", !emails.some((e) => e.endereco === "john.smith@x.co.uk"))
  conferir("descarta ruído de asset", emails.every((e) => !e.endereco.includes("@2x")))

  const tels = extrairTelefones(
    [{ url: "u", html: "<p>Call 0161 786 8308 or 020 7946 0000</p>" }],
    ["0161"]
  )
  conferir("normaliza telefone para E.164", tels.some((t) => t.e164 === "+441617868308"), JSON.stringify(tels))
  conferir("marca compatibilidade de área", tels[0]?.areaCompativel === true, JSON.stringify(tels))

  const links = linksDeContato(
    '<a href="/contact-us">c</a><a href="https://outro.com/contact">x</a><a href="/about">a</a>',
    "https://x.co.uk",
    3
  )
  conferir("acha links internos de contato", links.length === 2, links.join(","))
  conferir("ignora link externo", !links.some((l) => l.includes("outro.com")))
}

// ── 6. Utilidades ──
console.log("\n6. Utilidades")
{
  conferir("CSV respeita aspas com vírgula", (() => {
    const c = dividirLinhaCsv('"SMITH, JOHN LTD",01234567,"1 High St, Unit 2",M1 1AA')
    return c.length === 4 && c[0] === "SMITH, JOHN LTD" && c[2] === "1 High St, Unit 2"
  })())
  conferir("CSV respeita aspas escapadas", (() => {
    const c = dividirLinhaCsv('"a""b",c')
    return c[0] === 'a"b' && c[1] === "c"
  })())
  conferir("telefone inválido devolve null", normalizarTelefoneUk("123") === null)
  conferir("+44 vira 0", normalizarTelefoneUk("+44 1204 575234") === "+441204575234")
  conferir("código de área de 4 dígitos", codigoDeArea("+441617868308") === "0161")
  conferir("código de área de 5 dígitos", codigoDeArea("+441204575234") === "01204")
  conferir("não-geográfico devolve null", codigoDeArea("+443333446710") === null)
}

console.log("\n" + "═".repeat(70))
console.log(`${total - falhas}/${total} conferências passaram`)
if (falhas > 0) {
  console.log(`${falhas} FALHA(S)`)
  process.exitCode = 1
} else {
  console.log("tudo certo")
}
