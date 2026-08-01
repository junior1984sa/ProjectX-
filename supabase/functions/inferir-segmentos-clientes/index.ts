// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: inferir-segmentos-clientes
//
// Fallback por IA para quando o segmento digitado pelo prestador não
// está na tabela fixa de ~100 mapeamentos (src/types/prestador.ts).
// Usa a API da Anthropic para inferir, em qualquer idioma e para
// qualquer ramo do mundo, quais segmentos costumam CONTRATAR aquele
// tipo de serviço — sem depender de manutenção manual da tabela.
//
// Deploy: supabase functions deploy inferir-segmentos-clientes --no-verify-jwt
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
// ═══════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? ""
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
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
