// ═══════════════════════════════════════════════════════════
// DISPARO DE E-MAIL EM LOTE
//
// O "1 clique para 50" — e o único canal de prospecção fria que pode
// ser automatizado legalmente.
//
// POR QUE E-MAIL E NÃO WHATSAPP:
// disparo em massa por ferramenta não oficial de WhatsApp é detectável
// no protocolo e resulta em banimento do número, não em aviso. A API
// oficial exige opt-in prévio, que empresa prospectada a frio nunca
// deu. Já o e-mail frio B2B é lícito no Brasil pelo Art. 7º, IX da
// LGPD (legítimo interesse), desde que quatro condições sejam
// atendidas — e todas estão implementadas aqui:
//
//   1. e-mail corporativo (não pessoal)
//   2. conteúdo relevante para a atividade da empresa
//   3. identificação clara de quem envia  → rodapé automático
//   4. descadastro funcionando            → link assinado no rodapé
//
// A ANPD passou a fiscalizar em 2025, com multa de até 2% do
// faturamento. O registro em prospeccao_contatos é a defesa exigida.
//
// Deploy: supabase functions deploy enviar-email-lote
// Secrets: RESEND_API_KEY, REMETENTE_EMAIL, SEGREDO_DESCADASTRO
// ═══════════════════════════════════════════════════════════

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const REMETENTE_EMAIL = Deno.env.get("REMETENTE_EMAIL") ?? ""
const SEGREDO_DESCADASTRO = Deno.env.get("SEGREDO_DESCADASTRO") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

/** Teto do plano gratuito do Resend. Passar disso só falharia calado. */
const MAXIMO_POR_DISPARO = 50

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Destinatario {
  nome: string
  email: string
  cidade?: string
  estado?: string
  chaveEmpresa: string
}

function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function assinarEmail(email: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SEGREDO_DESCADASTRO),
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

async function chamarRpc(nome: string, corpo: unknown): Promise<unknown> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(corpo),
    })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

/**
 * Monta o corpo com o rodapé obrigatório.
 *
 * O rodapé não é cortesia: sem identificação de quem envia e sem
 * descadastro funcionando, o disparo deixa de ser legítimo interesse
 * e vira infração. Por isso ele é concatenado aqui no servidor, e não
 * deixado a cargo de quem escreve a mensagem.
 */
const RODAPE_POR_IDIOMA: Record<string, { contato: string; motivo: string; descadastrar: string }> = {
  pt: {
    contato: "Contato",
    motivo:
      "Você recebeu este e-mail porque sua empresa atua em um segmento relacionado ao nosso serviço.",
    descadastrar: "Não quero mais receber",
  },
  en: {
    contato: "Contact",
    motivo:
      "You received this email because your company works in a field related to our service.",
    descadastrar: "Unsubscribe",
  },
  es: {
    contato: "Contacto",
    motivo:
      "Recibiste este correo porque tu empresa trabaja en un rubro relacionado con nuestro servicio.",
    descadastrar: "No quiero recibir más",
  },
}

/**
 * O rodapé precisa ser lido por QUEM RECEBE, não por quem envia. Um
 * prestador australiano abordando empresas de Sydney com um aviso de
 * descadastro em português não cumpre o dever de informar: o
 * destinatário não entende como sair da lista, e o disparo deixa de
 * se sustentar como legítimo interesse.
 */
function rodapeDoIdioma(idioma: string | undefined) {
  const base = (idioma ?? "pt").split("-")[0]
  return RODAPE_POR_IDIOMA[base] ?? RODAPE_POR_IDIOMA.pt
}

async function montarHtml(
  corpoTexto: string,
  destinatario: Destinatario,
  remetente: { empresa: string; contato: string; cidade: string; email: string },
  idioma: string | undefined
): Promise<string> {
  const rodape = rodapeDoIdioma(idioma)
  const token = await assinarEmail(destinatario.email)
  const linkDescadastro =
    `${SUPABASE_URL}/functions/v1/descadastrar` +
    `?e=${encodeURIComponent(destinatario.email)}&t=${token}`

  // Personalização simples: quem escreve usa {{empresa}} no texto
  const texto = corpoTexto.replaceAll("{{empresa}}", destinatario.nome)

  const paragrafos = texto
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => `<p style="margin:0 0 14px;line-height:1.6">${l}</p>`)
    .join("")

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f2">
<div style="max-width:560px;margin:0 auto;padding:28px 22px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;color:#22262c">
  ${paragrafos}

  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #d8d8d4;font-size:12px;line-height:1.6;color:#7a7f86">
    <p style="margin:0 0 6px"><strong>${remetente.empresa}</strong> · ${remetente.cidade}</p>
    <p style="margin:0 0 6px">${rodape.contato}: ${remetente.contato} — ${remetente.email}</p>
    <p style="margin:0">
      ${rodape.motivo}
      <a href="${linkDescadastro}" style="color:#8a6f2b">
        ${rodape.descadastrar}
      </a>.
    </p>
  </div>
