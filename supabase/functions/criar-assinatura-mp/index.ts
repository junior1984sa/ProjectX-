// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: criar-assinatura-mp
// Cria uma ASSINATURA RECORRENTE (preapproval) no Mercado Pago,
// com período de teste gratuito de 5 dias. Ao final do trial, o
// Mercado Pago cobra automaticamente no cartão cadastrado — sem
// nova ação do usuário — a menos que ele cancele antes.
//
// A chave secreta do Mercado Pago (Access Token) fica SÓ aqui,
// nunca no frontend.
//
// Deploy: supabase functions deploy criar-assinatura-mp
// Secret: supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx
// ═══════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2"

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const URL_BASE_APP = Deno.env.get("URL_BASE_APP") ?? "http://localhost:5173"
const DIAS_TRIAL = Number(Deno.env.get("DIAS_TRIAL") ?? "5")

const PRECOS = {
  mensal: Number(Deno.env.get("PRECO_PLANO_MENSAL") ?? "99.00"),
  anual: Number(Deno.env.get("PRECO_PLANO_ANUAL") ?? "950.00"),
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { plano, cardTokenId } = await req.json()

    if (plano !== "mensal" && plano !== "anual") {
      return new Response(
        JSON.stringify({ erro: "Plano inválido. Use 'mensal' ou 'anual'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!cardTokenId) {
      return new Response(
        JSON.stringify({ erro: "Cartão não informado. É necessário cadastrar um cartão para iniciar o teste gratuito." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ erro: "Não autenticado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const token = authHeader.replace("Bearer ", "")
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ erro: "Usuário inválido ou sessão expirada." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const profileId = userData.user.id
    const valor = PRECOS[plano as "mensal" | "anual"]

    const { data: perfil, error: erroPerfil } = await supabaseAdmin
      .from("profiles")
      .select("id, nome_empresa, email_contato")
      .eq("id", profileId)
      .maybeSingle()

    if (erroPerfil || !perfil) {
      return new Response(
        JSON.stringify({ erro: "Complete seu perfil antes de assinar." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const referenciaExterna = `${profileId}_${plano}_${Date.now()}`

    // ═══ Cria a ASSINATURA RECORRENTE (preapproval) com trial ═══
    // frequency_type "months" com frequency 1 (mensal) ou 12 (anual, cobrado
    // de uma vez por ano). O free_trial define os dias sem cobrança.
    const corpoAssinatura = {
      reason: `ProspectX — Plano ${plano === "mensal" ? "Mensal" : "Anual"}`,
      external_reference: referenciaExterna,
      payer_email: perfil.email_contato,
      card_token_id: cardTokenId,
      auto_recurring: {
        frequency: plano === "mensal" ? 1 : 12,
        frequency_type: "months",
        transaction_amount: valor,
        currency_id: "BRL",
        free_trial: {
          frequency: DIAS_TRIAL,
          frequency_type: "days",
        },
      },
      back_url: `${URL_BASE_APP}/assinatura/sucesso`,
      status: "authorized",
    }

    const respostaMP = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(corpoAssinatura),
    })

    const dadosMP = await respostaMP.json()

    if (!respostaMP.ok) {
      console.error("Erro do Mercado Pago:", dadosMP)
      return new Response(
        JSON.stringify({ erro: "Erro ao criar assinatura no Mercado Pago.", detalhes: dadosMP }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Registra a assinatura no banco
    const { error: erroInsercao } = await supabaseAdmin.from("assinaturas").insert({
      profile_id: profileId,
      plano,
      mercadopago_preapproval_id: dadosMP.id,
      status: "aprovada",
      valor,
      trial_dias: DIAS_TRIAL,
      data_inicio: new Date().toISOString(),
    })

    if (erroInsercao) {
      console.error("Erro ao registrar assinatura:", erroInsercao)
    }

    // Ativa o período de trial no perfil + concede os 20 créditos de teste
    const { error: erroTrial } = await supabaseAdmin.rpc("iniciar_trial", {
      p_profile_id: profileId,
      p_dias: DIAS_TRIAL,
    })

    if (erroTrial) {
      console.error("Erro ao iniciar trial:", erroTrial)
    }

    return new Response(
      JSON.stringify({
        preapproval_id: dadosMP.id,
        status: dadosMP.status,
        trial_dias: DIAS_TRIAL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (erro) {
    console.error("Erro inesperado:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao processar a solicitação." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
