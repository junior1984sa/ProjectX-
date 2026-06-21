// Tipos mínimos para o SDK global do Mercado Pago (carregado via <script> no index.html)
declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance
  }
}

interface MercadoPagoInstance {
  createCardToken: (dados: DadosCartao) => Promise<{ id: string }>
}

interface DadosCartao {
  cardNumber: string
  cardholderName: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  identificationType: string
  identificationNumber: string
}

let instanciaMP: MercadoPagoInstance | null = null

/**
 * Inicializa (uma vez) a instância do SDK do Mercado Pago usando a Public Key.
 * A Public Key é segura para expor no frontend — é o Access Token que nunca pode.
 */
function obterInstanciaMP(): MercadoPagoInstance {
  if (instanciaMP) return instanciaMP

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as string
  if (!publicKey) {
    throw new Error("VITE_MERCADOPAGO_PUBLIC_KEY não configurada no .env")
  }
  if (!window.MercadoPago) {
    throw new Error("SDK do Mercado Pago não carregado. Verifique o script no index.html.")
  }

  instanciaMP = new window.MercadoPago(publicKey, { locale: "pt-BR" })
  return instanciaMP
}

export interface DadosCartaoForm {
  numero: string
  nomeTitular: string
  mesValidade: string
  anoValidade: string
  cvv: string
  cpf: string
}

/**
 * Tokeniza os dados do cartão no navegador — o número e CVV nunca chegam
 * ao nosso backend, só o token resultante (seguro, de uso único).
 */
export async function tokenizarCartao(
  dados: DadosCartaoForm
): Promise<{ tokenId: string | null; erro: string | null }> {
  try {
    const mp = obterInstanciaMP()

    const resultado = await mp.createCardToken({
      cardNumber: dados.numero.replace(/\s/g, ""),
      cardholderName: dados.nomeTitular,
      cardExpirationMonth: dados.mesValidade,
      cardExpirationYear: dados.anoValidade,
      securityCode: dados.cvv,
      identificationType: "CPF",
      identificationNumber: dados.cpf.replace(/\D/g, ""),
    })

    return { tokenId: resultado.id, erro: null }
  } catch (erro) {
    console.error("Erro ao tokenizar cartão:", erro)
    return {
      tokenId: null,
      erro: "Não foi possível validar os dados do cartão. Verifique e tente novamente.",
    }
  }
}
