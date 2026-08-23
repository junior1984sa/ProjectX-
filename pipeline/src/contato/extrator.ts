// ═══════════════════════════════════════════════════════════════
// EXTRAÇÃO DE CONTATO — só endereço genérico
//
// Decisão registrada em PLANO.md e medida na avaliação da fonte:
// endereço nominal (joao.silva@) apareceu 1 vez em 9 sites corretos.
// Não está publicado. Persegui-lo exigiria INVENTAR o endereço a partir
// dos nomes de diretores que o Companies House publica — e isso é ruim
// em três frentes ao mesmo tempo:
//   • técnica: endereço inventado só se valida por SMTP, que não
//     conseguimos fazer (36% das sondagens recusadas pelo nosso IP)
//   • jurídica: nominal é dado pessoal sob UK GDPR inteiro; genérico de
//     sociedade incorporada é corporate subscriber pela orientação do ICO
//   • de credibilidade: endereço inventado gera hard bounce e hard bounce
//     queima o domínio de envio
//
// Por isso o extrator DESCARTA o nominal em vez de guardá-lo "para
// depois". O que não é coletado não precisa ser protegido.
// ═══════════════════════════════════════════════════════════════

import type { EmailEncontrado, TelefoneEncontrado } from "../tipos.ts"
import { codigoDeArea, telefonesNoTexto, textoVisivel } from "../util/texto.ts"

/**
 * Papéis funcionais aceitos. A lista é fechada de propósito: qualquer
 * coisa fora dela é tratada como nominal e descartada.
 */
const PAPEIS_GENERICOS = new Set([
  "info", "contact", "contacts", "sales", "enquiries", "enquiry", "enquire",
  "admin", "office", "hello", "hi", "mail", "email", "general", "reception",
  "accounts", "accounting", "finance", "invoices", "purchasing", "orders",
  "order", "support", "help", "helpdesk", "service", "customerservice",
  "customercare", "team", "post", "ask", "quote", "quotes", "quotation",
  "estimating", "estimates", "bookings", "booking", "hire", "transport",
  "logistics", "operations", "ops", "workshop", "stores", "reception",
  "hr", "recruitment", "careers", "jobs", "marketing", "press", "media",
  "privacy", "dpo", "data", "legal", "compliance", "webmaster", "postmaster",
])

const RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,12}/g

/** Lixo que casa com a forma de e-mail mas não é endereço de ninguém. */
const RUIDO = [
  "sentry.io", "sentry-next", "wixpress.com", "example.com", "example.org",
  "domain.com", "yourdomain", "email.com", "company.com", "site.com",
  "@2x", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js",
  "@w3.org", "@schema.org", "godaddy.com", "wordpress.org", "squarespace.com",
  "cloudflare.com", "googleapis.com", "gstatic.com", "jquery.com",
]

function ehRuido(endereco: string): boolean {
  const e = endereco.toLowerCase()
  if (e.length > 80) return true
  if (RUIDO.some((r) => e.includes(r))) return true
  // Hash usado como cache-buster em nome de arquivo.
  if (/^[0-9a-f]{16,}@/.test(e)) return true
  // Extensão de imagem no domínio: quase sempre é um srcset mal lido.
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(e)) return true
  return false
}

export function papelDoEndereco(endereco: string): string {
  const local = endereco.split("@")[0] ?? ""
  return local.toLowerCase().split("+")[0]!.replace(/[._-]/g, "")
}

export function ehGenerico(endereco: string): boolean {
  return PAPEIS_GENERICOS.has(papelDoEndereco(endereco))
}

export interface PaginaLida {
  url: string
  html: string
}

/**
 * Extrai os endereços genéricos das páginas lidas.
 * `dominioDoSite` serve para priorizar o endereço do próprio domínio —
 * `info@parceiro.com` num rodapé não é contato da empresa.
 */
export function extrairEmails(paginas: PaginaLida[], dominioDoSite: string): EmailEncontrado[] {
  const raiz = dominioDoSite.toLowerCase().replace(/^www\./, "")
  const vistos = new Map<string, EmailEncontrado>()

  for (const p of paginas) {
    RE_EMAIL.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = RE_EMAIL.exec(p.html)) !== null) {
      const endereco = m[0].toLowerCase().replace(/[.,;:]+$/, "")
      if (ehRuido(endereco)) continue
      if (vistos.has(endereco)) continue
      if (!ehGenerico(endereco)) continue // nominal: descartado, não guardado
      vistos.set(endereco, {
        endereco,
        generico: true,
        papel: papelDoEndereco(endereco),
        nivelVerificacao: "nao_verificado",
        status: "nao_verificado",
        verificadoPor: "",
        encontradoEm: p.url,
      })
    }
  }

  // Endereço do próprio domínio primeiro — é o que o assinante deve usar.
  return [...vistos.values()].sort((a, b) => {
    const da = a.endereco.split("@")[1] ?? ""
    const db = b.endereco.split("@")[1] ?? ""
    const pa = da === raiz || da.endsWith("." + raiz) ? 0 : 1
    const pb = db === raiz || db.endsWith("." + raiz) ? 0 : 1
    return pa - pb
  })
}

export function extrairTelefones(
  paginas: PaginaLida[],
  areasDeDiscagemEsperadas: string[]
): TelefoneEncontrado[] {
  const vistos = new Map<string, TelefoneEncontrado>()
  for (const p of paginas) {
    for (const t of telefonesNoTexto(textoVisivel(p.html))) {
      if (vistos.has(t.e164)) continue
      const codigo = codigoDeArea(t.e164)
      vistos.set(t.e164, {
        e164: t.e164,
        original: t.original,
        areaCompativel: codigo !== null && areasDeDiscagemEsperadas.includes(codigo),
        encontradoEm: p.url,
      })
    }
  }
  return [...vistos.values()].sort((a, b) => Number(b.areaCompativel) - Number(a.areaCompativel))
}

/** Links internos que costumam levar à página de contato. */
export function linksDeContato(html: string, base: string, maximo: number): string[] {
  const alvos = ["contact", "contact-us", "contactus", "about", "about-us", "get-in-touch", "enquir", "find-us", "reach-us", "impressum"]
  const saida: string[] = []
  const re = /href=["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  let anfitriao: string
  try {
    anfitriao = new URL(base).host
  } catch {
    return []
  }
  while ((m = re.exec(html)) !== null && saida.length < maximo) {
    const bruto = m[1]!
    if (!alvos.some((a) => bruto.toLowerCase().includes(a))) continue
    let u: URL
    try {
      u = new URL(bruto, base)
    } catch {
      continue
    }
    if (u.host !== anfitriao) continue
    if (!/^https?:$/.test(u.protocol)) continue
    const limpo = u.origin + u.pathname
    if (!saida.includes(limpo) && limpo !== base) saida.push(limpo)
  }
  return saida
}
