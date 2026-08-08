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
// DOIS CAMINHOS POSSÍVEIS, e a escolha muda o endereço da API:
//
//   Instagram Login (padrão aqui, mais simples)
//     host graph.instagram.com · NÃO exige Página do Facebook
//     permissões: instagram_business_basic, instagram_business_content_publish
//
//   Facebook Login (clássico)
//     host graph.facebook.com · EXIGE Página do Facebook vinculada
//     permissões: instagram_basic, instagram_content_publish,
//                 pages_read_engagement
//
// O padrão é o primeiro, que dispensa criar e manter uma Página só
// para satisfazer a API. Para usar o clássico, defina o segredo
// IG_API_HOST como graph.facebook.com.
//
// EXIGÊNCIAS COMUNS AOS DOIS (não dá para contornar):
//   • conta Instagram PROFISSIONAL
//   • imagem em JPEG, acessível por URL pública (não é upload)
//   • máximo de 25 publicações por API a cada 24 horas
//
// SEGREDOS NECESSÁRIOS (defina no painel do Supabase, nunca no código):
//   IG_USER_ID       id numérico da conta Instagram
//   IG_ACCESS_TOKEN  token de acesso de longa duração
//   IG_API_HOST      opcional — só se usar o caminho clássico
//
// O token de longa duração expira a cada 60 dias. A função avisa no
// log quando a resposta da Meta indicar token inválido, para você
// renovar antes de descobrir por um post que não saiu.
// ═══════════════════════════════════════════════════════════

const IG_USER_ID = Deno.env.get("IG_USER_ID") ?? ""
const IG_ACCESS_TOKEN = Deno.env.get("IG_ACCESS_TOKEN") ?? ""
const IG_API_HOST = Deno.env.get("IG_API_HOST") ?? "graph.instagram.com"
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
      `https://${IG_API_HOST}/${VERSAO_API}/${containerId}` +
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

/**
 * Confere quem chama, dentro da função.
 *
 * Publicar no Instagram é uma ação pública e irreversível feita em nome
 * da marca. Depender só do `verify_jwt` da plataforma — um interruptor
 * fora do código, que um deploy com a flag errada desliga em silêncio —
 * deixaria qualquer pessoa postar no perfil oficial assim que as
 * credenciais do Instagram forem configuradas.
 */
async function exigirUsuarioAutenticado(req: Request): Promise<Response | null> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim()

  // A anon key é pública e chega no mesmo formato: não identifica ninguém.
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) {
    return responder({ erro: "Não autenticado." }, 401)
  }

  const resposta = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!resposta.ok) {
    return responder({ erro: "Usuário inválido ou sessão expirada." }, 401)
  }

  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const naoAutorizado = await exigirUsuarioAutenticado(req)
  if (naoAutorizado) return naoAutorizado

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
      `https://${IG_API_HOST}/${VERSAO_API}/${IG_USER_ID}/media`,
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
      `https://${IG_API_HOST}/${VERSAO_API}/${IG_USER_ID}/media_publish`,
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
