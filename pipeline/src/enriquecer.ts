// ═══════════════════════════════════════════════════════════════
// ORQUESTRADOR — a cascata de descoberta, com a trava no meio
//
// Ordem: provedores gratuitos primeiro, pagos depois. Cada provedor só
// é consultado se o anterior não resolveu, e o id do que resolveu vai
// gravado em `descobertoPor` — sem isso, ninguém sabe se um número bom
// veio da heurística grátis ou da API paga.
//
// A trava de identidade fica ENTRE o palpite e a aceitação. É ela que
// permite palpitar à vontade: candidato errado é rejeitado, não entregue.
// ═══════════════════════════════════════════════════════════════

import type {
  EmpresaEnriquecida,
  ProvedorDeDominio,
  RegistroPublicado,
  ResultadoIdentidade,
  VerificadorDeEmail,
  CandidatoDominio,
} from "./tipos.ts"
import { FORCA_DA_PROVA, VERSAO_PIPELINE } from "./tipos.ts"
import { avaliarIdentidade } from "./identidade/trava.ts"
import { extrairEmails, extrairTelefones, linksDeContato, type PaginaLida } from "./contato/extrator.ts"
import { buscarHome, buscarPagina, podeBuscar, pausa, type OpcoesRede } from "./util/http.ts"
import { areaPostal } from "./util/texto.ts"

/** Códigos de discagem esperados por área postal — só para marcar compatibilidade. */
const DISCAGEM_POR_AREA: Record<string, string[]> = {
  M: ["0161", "01942", "01706", "01457", "01204"],
  BL: ["01204", "01942", "0161", "01706"],
  OL: ["0161", "01706", "01457", "01254"],
  SK: ["0161", "01625", "01663", "01298"],
  WN: ["01942", "01257", "0161", "01695"],
}

export interface OpcoesEnriquecimento {
  rede: OpcoesRede
  maxPaginasContato: number
  provedores: ProvedorDeDominio[]
  verificadores: VerificadorDeEmail[]
}

/** Lê a home e as páginas de contato de um host, respeitando robots.txt. */
async function lerSite(
  host: string,
  op: OpcoesEnriquecimento
): Promise<{ paginas: PaginaLida[]; base: string } | null> {
  const home = await buscarHome(host, op.rede)
  if (home === null) return null
  let base: string
  try {
    const u = new URL(home.urlFinal)
    base = `${u.protocol}//${u.host}`
  } catch {
    return null
  }
  const paginas: PaginaLida[] = [{ url: home.urlFinal, html: home.html }]

  for (const link of linksDeContato(home.html, base, op.maxPaginasContato)) {
    let caminho: string
    try {
      caminho = new URL(link).pathname
    } catch {
      continue
    }
    if (!(await podeBuscar(base, caminho, op.rede))) continue
    const p = await buscarPagina(link, op.rede)
    if (p !== null) paginas.push({ url: p.urlFinal, html: p.html })
    await pausa(300) // educação com o servidor alheio
  }
  return { paginas, base }
}

const SEM_PROVA: ResultadoIdentidade = {
  nivel: "nenhuma",
  aceito: false,
  confianca: 0,
  detalhe: "nenhum candidato de domínio passou na trava de identidade",
  contraindicacoes: [],
}

/**
 * Processa uma empresa da ponta a ponta.
 *
 * Contrato: NUNCA lança. Falha de rede vira registro sem site, que é o
 * resultado honesto — e o assinante recebe "sem contato", não lixo.
 */
export async function enriquecerEmpresa(
  empresa: EmpresaEnriquecida,
  op: OpcoesEnriquecimento
): Promise<RegistroPublicado> {
  const tentados: string[] = []
  let avaliados = 0
  let paginasLidas = 0

  let melhorSite: string | null = null
  let melhorIdentidade: ResultadoIdentidade = SEM_PROVA
  let melhorProvedor: string | null = null
  let melhorPaginas: PaginaLida[] = []
  let melhorBase = ""

  for (const provedor of op.provedores) {
    if (!provedor.disponivel()) continue
    tentados.push(provedor.id)

    let candidatos: CandidatoDominio[] = []
    try {
      candidatos = await provedor.candidatos(empresa)
    } catch {
      candidatos = []
    }

    for (const c of candidatos) {
      avaliados++
      const lido = await lerSite(c.host, op)
      if (lido === null) continue
      paginasLidas += lido.paginas.length

      const identidade = avaliarIdentidade({
        empresa,
        host: c.host,
        html: lido.paginas.map((p) => p.html).join("\n"),
      })
      if (!identidade.aceito) continue

      if (FORCA_DA_PROVA[identidade.nivel] > FORCA_DA_PROVA[melhorIdentidade.nivel]) {
        melhorSite = new URL(lido.base).host
        melhorIdentidade = identidade
        melhorProvedor = c.origemProvedorId
        melhorPaginas = lido.paginas
        melhorBase = lido.base
      }
      // Prova cabal: não há nível melhor para procurar.
      if (identidade.nivel === "numero_registro") break
    }

    // Achou com prova forte num provedor gratuito: não gasta o pago.
    if (melhorSite !== null && FORCA_DA_PROVA[melhorIdentidade.nivel] >= FORCA_DA_PROVA["cep_registrado"]) {
      break
    }
  }

  const base: RegistroPublicado = {
    empresa,
    site: melhorSite,
    identidade: melhorIdentidade,
    descobertoPor: melhorProvedor,
    emails: [],
    telefones: [],
    provedoresTentados: tentados,
    candidatosAvaliados: avaliados,
    paginasLidas,
    processadoEm: new Date().toISOString(),
    versaoPipeline: VERSAO_PIPELINE,
  }

  if (melhorSite === null) return base

  const dominio = melhorBase.replace(/^https?:\/\//, "")
  const emails = extrairEmails(melhorPaginas, dominio)
  const discagem = DISCAGEM_POR_AREA[areaPostal(empresa.cep)] ?? []
  base.telefones = extrairTelefones(melhorPaginas, discagem)

  // Verificação em cascata: a gratuita sempre roda; a paga, se ligada,
  // sobrepõe o resultado com um nível maior.
  for (const email of emails) {
    for (const v of op.verificadores) {
      if (!v.disponivel()) continue
      const r = await v.verificar(email.endereco)
      if (r.nivel === "nao_verificado" && email.nivelVerificacao !== "nao_verificado") continue
      email.status = r.status
      email.nivelVerificacao = r.nivel
      email.verificadoPor = v.id
    }
  }

  // Endereço comprovadamente morto não é entregue. "Sem contato" é melhor
  // que contato que volta.
  base.emails = emails.filter(
    (e) => e.status !== "sem_mx" && e.status !== "sintaxe_invalida" && e.status !== "dominio_descartavel"
  )
  return base
}

/** Um contato é entregável quando existe e não é lixo conhecido. */
export function temContatoEntregavel(r: RegistroPublicado): boolean {
  return r.emails.length > 0 || r.telefones.length > 0
}

export function temEmailEntregavel(r: RegistroPublicado): boolean {
  return r.emails.length > 0
}
