// ═══════════════════════════════════════════════════════════
// DESCADASTRO (opt-out)
//
// Atende o link "não quero mais receber" do rodapé dos e-mails.
// Precisa ser PÚBLICA e funcionar em UM clique, sem login e sem
// formulário: exigir cadastro para sair de uma lista que a pessoa
// nunca pediu para entrar é justamente o que a LGPD proíbe.
//
// COMO O LINK É SEGURO SEM BANCO DE DADOS:
// o endereço vai assinado com HMAC. Sem a assinatura correta, ninguém
// consegue descadastrar o e-mail de terceiros nem varrer a base
// tentando endereços aleatórios.
//
// O descadastro é GLOBAL: vale para todos os assinantes do ProspectX,
// não só para quem enviou aquele e-mail. Um opt-out por assinante
// deixaria a mesma empresa exposta a 100 abordagens diferentes.
//
// Deploy: supabase functions deploy descadastrar --no-verify-jwt
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const SEGREDO_LINK = Deno.env.get("SEGREDO_DESCADASTRO") ?? ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/** Assinatura do endereço, para o link não poder ser forjado */
async function assinar(email: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SEGREDO_LINK),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    chave,
    new TextEncoder().encode(email.toLowerCase().trim())
  )
  return Array.from(new Uint8Array(assinatura))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32)
}

function pagina(titulo: string, mensagem: string, sucesso: boolean): Response {
  const cor = sucesso ? "#3a6460" : "#9c4128"
  const html = `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
         background: #f3f3f0; color: #22262c; margin: 0;
         display: flex; align-items: center; justify-content: center;
         min-height: 100vh; padding: 1.5rem; }
  .cartao { background: #fff; border: 1px solid #d3d4d0; border-radius: 8px;
            padding: 2.5rem 2rem; max-width: 26rem; text-align: center; }
  h1 { font-size: 1.15rem; margin: 0 0 .75rem; color: ${cor}; }
  p { font-size: .95rem; line-height: 1.6; color: #5a6068; margin: 0; }
</style>
</head><body>
  <div class="cartao"><h1>${titulo}</h1><p>${mensagem}</p></div>
</body></html>`

  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (!SEGREDO_LINK) {
    console.error("SEGREDO_DESCADASTRO não configurado — links não podem ser validados.")
    return pagina(
      "Não foi possível processar",
      "Houve um problema técnico. Responda ao e-mail pedindo a remoção e faremos manualmente.",
      false
    )
  }

  try {
    const url = new URL(req.url)
    const email = url.searchParams.get("e") ?? ""
    const token = url.searchParams.get("t") ?? ""

    if (!email || !token) {
      return pagina("Link inválido", "O endereço de descadastro está incompleto.", false)
    }

    const esperado = await assinar(email)
    if (token !== esperado) {
      // Assinatura errada quase sempre é link truncado pelo cliente de
      // e-mail, não ataque — por isso a mensagem orienta em vez de acusar.
      return pagina(
        "Link inválido ou expirado",
        "Não conseguimos validar este link. Responda ao e-mail pedindo a remoção e faremos manualmente.",
        false
      )
    }

    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/prospeccao_optout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        motivo: "clicou no link de descadastro",
        origem: "link_descadastro",
      }),
    })

    // 409 significa que já estava descadastrado — para a pessoa, é sucesso
    if (!resposta.ok && resposta.status !== 409) {
      console.error("Falha ao gravar descadastro:", await resposta.text())
      return pagina(
        "Não foi possível processar",
        "Houve um problema técnico. Responda ao e-mail pedindo a remoção e faremos manualmente.",
        false
      )
    }

    console.log(`Descadastro registrado: ${email}`)

    return pagina(
      "Pronto, você foi removido",
      "Este endereço não receberá mais mensagens de nenhuma empresa que use o ProspectX. Desculpe pelo incômodo.",
      true
    )
  } catch (erro) {
    console.error("Erro inesperado no descadastro:", erro)
    return pagina(
      "Não foi possível processar",
      "Houve um problema técnico. Responda ao e-mail pedindo a remoção e faremos manualmente.",
      false
    )
  }
})
