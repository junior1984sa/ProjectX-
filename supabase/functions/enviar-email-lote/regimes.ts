// ═══════════════════════════════════════════════════════════
// REGIME DE E-MAIL COMERCIAL, POR PAÍS
//
// Esta tabela é a AUTORIDADE. O front-end tem uma cópia em
// `src/lib/regimeEmail.ts` que serve só para explicar ao assinante,
// antes do disparo, por que um contato vai ser recusado. Se as duas
// divergirem, esta vence — a do navegador é editável por quem quiser.
//
// POR QUE ISSO EXISTE
// Um mesmo disparo pode ser lícito nos Estados Unidos e ilícito no
// Reino Unido. Sem saber o país do destinatário, a ferramenta não tem
// como cumprir nenhuma das duas regras. Por isso o país é obrigatório
// e o desconhecido é recusado, não liberado.
//
// RESSALVA HONESTA
// Esta tabela é uma trava de engenharia construída a partir de análise
// jurídica; ela não substitui advogado habilitado em cada jurisdição.
// Ela erra para o lado seguro de propósito: na dúvida, bloqueia.
// Data de referência da análise: agosto de 2026.
// ═══════════════════════════════════════════════════════════

export type Regime =
  /** Envio sem consentimento prévio é permitido, com deveres de forma. */
  | "optout"
  /** Exige consentimento prévio do destinatário. A ferramenta não tem
   *  como comprovar consentimento de um contato que ela mesma coletou
   *  de fonte pública, então o disparo é recusado. */
  | "optin"
  /** Não analisado. Recusado por padrão. */
  | "desconhecido"

export interface RegraPais {
  regime: Regime
  /** Norma de referência, para a mensagem de erro poder ser específica */
  norma: string
  /** Exige endereço postal físico do remetente no rodapé */
  exigeEnderecoPostal: boolean
  /** Exige que a mensagem se identifique como comunicação comercial */
  exigeRotuloAnuncio: boolean
}

const REGRAS: Record<string, RegraPais> = {
  // Estados Unidos — regime de opt-out. Envio comercial sem
  // consentimento é permitido, mas a lei impõe forma: identificação
  // verdadeira do remetente, endereço postal físico válido, aviso de
  // que é mensagem comercial e descadastro que funcione.
  US: {
    regime: "optout",
    norma: "CAN-SPAM Act (15 U.S.C. §7701 e seguintes)",
    exigeEnderecoPostal: true,
    exigeRotuloAnuncio: true,
  },

  // Brasil — não há lei específica de spam. Aplicam-se a LGPD e o
  // Código de Defesa do Consumidor. O envio a contato profissional
  // com legítimo interesse é defensável, desde que haja identificação
  // e oposição fácil.
  BR: {
    regime: "optout",
    norma: "LGPD (Lei 13.709/2018) e CDC (Lei 8.078/1990)",
    exigeEnderecoPostal: false,
    exigeRotuloAnuncio: false,
  },

  // Reino Unido — regime restritivo. As regras de marketing eletrônico
  // exigem consentimento prévio na maior parte dos casos, com exceções
  // estreitas que dependem de relação comercial anterior. Um contato
  // extraído de base pública não passa nessa porta.
  GB: {
    regime: "optin",
    norma: "PECR (Privacy and Electronic Communications Regulations) e UK GDPR",
    exigeEnderecoPostal: true,
    exigeRotuloAnuncio: true,
  },

  // Austrália — exige consentimento expresso ou inferido, identificação
  // do remetente e descadastro funcional.
  AU: {
    regime: "optin",
    norma: "Spam Act 2003 (Cth)",
    exigeEnderecoPostal: true,
    exigeRotuloAnuncio: true,
  },

  // Canadá — dos regimes mais rígidos, com penalidade alta por mensagem.
  CA: {
    regime: "optin",
    norma: "CASL (Canada's Anti-Spam Legislation, S.C. 2010, c. 23)",
    exigeEnderecoPostal: true,
    exigeRotuloAnuncio: true,
  },

  // União Europeia — opt-in na maior parte dos casos.
  // Lista explícita: herdar o regime de um continente inteiro por
  // dedução automática esconde exceções nacionais reais.
  DE: regraUE("Alemanha"),
  ES: regraUE("Espanha"),
  FR: regraUE("França"),
  IT: regraUE("Itália"),
  PT: regraUE("Portugal"),
  NL: regraUE("Países Baixos"),
  IE: regraUE("Irlanda"),

  // América Latina — ainda não analisados um a um. Ficam explicitamente
  // desconhecidos em vez de herdarem a regra brasileira: proximidade
  // geográfica não é argumento jurídico.
  MX: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
  AR: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
  CL: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
  CO: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
  PY: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
  NZ: { regime: "desconhecido", norma: "não analisado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true },
}

function regraUE(_pais: string): RegraPais {
  return {
    regime: "optin",
    norma: "Diretiva 2002/58/CE (ePrivacy) e GDPR (Regulamento 2016/679)",
    exigeEnderecoPostal: true,
    exigeRotuloAnuncio: true,
  }
}

/**
 * País não mapeado NÃO vira permitido.
 *
 * Esse é o ponto em que a maior parte das implementações erra: um
 * `?? { regime: "optout" }` transformaria todo país que ninguém
 * analisou numa autorização de envio. O padrão aqui é o contrário.
 */
export function regraDoPais(pais: string | null | undefined): RegraPais {
  if (!pais) {
    return { regime: "desconhecido", norma: "país não informado", exigeEnderecoPostal: true, exigeRotuloAnuncio: true }
  }
  return (
    REGRAS[pais.trim().toUpperCase()] ?? {
      regime: "desconhecido",
      norma: "país não mapeado",
      exigeEnderecoPostal: true,
      exigeRotuloAnuncio: true,
    }
  )
}

export function podeEnviarPara(pais: string | null | undefined): boolean {
  return regraDoPais(pais).regime === "optout"
}
