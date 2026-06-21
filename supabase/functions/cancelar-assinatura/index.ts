// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: cancelar-assinatura
// Cancela a assinatura recorrente do usuário no Mercado Pago
// e atualiza o status no banco. Pensada para ser UM clique:
// o usuário não precisa justificar, ligar para suporte, nem
// esperar aprovação — o cancelamento é imediato.
//
// Deploy: supabase functions deploy cancelar-assinatura
// ═══════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2"

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
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

    // Busca a assinatura mais recente e ativa desse perfil
    const { data: assinatura, error: erroAssinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("id, mercadopago_preapproval_id")
      .eq("profile_id", profileId)
      .in("status", ["aprovada", "pendente"])
      .is("cancelado_em", null)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (erroAssinatura || !assinatura?.mercadopago_preapproval_id) {
      return new Response(
        JSON.stringify({ erro: "Nenhuma assinatura ativa encontrada para cancelar." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Cancela a assinatura recorrente no Mercado Pago
    const respostaMP = await fetch(
      `https://api.mercadopago.com/preapproval/${assinatura.mercadopago_preapproval_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      }
    )

    if (!respostaMP.ok) {
      const detalhes = await respostaMP.json()
      console.error("Erro ao cancelar no Mercado Pago:", detalhes)
      return new Response(
        JSON.stringify({ erro: "Não foi possível cancelar a assinatura no Mercado Pago.", detalhes }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Atualiza o estado no nosso banco (perfil + assinatura)
    const { error: erroRegistro } = await supabaseAdmin.rpc("registrar_cancelamento", {
      p_profile_id: profileId,
    })

    if (erroRegistro) {
      console.error("Erro ao registrar cancelamento:", erroRegistro)
    }

    return new Response(
      JSON.stringify({ sucesso: true, mensagem: "Assinatura cancelada com sucesso." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (erro) {
    console.error("Erro inesperado:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao processar o cancelamento." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
