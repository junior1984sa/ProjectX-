// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: webhook-mercadopago
// Recebe notificações do Mercado Pago para dois tipos de evento:
//
// 1. "payment" — uma cobrança foi processada (a primeira cobrança
//    automática após o trial, ou uma renovação mensal/anual).
//    Quando aprovada, garante que o perfil saia do trial e
//    permaneça com status_assinatura = 'ativa', e renova os
//    créditos do ciclo normal (100 ou 150).
//
// 2. "subscription_preapproval" — a assinatura recorrente mudou
//    de status (ex: cancelada diretamente no painel do Mercado
//    Pago pelo usuário, ou pausada por falha de pagamento).
//
// Deploy: supabase functions deploy webhook-mercadopago --no-verify-jwt
//
// Configure esta URL no painel do Mercado Pago:
// Sua aplicação > Webhooks > URL de notificação:
// https://SEU_PROJETO.supabase.co/functions/v1/webhook-mercadopago
// ═══════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2"

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const tipo = url.searchParams.get("type") ?? url.searchParams.get("topic")
    let entidadeId = url.searchParams.get("id") ?? url.searchParams.get("data.id")

    if (req.body) {
      try {
        const corpo = await req.json()
        if (corpo?.data?.id) entidadeId = corpo.data.id
      } catch {
        // corpo vazio ou não-JSON, segue com os dados da query string
      }
    }

    if (!entidadeId) {
      return new Response(JSON.stringify({ recebido: true }), { status: 200 })
    }

    // ═══ Evento de PAGAMENTO (cobrança processada) ═══
    if (tipo === "payment") {
      await processarPagamento(entidadeId)
    }

    // ═══ Evento de ASSINATURA (mudança de status do preapproval) ═══
    if (tipo === "subscription_preapproval" || tipo === "preapproval") {
      await processarMudancaAssinatura(entidadeId)
    }

    return new Response(JSON.stringify({ recebido: true, processado: true }), { status: 200 })
  } catch (erro) {
    console.error("Erro no processamento do webhook:", erro)
    return new Response(JSON.stringify({ recebido: true, erro: "interno" }), { status: 200 })
  }
})

async function processarPagamento(paymentId: string) {
  const respostaPagamento = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` } }
  )

  if (!respostaPagamento.ok) {
    console.error("Erro ao consultar pagamento no MP:", await respostaPagamento.text())
    return
  }

  const pagamento = await respostaPagamento.json()
  const referenciaExterna: string = pagamento.external_reference ?? ""
  const statusPagamento: string = pagamento.status

  const partes = referenciaExterna.split("_")
  const profileId = partes[0]
  const plano = partes[1] as "mensal" | "anual" | undefined

  if (!profileId) {
    console.error("Referência externa inválida:", referenciaExterna)
    return
  }

  const statusAssinatura =
    statusPagamento === "approved" ? "aprovada" :
    statusPagamento === "rejected" ? "rejeitada" :
    statusPagamento === "cancelled" ? "cancelada" : "pendente"

  const { data: assinaturasExistentes } = await supabaseAdmin
    .from("assinaturas")
    .select("id")
    .eq("profile_id", profileId)
    .eq("plano", plano ?? "mensal")
    .order("criado_em", { ascending: false })
    .limit(1)

  if (assinaturasExistentes && assinaturasExistentes.length > 0) {
    const agora = new Date()
    const proximaCobranca = new Date(agora)
    // Duração do ciclo conforme o plano contratado
    const mesesDoPlano: Record<string, number> = {
      mensal: 1,
      trimestral: 3,
      semestral: 6,
      anual: 12,
    }
    proximaCobranca.setMonth(
      proximaCobranca.getMonth() + (mesesDoPlano[plano ?? "mensal"] ?? 1)
    )

    await supabaseAdmin
      .from("assinaturas")
      .update({
        status: statusAssinatura,
        mercadopago_payment_id: String(paymentId),
        data_inicio: statusPagamento === "approved" ? agora.toISOString() : null,
        proxima_cobranca: statusPagamento === "approved" ? proximaCobranca.toISOString() : null,
      })
      .eq("id", assinaturasExistentes[0].id)
  }

  if (statusPagamento === "approved") {
    // Confirma o perfil como ativo (saindo do trial, se ainda estivesse nele)
    // e renova o ciclo normal de créditos (100 ou 150, conforme o plano).
    await supabaseAdmin
      .from("profiles")
      .update({ status_assinatura: "ativa", em_trial: false })
      .eq("id", profileId)

    await supabaseAdmin.rpc("inicializar_creditos_por_plano", {
      p_profile_id: profileId,
      p_plano: plano ?? "mensal",
    })

    console.log(`Perfil ${profileId} confirmado como ativo após cobrança aprovada.`)
  } else if (statusPagamento === "rejected") {
    // A cobrança recorrente falhou (ex: cartão sem limite). Marca atraso,
    // mas não cancela de imediato — dá chance de o Mercado Pago tentar de novo.
    await supabaseAdmin
      .from("profiles")
      .update({ status_assinatura: "atraso" })
      .eq("id", profileId)

    console.log(`Cobrança rejeitada para o perfil ${profileId}. Status marcado como 'atraso'.`)
  }
}

async function processarMudancaAssinatura(preapprovalId: string) {
  const respostaAssinatura = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    { headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` } }
  )

  if (!respostaAssinatura.ok) {
    console.error("Erro ao consultar assinatura no MP:", await respostaAssinatura.text())
    return
  }

  const assinaturaMP = await respostaAssinatura.json()
  const referenciaExterna: string = assinaturaMP.external_reference ?? ""
  const statusMP: string = assinaturaMP.status // authorized, paused, cancelled

  const profileId = referenciaExterna.split("_")[0]
  if (!profileId) return

  if (statusMP === "cancelled") {
    await supabaseAdmin.rpc("registrar_cancelamento", { p_profile_id: profileId })
    console.log(`Assinatura do perfil ${profileId} cancelada via Mercado Pago.`)
  } else if (statusMP === "paused") {
    await supabaseAdmin
      .from("profiles")
      .update({ status_assinatura: "atraso" })
      .eq("id", profileId)
    console.log(`Assinatura do perfil ${profileId} pausada (falha de pagamento).`)
  }
}
