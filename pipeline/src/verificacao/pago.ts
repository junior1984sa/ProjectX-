// ═══════════════════════════════════════════════════════════════
// ENCAIXE PAGO: verificador de e-mail por SMTP com IP limpo
//
// ESTADO: implementado e DESLIGADO por falta de chave.
// Para ligar: definir VERIFICADOR_EMAIL_URL e VERIFICADOR_EMAIL_KEY.
//
// Custo de referência (fontes secundárias, confirmar com o fornecedor
// antes de contratar):
//   ZeroBounce   ~US$ 8,00/mil no pré-pago, ~US$ 4,00/mil a partir de 250k
//   NeverBounce   US$ 8,00/mil até 10k, US$ 3,00–4,00/mil acima de 100k
//   Bouncer       US$ 2,00–8,00/mil; US$ 1.000 por 500k créditos
//
// O adaptador é genérico de propósito: espera um endpoint que receba
// `?email=` e devolva JSON com um campo de status. O mapeamento de
// status por fornecedor está em `MAPA_DE_STATUS` — trocar de fornecedor
// é acrescentar uma entrada lá, não reescrever o pipeline.
//
// TETO ESTRUTURAL, que nenhum fornecedor resolve: 13% dos domínios com
// MX medidos são catch-all — aceitam qualquer destinatário. Nesses, SMTP
// não distingue endereço bom de inventado, nunca. Eles precisam sair
// como `arriscado_catchall`, não como `verificado`. Fingir o contrário
// é a definição de dado errado com cara de dado certo.
// ═══════════════════════════════════════════════════════════════

import type {
  NivelVerificacao,
  ResultadoVerificacao,
  StatusEmail,
  VerificadorDeEmail,
} from "../tipos.ts"
import { buscarTexto, type OpcoesRede } from "../util/http.ts"

/**
 * Rótulos de status por fornecedor → nosso vocabulário.
 * O que não estiver mapeado vira `nao_verificado`, nunca `verificado`:
 * na dúvida, o produto promete menos.
 */
const MAPA_DE_STATUS: Record<string, Record<string, StatusEmail>> = {
  generico: {
    valid: "verificado",
    deliverable: "verificado",
    ok: "verificado",
    risky: "arriscado_catchall",
    catch_all: "arriscado_catchall",
    "catch-all": "arriscado_catchall",
    accept_all: "arriscado_catchall",
    unknown: "nao_verificado",
    invalid: "sintaxe_invalida",
    undeliverable: "sintaxe_invalida",
    disposable: "dominio_descartavel",
    spamtrap: "sintaxe_invalida",
    abuse: "sintaxe_invalida",
    do_not_mail: "sintaxe_invalida",
  },
  zerobounce: {
    valid: "verificado",
    catch_all: "arriscado_catchall",
    unknown: "nao_verificado",
    invalid: "sintaxe_invalida",
    spamtrap: "sintaxe_invalida",
    abuse: "sintaxe_invalida",
    do_not_mail: "sintaxe_invalida",
  },
  neverbounce: {
    valid: "verificado",
    catchall: "arriscado_catchall",
    unknown: "nao_verificado",
    invalid: "sintaxe_invalida",
    disposable: "dominio_descartavel",
  },
  bouncer: {
    deliverable: "verificado",
    risky: "arriscado_catchall",
    unknown: "nao_verificado",
    undeliverable: "sintaxe_invalida",
  },
}

/** Campos onde os fornecedores costumam colocar o veredito. */
const CAMPOS_DE_STATUS = ["status", "result", "state", "deliverability", "verdict"]

function extrairStatus(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null
  const obj = json as Record<string, unknown>
  for (const c of CAMPOS_DE_STATUS) {
    const v = obj[c]
    if (typeof v === "string" && v.length > 0) return v.toLowerCase().replace(/\s+/g, "_")
  }
  // Alguns respondem { email: { status: ... } } ou { data: { status: ... } }
  for (const aninhado of ["email", "data", "result"]) {
    const v = obj[aninhado]
    if (typeof v === "object" && v !== null) {
      const r = extrairStatus(v)
      if (r !== null) return r
    }
  }
  return null
}

export class VerificadorPago implements VerificadorDeEmail {
  readonly id: string
  readonly camada = "paga" as const
  readonly descricao = "Verificação SMTP por fornecedor, a partir de IP com reputação limpa"
  readonly nivelMaximo: NivelVerificacao = "smtp_fornecedor"

  private readonly url: string | null
  private readonly chave: string | null
  private readonly fornecedor: string
  private readonly op: OpcoesRede

  constructor(url: string | null, chave: string | null, fornecedor: string, op: OpcoesRede) {
    this.url = url
    this.chave = chave
    this.fornecedor = fornecedor
    this.op = op
    this.id = `verificador-pago:${fornecedor}`
  }

  disponivel(): boolean {
    return (
      this.url !== null && this.url.length > 0 && this.chave !== null && this.chave.length > 0
    )
  }

  async verificar(endereco: string): Promise<ResultadoVerificacao> {
    if (!this.disponivel()) {
      return {
        status: "nao_verificado",
        nivel: "nao_verificado",
        detalhe: "verificador pago desligado (sem VERIFICADOR_EMAIL_URL/KEY)",
      }
    }
    const alvo = new URL(this.url!)
    alvo.searchParams.set("email", endereco)
    alvo.searchParams.set("api_key", this.chave!)

    const txt = await buscarTexto(alvo.toString(), this.op)
    if (txt === null) {
      // Fornecedor fora do ar NUNCA vira "inválido". Vira "não verificado",
      // e o registro sai com o nível que a camada gratuita conseguiu.
      return {
        status: "nao_verificado",
        nivel: "nao_verificado",
        detalhe: "fornecedor não respondeu",
      }
    }
    let bruto: string | null
    try {
      bruto = extrairStatus(JSON.parse(txt))
    } catch {
      bruto = null
    }
    if (bruto === null) {
      return {
        status: "nao_verificado",
        nivel: "nao_verificado",
        detalhe: "resposta do fornecedor sem campo de status reconhecido",
      }
    }
    const mapa = MAPA_DE_STATUS[this.fornecedor] ?? MAPA_DE_STATUS["generico"]!
    const status = mapa[bruto] ?? "nao_verificado"
    return {
      status,
      nivel: status === "nao_verificado" ? "nao_verificado" : "smtp_fornecedor",
      detalhe: `${this.fornecedor}: ${bruto}`,
    }
  }
}
