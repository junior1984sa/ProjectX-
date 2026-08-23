// ═══════════════════════════════════════════════════════════════
// VERIFICADOR GRATUITO — sintaxe, MX, descartável, papel
//
// O que ele NÃO faz, e por quê: sondagem SMTP.
// Medido na avaliação da fonte: de 28 sondagens, 10 (36%) foram
// recusadas por bloqueio contra o NOSSO endereço IP —
//   "550 5.7.1 Service unavailable, Client host [...] blocked"
//   "554 The IP address of the sender (186.205.22.231) was found in a blocklist"
//   "554 5.0.5 ip listed on rbl"
// — e não por defeito do endereço. Rodar SMTP daqui não mede a qualidade
// do e-mail; mede a reputação do nosso IP. O resultado seria descartar
// endereços bons em massa, entregando ao assinante MENOS do que existe.
//
// Por isso o teto honesto deste verificador é `mx_presente`. Ele nunca
// devolve `verificado` — esse nível só existe com verificador pago.
//
// Custo: zero. Nenhuma consulta paga, nenhuma conexão SMTP.
// ═══════════════════════════════════════════════════════════════

import { resolveMx } from "node:dns/promises"
import type {
  NivelVerificacao,
  ResultadoVerificacao,
  VerificadorDeEmail,
} from "../tipos.ts"
import { ehGenerico } from "../contato/extrator.ts"

const RE_SINTAXE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/

/**
 * Domínios de e-mail temporário. Um endereço aqui é lixo garantido:
 * a caixa deixa de existir em minutos.
 */
const DESCARTAVEIS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
  "getnada.com", "dispostable.com", "maildrop.cc", "fakeinbox.com",
  "sharklasers.com", "grr.la", "spam4.me", "mohmal.com", "emailondeck.com",
  "tempr.email", "mailnesia.com", "mytemp.email", "burnermail.io",
])

/**
 * Provedores de caixa pessoal. Não são inválidos — muita microempresa
 * britânica usa `@gmail.com` mesmo — mas o endereço NÃO prova vínculo
 * com a empresa, então entra com status mais baixo.
 */
const CAIXAS_PESSOAIS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.co.uk",
  "outlook.com", "live.co.uk", "live.com", "yahoo.com", "yahoo.co.uk",
  "aol.com", "icloud.com", "me.com", "btinternet.com", "sky.com",
  "virginmedia.com", "talktalk.net", "ntlworld.com", "blueyonder.co.uk",
])

const cacheMx = new Map<string, string[]>()

async function mxDoDominio(dominio: string): Promise<string[]> {
  const cache = cacheMx.get(dominio)
  if (cache !== undefined) return cache
  let hosts: string[] = []
  try {
    const r = await resolveMx(dominio)
    hosts = r
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((x) => x.exchange.replace(/\.$/, ""))
      .filter((x) => x.length > 0)
  } catch {
    hosts = []
  }
  cacheMx.set(dominio, hosts)
  return hosts
}

export class VerificadorGratuito implements VerificadorDeEmail {
  readonly id = "verificador-gratuito"
  readonly camada = "gratuita" as const
  readonly descricao = "Sintaxe + registro MX + domínio descartável + papel funcional"
  /** Teto honesto. `verificado` exige SMTP, e SMTP exige IP limpo. */
  readonly nivelMaximo: NivelVerificacao = "mx_presente"

  disponivel(): boolean {
    return true
  }

  async verificar(endereco: string): Promise<ResultadoVerificacao> {
    const e = endereco.trim().toLowerCase()

    if (!RE_SINTAXE.test(e)) {
      return { status: "sintaxe_invalida", nivel: "sintaxe", detalhe: "forma inválida" }
    }
    const dominio = e.split("@")[1]!
    if (DESCARTAVEIS.has(dominio)) {
      return {
        status: "dominio_descartavel",
        nivel: "sintaxe",
        detalhe: `domínio de e-mail temporário (${dominio})`,
      }
    }

    const mx = await mxDoDominio(dominio)
    if (mx.length === 0) {
      return {
        status: "sem_mx",
        nivel: "sintaxe",
        detalhe: `${dominio} não publica registro MX — não recebe e-mail`,
      }
    }

    const pessoal = CAIXAS_PESSOAIS.has(dominio)
    const generico = ehGenerico(e)
    const detalhe = `MX ativo (${mx[0]})${pessoal ? "; caixa pessoal, não prova vínculo com a empresa" : ""}${generico ? "; papel funcional" : ""}`

    // `provavel` é o topo do que esta camada pode afirmar com honestidade:
    // o domínio recebe e-mail e o endereço é de papel funcional. Se a
    // caixa existe, só o SMTP diria — e o SMTP não é nosso.
    return {
      status: pessoal ? "nao_verificado" : "provavel",
      nivel: "mx_presente",
      detalhe,
    }
  }
}
