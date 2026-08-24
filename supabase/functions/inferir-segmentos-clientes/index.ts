// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: inferir-segmentos-clientes
//
// Fallback por IA para quando o segmento digitado pelo prestador não
// está na tabela fixa de ~100 mapeamentos (src/types/prestador.ts).
// Usa a API da Anthropic para inferir, em qualquer idioma e para
// qualquer ramo do mundo, quais segmentos costumam CONTRATAR aquele
// tipo de serviço — sem depender de manutenção manual da tabela.
//
// ⚠️ NÃO PUBLICADA, E NÃO USADA HOJE
//
// `obterSegmentosClientesComFallback`, a única função que chamaria
// esta rota, não é referenciada em lugar nenhum do produto. A busca
// usa apenas a tabela fixa, que hoje cobre 531 termos em três
// idiomas. Enquanto isso for verdade, publicar esta função só
// adicionaria superfície de ataque sem entregar nada.
//
// ⚠️ NUNCA PUBLIQUE COM --no-verify-jwt
//
// A instrução original dizia exatamente isso, e estava errada. Esta
// função GASTA DINHEIRO a cada chamada: cada requisição vira uma
// chamada paga à API da Anthropic. Sem verificação de quem chama,
// qualquer pessoa na internet esvazia o saldo do dono num laço de
// poucas linhas.
//
// Foi assim que a função de disparo de e-mail virou um relay aberto
// uma vez. A trava agora mora no código, e não numa bandeira de
// linha de comando que um deploy distraído desliga.
//
// Deploy correto:
//   supabase functions deploy inferir-segmentos-clientes
// Secret:
//   supabase secrets set ANTHROPIC_API_KEY=...
//
// E quem chamar precisa mandar o token da sessão no Authorization —
// `src/types/prestador.ts` hoje não manda, então isso também precisa
// ser ajustado antes de a rota entrar em uso.
// ═══════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? ""
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/**
 * Confere quem está chamando, dentro da própria função.
 *
 * Endpoint que gasta dinheiro exige chamador identificado. Depender
 * do `verify_jwt` da plataforma não basta: é um interruptor fora do
 * código, e um deploy com a bandeira errada o desliga sem avisar.
 */
async function exigirUsuarioAutenticado(req: Request): Promise<boolean> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim()

  // A anon key também chega como Bearer e não identifica ninguém.
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) return false

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    })
    if (!r.ok) return false
    const usuario = await r.json()
    return Boolean(usuario?.id)
  } catch {
    // Falha de rede na verificação recusa o pedido. Falhar aberto num
    // endpoint pago transformaria uma instabilidade em conta alta.
    return false
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (!(await exigirUsuarioAutenticado(req))) {
    return new Response(
      JSON.stringify({ erro: "Não autenticado.", segmentos: [] }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ segmentos: [], motivo: "chave_nao_configurada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { segmento } = await req.json()

    if (!segmento || typeof segmento !== "string") {
      return new Response(
        JSON.stringify({ erro: "Parâmetro 'segmento' é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const prompt = `Um prestador de serviço atua no ramo: "${segmento}".

Liste de 3 a 5 tipos de empresas ou setores que TIPICAMENTE CONTRATAM esse serviço (ou seja, são clientes potenciais dele, não concorrentes do mesmo ramo).

Responda APENAS com um array JSON de strings curtas, em português do Brasil, sem nenhum texto antes ou depois. Exemplo de formato: ["Construtora", "Indústria metalúrgica", "Hospital"]`

    const respostaIA = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!respostaIA.ok) {
      const detalhes = await respostaIA.text()
      console.error("Erro na API da Anthropic:", respostaIA.status, detalhes)
      return new Response(
        JSON.stringify({ segmentos: [], motivo: "erro_api_ia" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const dadosIA = await respostaIA.json()
    const textoResposta: string = dadosIA.content?.[0]?.text ?? "[]"

    const match = textoResposta.match(/\[[\s\S]*\]/)
    let segmentos: string[] = []

    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed)) {
          segmentos = parsed.filter((s: unknown) => typeof s === "string").slice(0, 5)
        }
      } catch (erroParse) {
        console.error("Erro ao parsear resposta da IA:", erroParse, textoResposta)
      }
    }

    return new Response(
      JSON.stringify({ segmentos }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (erro) {
    console.error("Erro inesperado ao inferir segmentos-clientes:", erro)
    return new Response(
      JSON.stringify({ segmentos: [], motivo: "erro_interno" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
