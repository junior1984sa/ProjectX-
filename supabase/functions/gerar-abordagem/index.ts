// ═══════════════════════════════════════════════════════════
// GERAR ABORDAGEM — refina a primeira mensagem com IA
//
// A interface JÁ monta uma mensagem sozinha, por modelo de ramo, sem
// rede e sem custo. Esta função é a camada de cima: quando a chave da
// Anthropic existir, ela devolve uma versão mais natural.
//
// Por isso ela NUNCA responde com erro HTTP por indisponibilidade: o
// cliente trata qualquer resposta sem `mensagem` como "usa o modelo".
// Quem está no meio de uma fila de 40 empresas não quer descobrir que
// a IA caiu — quer a mensagem para continuar abordando.
//
// Deploy: supabase functions deploy gerar-abordagem
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ═══════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? ""
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

/**
 * Confere quem chama, dentro da função.
 *
 * Cada geração custa dinheiro na API da Anthropic. Sem esta trava,
 * qualquer pessoa na internet gastaria a conta do dono em um laço.
 * A checagem mora no código, e não no `verify_jwt` da plataforma,
 * porque aquele é um interruptor externo que um deploy com a flag
 * errada desliga em silêncio.
 */
async function exigirUsuario(req: Request): Promise<Response | null> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim()
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) {
    return responder({ erro: "nao_autenticado" }, 401)
  }

  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return responder({ erro: "sessao_invalida" }, 401)
  return null
}

const INSTRUCOES_POR_IDIOMA: Record<string, string> = {
  pt: "Escreva em português do Brasil.",
  en: "Write in English.",
  es: "Escribe en español.",
}

const DESCRICAO_TOM: Record<string, string> = {
  direto: "objetivo e sem rodeios, como quem respeita o tempo do outro",
  amigavel: "caloroso e conversacional, sem gírias nem informalidade excessiva",
  formal: "profissional e respeitoso, sem soar burocrático",
}

function montarPrompt(dados: {
  empresa: { nome: string; segmento: string | null; cidade: string }
  prestador: { nomeEmpresa: string; segmento: string; nomeContato: string; cidade: string }
  tom: string
  canal: string
  idioma: string
}): string {
  const base = (dados.idioma ?? "pt").split("-")[0]
  const limite =
    dados.canal === "email"
      ? "no máximo 3 parágrafos curtos"
      : "no máximo 4 linhas"

  return `Você escreve a PRIMEIRA mensagem de abordagem comercial fria de um prestador de serviço para uma empresa que pode contratá-lo.

QUEM ENVIA
Nome: ${dados.prestador.nomeContato}
Empresa: ${dados.prestador.nomeEmpresa}
Ramo: ${dados.prestador.segmento}
Cidade: ${dados.prestador.cidade}

QUEM RECEBE
Empresa: ${dados.empresa.nome}
${dados.empresa.segmento ? `Ramo: ${dados.empresa.segmento}` : "Ramo: não informado"}
Cidade: ${dados.empresa.cidade}

REGRAS
- ${INSTRUCOES_POR_IDIOMA[base] ?? INSTRUCOES_POR_IDIOMA.pt}
- Tom: ${DESCRICAO_TOM[dados.tom] ?? DESCRICAO_TOM.direto}
- Tamanho: ${limite}
- Diga claramente quem envia e o que a empresa dele faz
- Explique por que ESSA empresa foi procurada, usando a relação entre os dois ramos
- NÃO invente fatos sobre a empresa que recebe: nada de "vi seu site",
  "acompanho seu trabalho", "sei que vocês cresceram" ou números
- NÃO prometa resultado que não pode ser cumprido
- NÃO use "revolucionário", "inovador", "solução completa", "parceria estratégica"
- Termine com uma pergunta simples, de baixo compromisso, que convide à resposta
- Não inclua links nem assinatura: o sistema acrescenta depois

Responda SOMENTE com JSON válido, sem texto em volta:
{"assunto": "...", "mensagem": "..."}
O campo assunto só é usado em e-mail; preencha mesmo assim.`
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const naoAutorizado = await exigirUsuario(req)
  if (naoAutorizado) return naoAutorizado

  // Sem chave, o cliente cai no modelo local. Status 200 de propósito:
  // é ausência de recurso opcional, não falha da requisição.
  if (!ANTHROPIC_API_KEY) {
    return responder({ erro: "chave_nao_configurada" })
  }

  try {
    const dados = await req.json()
    if (!dados?.empresa?.nome || !dados?.prestador?.segmento) {
      return responder({ erro: "dados_incompletos" })
    }

    const resposta = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: montarPrompt(dados) }],
      }),
    })

    if (!resposta.ok) {
      console.error("Anthropic respondeu", resposta.status)
      return responder({ erro: "ia_indisponivel" })
    }

    const corpo = await resposta.json()
    const texto: string = corpo?.content?.[0]?.text ?? ""

    // O modelo às vezes embrulha o JSON em texto. Extrair com regex é
    // mais barato que reprocessar, e o fallback já existe do outro lado.
    const encontrado = texto.match(/\{[\s\S]*\}/)
    if (!encontrado) return responder({ erro: "resposta_ilegivel" })

    const json = JSON.parse(encontrado[0])
    if (!json?.mensagem) return responder({ erro: "resposta_ilegivel" })

    return responder({
      assunto: String(json.assunto ?? "").trim(),
      mensagem: String(json.mensagem).trim(),
    })
  } catch (erro) {
    console.error("Erro ao gerar abordagem:", erro)
    return responder({ erro: "erro_interno" })
  }
})
