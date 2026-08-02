// ═══════════════════════════════════════════════════════════
// PUBLICAR NO INSTAGRAM
//
// Publica uma imagem no feed da conta configurada. Pensado para o dono
// do negócio disparar de onde quiser (um comando, um botão no painel,
// uma rotina agendada) sem abrir o aplicativo do Instagram.
//
// COMO A API DA META FUNCIONA (dois passos, não um):
//   1. cria um "contêiner" de mídia apontando para a URL da imagem
//   2. publica esse contêiner
// Entre os dois, a Meta baixa e processa a imagem. Se publicar antes
// de o contêiner ficar pronto, a chamada falha — por isso existe a
// espera com verificação de status aqui embaixo.
//
// EXIGÊNCIAS DA META (não dá para contornar):
//   • conta Instagram PROFISSIONAL do tipo Business (Creator não publica)
//   • vinculada a uma Página do Facebook
//   • imagem em JPEG, acessível por URL pública (não é upload)
//   • máximo de 25 publicações por API a cada 24 horas
//
// SEGREDOS NECESSÁRIOS (defina no painel do Supabase, nunca no código):
//   IG_USER_ID       id numérico da conta Instagram Business
//   IG_ACCESS_TOKEN  token de acesso de longa duração
//
// O token de longa duração expira a cada 60 dias. A função avisa no
// log quando a resposta da Meta indicar token inválido, para você
// renovar antes de descobrir por um post que não saiu.
// ═══════════════════════════════════════════════════════════

const IG_USER_ID = Deno.env.get("IG_USER_ID") ?? ""
const IG_ACCESS_TOKEN = Deno.env.get("IG_ACCESS_TOKEN") ?? ""
const VERSAO_API = "v21.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RespostaMeta {
  id?: string
  status_code?: string
  status?: string
  error?: { message?: string; code?: number; error_subcode?: number }
}

function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

/** Espera o contêiner ficar pronto antes de publicar */
async function aguardarContainerPronto(
  containerId: string,
  tentativas = 10
): Promise<{ pronto: boolean; motivo?: string }> {
  for (let i = 0; i < tentativas; i++) {
    const url =
      `https://graph.facebook.com/${VERSAO_API}/${containerId}` +
      `?fields=status_code,status&access_token=${IG_ACCESS_TOKEN}`

    const resposta = await fetch(url)
    const dados: RespostaMeta = await resposta.json()

    // FINISHED = pronto para publicar. ERROR = a Meta rejeitou a imagem
    // (formato, proporção ou tamanho fora do aceito).
    if (dados.status_code === "FINISHED") return { pronto: true }
    if (dados.status_code === "ERROR") {
      return { pronto: false, motivo: dados.status ?? "A Meta rejeitou a imagem." }
    }

    // IN_PROGRESS: espera crescente, começando curta para o caso comum
    await new Promise((r) => setTimeout(r, 1500 + i * 500))
  }

  return { pronto: false, motivo: "O contêiner não ficou pronto a tempo." }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    return responder(
      {
        erro:
          "Credenciais do Instagram ausentes. Defina IG_USER_ID e IG_ACCESS_TOKEN " +
          "nos segredos do projeto no painel do Supabase.",
      },
      500
    )
  }

  try {
    const { imagemUrl, legenda } = await req.json()

    if (!imagemUrl) {
      return responder({ erro: "Informe 'imagemUrl' — a imagem precisa estar numa URL pública." }, 400)
    }

    // ═══ Passo 1: criar o contêiner ═══
    const criacao = await fetch(
      `https://graph.facebook.com/${VERSAO_API}/${IG_USER_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imagemUrl,
          caption: legenda ?? "",
          access_token: IG_ACCESS_TOKEN,
        }),
      }
    )

    const container: RespostaMeta = await criacao.json()

    if (!criacao.ok || !container.id) {
      const msg = container.error?.message ?? "Erro ao criar o contêiner de mídia."

      // 190 = token inválido ou expirado. Vale destacar no log porque é
      // o erro mais comum depois de 60 dias e o mais fácil de resolver.
      if (container.error?.code === 190) {
        console.error("TOKEN DO INSTAGRAM EXPIRADO OU INVÁLIDO — renove IG_ACCESS_TOKEN.")
        return responder(
          { erro: "O token do Instagram expirou. Gere um novo token de longa duração e atualize o segredo IG_ACCESS_TOKEN." },
          401
        )
      }

      console.error("Erro ao criar contêiner:", msg)
      return responder({ erro: msg }, 400)
    }

    // ═══ Passo 2: esperar o processamento ═══
    const status = await aguardarContainerPronto(container.id)
    if (!status.pronto) {
      return responder(
        {
          erro:
            `${status.motivo} Confira se a imagem é JPEG, está numa URL pública ` +
            `e tem proporção entre 4:5 e 1.91:1.`,
        },
        400
      )
    }

    // ═══ Passo 3: publicar ═══
    const publicacao = await fetch(
      `https://graph.facebook.com/${VERSAO_API}/${IG_USER_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: IG_ACCESS_TOKEN,
        }),
      }
    )

    const publicado: RespostaMeta = await publicacao.json()

    if (!publicacao.ok || !publicado.id) {
      const msg = publicado.error?.message ?? "Erro ao publicar."
      console.error("Erro ao publicar:", msg)
      return responder({ erro: msg }, 400)
    }

    console.log(`Publicado no Instagram: ${publicado.id}`)

    return responder({
      sucesso: true,
      postId: publicado.id,
      link: `https://www.instagram.com/p/${publicado.id}`,
    })
  } catch (erro) {
    console.error("Falha inesperada ao publicar:", erro)
    return responder({ erro: "Falha inesperada ao publicar no Instagram." }, 500)
  }
})