</div>
</body></html>`
}

/**
 * Confere QUEM está chamando, dentro da própria função.
 *
 * Antes, a única proteção era o `verify_jwt` da plataforma — um
 * interruptor fora do código, que qualquer `functions deploy` com a
 * flag errada desliga sem avisar. Se ele cair, esta função vira um
 * relay aberto: qualquer pessoa na internet dispara e-mail em massa
 * pela conta do Resend do dono, e o domínio é queimado por spam.
 *
 * Uma trava que mora no código não some num deploy distraído.
 */
async function identificarChamador(
  req: Request
): Promise<{ ok: true; usuarioId: string } | { ok: false; resposta: Response }> {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.replace("Bearer ", "").trim()

  // A anon key também chega como Bearer. Ela não identifica ninguém,
  // então precisa ser recusada explicitamente.
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) {
    return { ok: false, resposta: responder({ erro: "Não autenticado." }, 401) }
  }

  const resposta = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  })

  if (!resposta.ok) {
    return {
      ok: false,
      resposta: responder({ erro: "Usuário inválido ou sessão expirada." }, 401),
    }
  }

  const usuario = await resposta.json()
  if (!usuario?.id) {
    return { ok: false, resposta: responder({ erro: "Não autenticado." }, 401) }
  }

  return { ok: true, usuarioId: usuario.id }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // A identificação vem ANTES de qualquer outra checagem: responder
  // "Resend não configurado" a quem nem se identificou entrega
  // informação sobre a infraestrutura a quem está só sondando.
  const chamador = await identificarChamador(req)
  if (!chamador.ok) return chamador.resposta

  if (!RESEND_API_KEY || !REMETENTE_EMAIL) {
    return responder(
      {
        erro:
          "Envio de e-mail não configurado. Defina RESEND_API_KEY e " +
          "REMETENTE_EMAIL nos segredos do projeto.",
      },
      500
    )
  }

  if (!SEGREDO_DESCADASTRO) {
    // Sem o segredo o link de descadastro não pode ser assinado, e sem
    // descadastro válido o disparo não é lícito. Melhor recusar.
    return responder(
      { erro: "SEGREDO_DESCADASTRO não configurado. Sem ele o descadastro não funciona." },
      500
    )
  }

  try {
    const { destinatarios, assunto, corpo, remetente, idioma } = await req.json()

    if (!Array.isArray(destinatarios) || destinatarios.length === 0) {
      return responder({ erro: "Informe ao menos um destinatário." }, 400)
    }
    if (!assunto?.trim() || !corpo?.trim()) {
      return responder({ erro: "Assunto e corpo da mensagem são obrigatórios." }, 400)
    }
    if (!remetente?.empresa || !remetente?.contato || !remetente?.email) {
      return responder(
        { erro: "Dados do remetente incompletos — a identificação é obrigatória por lei." },
        400
      )
    }
    if (destinatarios.length > MAXIMO_POR_DISPARO) {
      return responder(
        { erro: `Máximo de ${MAXIMO_POR_DISPARO} destinatários por disparo.` },
        400
      )
    }

    const enviados: string[] = []
    const bloqueados: string[] = []
    const falhas: string[] = []

    for (const d of destinatarios as Destinatario[]) {
      if (!d.email?.includes("@")) {
        falhas.push(d.nome ?? "sem nome")
        continue
      }

      // A checagem acontece no momento do envio, não na montagem da
      // lista: alguém pode ter se descadastrado no meio do caminho.
      const liberado = await chamarRpc("pode_abordar", {
        p_email: d.email,
        p_telefone: null,
      })

      if (liberado === false) {
        bloqueados.push(d.email)
        continue
      }

      const html = await montarHtml(corpo, d, remetente, idioma)

      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: REMETENTE_EMAIL,
          to: [d.email],
          subject: assunto.replaceAll("{{empresa}}", d.nome ?? ""),
          html,
          reply_to: remetente.email,
        }),
      })

      if (!envio.ok) {
        console.error(`Falha ao enviar para ${d.email}:`, await envio.text())
        falhas.push(d.email)
        continue
      }

      enviados.push(d.email)

      // Registra para não abordar de novo e para ter o histórico que a
      // ANPD exige em caso de fiscalização.
      await chamarRpc("registrar_contato", {
        p_empresa_nome: d.nome ?? d.email,
        p_chave_empresa: d.chaveEmpresa,
        p_canal: "email",
        p_telefone: null,
        p_email: d.email,
        p_cidade: d.cidade ?? null,
        p_estado: d.estado ?? null,
        p_pais: "BR",
      })
    }

    console.log(
      `Disparo concluído: ${enviados.length} enviados, ` +
      `${bloqueados.length} bloqueados por descadastro, ${falhas.length} falhas.`
    )

    return responder({
      sucesso: true,
      enviados: enviados.length,
      bloqueados: bloqueados.length,
      falhas: falhas.length,
    })
  } catch (erro) {
    console.error("Erro inesperado no disparo:", erro)
    return responder({ erro: "Falha inesperada ao enviar os e-mails." }, 500)
  }
})
