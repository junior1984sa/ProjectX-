import { iniciarAssinaturaComTrial } from "@/lib/pagamento"
import { obterPais, type TipoPlano, type TipoGateway } from "@/types/prestador"
import type { DadosCartaoForm } from "@/lib/mercadopago"

/**
 * ROTEADOR DE GATEWAYS DE PAGAMENTO
 *
 * POR QUE ESTA CAMADA EXISTE:
 * o site chamava `criar-assinatura-mp` diretamente, o que amarrava o
 * produto ao Mercado Pago. Com esta camada, incluir Stripe ou PayPal
 * vira acrescentar um caso no `switch` e uma Edge Function — não uma
 * reescrita da tela de planos.
 *
 * POR QUE NÃO BASTA TROCAR O ENDEREÇO DA FUNÇÃO:
 * os gateways têm formatos de fluxo diferentes, e a tela precisa saber
 * disso ANTES de desenhar o formulário:
 *
 *   Mercado Pago → cartão é tokenizado dentro do app; sem redirecionar.
 *                  A tela mostra os campos de cartão.
 *   Stripe       → redireciona para o Stripe Checkout, hospedado por eles.
 *   PayPal       → redireciona para a aprovação no PayPal.
 *
 * Pedir número de cartão numa tela que vai redirecionar é pior do que
 * inútil: assusta o cliente e cria risco de conformidade à toa. Por isso
 * `formaDeCobranca()` responde qual formulário desenhar, e o resultado
 * da assinatura é um tipo discriminado em vez de um booleano.
 */

/** Como a tela deve se comportar para o país escolhido */
export type FormaDeCobranca =
  /** Coleta os dados do cartão no próprio app (Mercado Pago) */
  | "cartao-no-app"
  /** Manda o cliente para a página do gateway (Stripe, PayPal) */
  | "redirecionamento"
  /** Ainda não há como cobrar neste país */
  | "indisponivel"

export type ResultadoAssinatura =
  | { tipo: "sucesso"; trialDias: number }
  | { tipo: "redirecionar"; url: string }
  | { tipo: "indisponivel"; pais: string }
  | { tipo: "erro"; mensagem: string }

export function formaDeCobranca(pais: string): FormaDeCobranca {
  const gateway: TipoGateway = obterPais(pais).gateway
  switch (gateway) {
    case "mercadopago":
      return "cartao-no-app"
    case "stripe":
    case "paypal":
      return "redirecionamento"
    default:
      return "indisponivel"
  }
}

interface ParametrosAssinatura {
  plano: TipoPlano
  pais: string
  /** Obrigatório apenas quando a forma de cobrança é "cartao-no-app" */
  dadosCartao?: DadosCartaoForm
  precoPromocional?: number | null
}

/**
 * Inicia a assinatura pelo gateway que atende o país do assinante.
 *
 * Quem chama não precisa saber qual gateway respondeu: basta tratar os
 * quatro resultados possíveis. Isso mantém a tela de planos estável
 * quando Stripe e PayPal entrarem.
 */
export async function iniciarAssinatura({
  plano,
  pais,
  dadosCartao,
  precoPromocional = null,
}: ParametrosAssinatura): Promise<ResultadoAssinatura> {
  const gateway: TipoGateway = obterPais(pais).gateway

  switch (gateway) {
    case "mercadopago": {
      if (!dadosCartao) {
        return { tipo: "erro", mensagem: "Dados do cartão não informados." }
      }

      const resultado = await iniciarAssinaturaComTrial(
        plano,
        dadosCartao,
        precoPromocional
      )

      if (!resultado.sucesso) {
        return { tipo: "erro", mensagem: resultado.erro ?? "Erro ao assinar." }
      }
      return { tipo: "sucesso", trialDias: resultado.trialDias }
    }

    // ═══ Prontos para plugar, aguardando credenciais ═══
    // Quando o Stripe/PayPal for aprovado, o trabalho é:
    //   1. criar a Edge Function (ex: criar-assinatura-stripe) que devolve
    //      a URL de checkout;
    //   2. trocar o retorno abaixo por { tipo: "redirecionar", url };
    //   3. cadastrar os preços do país em `planos_regiao` no banco;
    //   4. mudar `gateway` do país em PAISES_DISPONIVEIS.
    // A tela de planos não muda: ela já sabe tratar "redirecionar".
    case "stripe":
    case "paypal":
      return { tipo: "indisponivel", pais }

    default:
      return { tipo: "indisponivel", pais }
  }
}
