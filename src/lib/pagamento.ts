import { supabase } from "@/lib/supabase"
import { tokenizarCartao, type DadosCartaoForm } from "@/lib/mercadopago"
import type { TipoPlano } from "@/types/prestador"

interface RespostaCriarAssinatura {
  preapproval_id?: string
  status?: string
  trial_dias?: number
  erro?: string
}

interface RespostaCancelar {
  sucesso?: boolean
  mensagem?: string
  erro?: string
}

/**
 * Tokeniza o cartão informado e chama a Edge Function que cria a assinatura
 * recorrente no Mercado Pago, já com o período de teste grátis configurado.
 * Não há redirecionamento externo: o cartão é validado aqui mesmo no app.
 */
export async function iniciarAssinaturaComTrial(
  plano: TipoPlano,
  dadosCartao: DadosCartaoForm
): Promise<{ sucesso: boolean; trialDias: number; erro: string | null }> {
  const { data: sessao } = await supabase.auth.getSession()
  const token = sessao.session?.access_token

  if (!token) {
    return { sucesso: false, trialDias: 0, erro: "Você precisa estar logado para assinar." }
  }

  // 1. Tokeniza o cartão no navegador (número/CVV nunca passam pelo nosso backend)
  const { tokenId, erro: erroToken } = await tokenizarCartao(dadosCartao)

  if (erroToken || !tokenId) {
    return { sucesso: false, trialDias: 0, erro: erroToken ?? "Erro ao validar o cartão." }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/criar-assinatura-mp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plano, cardTokenId: tokenId }),
    })

    const dados: RespostaCriarAssinatura = await resposta.json()

    if (!resposta.ok || dados.erro) {
      return { sucesso: false, trialDias: 0, erro: dados.erro ?? "Erro ao iniciar a assinatura." }
    }

    return { sucesso: true, trialDias: dados.trial_dias ?? 5, erro: null }
  } catch (erro) {
    console.error("Erro ao chamar Edge Function de pagamento:", erro)
    return { sucesso: false, trialDias: 0, erro: "Erro de conexão. Tente novamente." }
  }
}

/**
 * Cancela a assinatura ativa do usuário. Pensado para ser um único clique,
 * sem formulário de "motivo do cancelamento" nem etapas extras.
 */
export async function cancelarAssinatura(): Promise<{ sucesso: boolean; erro: string | null }> {
  const { data: sessao } = await supabase.auth.getSession()
  const token = sessao.session?.access_token

  if (!token) {
    return { sucesso: false, erro: "Sessão expirada. Faça login novamente." }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  try {
    const resposta = await fetch(`${supabaseUrl}/functions/v1/cancelar-assinatura`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const dados: RespostaCancelar = await resposta.json()

    if (!resposta.ok || dados.erro) {
      return { sucesso: false, erro: dados.erro ?? "Erro ao cancelar a assinatura." }
    }

    return { sucesso: true, erro: null }
  } catch (erro) {
    console.error("Erro ao chamar Edge Function de cancelamento:", erro)
    return { sucesso: false, erro: "Erro de conexão. Tente novamente." }
  }
}

/**
 * Aplica um código de cortesia ao perfil do usuário logado, concedendo
 * acesso gratuito por um período definido (ex: 14 dias), sem precisar
 * de cartão de crédito. Usado para presentear parceiros/colaboradores.
 */
export async function aplicarCodigoCortesia(
  codigo: string
): Promise<{ sucesso: boolean; mensagem: string; diasConcedidos: number }> {
  const { data: sessao } = await supabase.auth.getSession()
  const usuarioId = sessao.session?.user.id

  if (!usuarioId) {
    return { sucesso: false, mensagem: "Você precisa estar logado.", diasConcedidos: 0 }
  }

  const { data, error } = await supabase.rpc("aplicar_codigo_cortesia", {
    p_profile_id: usuarioId,
    p_codigo: codigo,
  })

  if (error) {
    console.error("Erro ao aplicar código de cortesia:", error.message)
    return { sucesso: false, mensagem: "Erro ao validar o código. Tente novamente.", diasConcedidos: 0 }
  }

  const resultado = data?.[0]
  if (!resultado) {
    return { sucesso: false, mensagem: "Não foi possível validar o código.", diasConcedidos: 0 }
  }

  return {
    sucesso: resultado.sucesso,
    mensagem: resultado.mensagem,
    diasConcedidos: resultado.dias_concedidos,
  }
}
