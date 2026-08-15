// ═══════════════════════════════════════════════════════════
// REGIME DE E-MAIL COMERCIAL — espelho para a interface
//
// A AUTORIDADE é `supabase/functions/enviar-email-lote/regimes.ts`.
// Este arquivo existe por um motivo só: avisar o assinante ANTES de
// ele escrever a mensagem, para que ele não redija um texto e só
// depois descubra que metade da lista não pode receber.
//
// Nunca confie nesta cópia como controle. Ela roda no navegador, e
// o navegador é do usuário. A recusa que vale é a do servidor.
//
// Se as duas divergirem, a do servidor vence — e a divergência é bug.
// Data de referência: agosto de 2026.
// ═══════════════════════════════════════════════════════════

export type RegimeEmail = "optout" | "optin" | "desconhecido"

interface RegraExibicao {
  regime: RegimeEmail
  norma: string
  exigeEnderecoPostal: boolean
}

const OPTIN_UE: RegraExibicao = {
  regime: "optin",
  norma: "ePrivacy + GDPR",
  exigeEnderecoPostal: true,
}

const REGRAS: Record<string, RegraExibicao> = {
  US: { regime: "optout", norma: "CAN-SPAM Act", exigeEnderecoPostal: true },
  BR: { regime: "optout", norma: "LGPD + CDC", exigeEnderecoPostal: false },
  GB: { regime: "optin", norma: "PECR + UK GDPR", exigeEnderecoPostal: true },
  AU: { regime: "optin", norma: "Spam Act 2003", exigeEnderecoPostal: true },
  CA: { regime: "optin", norma: "CASL", exigeEnderecoPostal: true },
  DE: OPTIN_UE, ES: OPTIN_UE, FR: OPTIN_UE, IT: OPTIN_UE,
  PT: OPTIN_UE, NL: OPTIN_UE, IE: OPTIN_UE,
}

const DESCONHECIDO: RegraExibicao = {
  regime: "desconhecido",
  norma: "país não analisado",
  exigeEnderecoPostal: true,
}

/** País não mapeado é desconhecido, nunca liberado. Igual ao servidor. */
export function regraEmailDoPais(pais: string | null | undefined): RegraExibicao {
  if (!pais) return DESCONHECIDO
  return REGRAS[pais.trim().toUpperCase()] ?? DESCONHECIDO
}

export function podeReceberEmail(pais: string | null | undefined): boolean {
  return regraEmailDoPais(pais).regime === "optout"
}

/** Países do lote que exigem endereço postal do remetente no rodapé. */
export function paisesQueExigemEnderecoPostal(paises: (string | null | undefined)[]): string[] {
  const conjunto = new Set<string>()
  for (const p of paises) {
    if (!p) continue
    const regra = regraEmailDoPais(p)
    if (regra.regime === "optout" && regra.exigeEnderecoPostal) {
      conjunto.add(p.trim().toUpperCase())
    }
  }
  return [...conjunto]
}

/**
 * Explicação curta para a tela. O assinante precisa entender que o
 * contato foi recusado por regra do país dele, e não por falha do
 * produto — senão a leitura natural é "esse sistema não funciona".
 */
export function motivoDaRecusa(pais: string | null | undefined): string {
  const regra = regraEmailDoPais(pais)
  if (regra.regime === "optin") {
    return `${regra.norma} exige consentimento prévio do destinatário`
  }
  return "país ainda não liberado para disparo"
}
