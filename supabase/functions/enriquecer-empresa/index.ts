// ═══════════════════════════════════════════════════════════
// ENRIQUECER EMPRESA — descoberta de domínio e contato
//
// Esta função existe para resolver o gargalo medido do produto.
//
// A medição de 100 empresas britânicas mostrou onde o funil vaza: não
// é achar contato, é achar o SITE CERTO. A heurística de domínio
// "encontrava" 35 sites e só 9 eram da empresa — 26% de precisão. Com
// a trava de identidade a precisão subiu para 100%, mas a taxa de
// contato ficou em 10%, porque a maioria das empresas simplesmente
// não tem domínio adivinhável.
//
// A CADEIA QUE ESTA FUNÇÃO IMPLEMENTA
//
//   Companies House (grátis) → nome, endereço, segmento
//        ↓ PDL: nome da empresa → DOMÍNIO      ← mata o gargalo
//        ↓ Hunter: domínio → E-MAILS           ← mata o segundo
//
// Em vez de adivinhar o domínio e torcer, pergunta a quem sabe.
//
// POR QUE NO SERVIDOR, E NÃO NO PIPELINE LOCAL
//
// As chaves vivem nos secrets do Supabase, que não podem ser lidos de
// volta pela API — é assim de propósito. Rodar aqui é o único jeito de
// usá-las sem copiá-las para um arquivo local que pode acabar no
// repositório. E é onde elas precisam estar em produção de qualquer
// forma.
//
// ⚠️ ESTA FUNÇÃO GASTA DINHEIRO A CADA CHAMADA.
// Por isso ela verifica o chamador dentro do próprio código, e tem
// teto de empresas por requisição. Depender do `verify_jwt` seria
// depender de um interruptor externo que um deploy distraído desliga —
// foi assim que o disparo de e-mail virou relay aberto uma vez.
//
// Deploy: supabase functions deploy enriquecer-empresa
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

/**
 * As chaves são procuradas por vários nomes possíveis.
 *
 * Quem cadastrou o segredo no painel pode ter escrito de formas
 * diferentes, e uma função que só aceita um nome exato falha em
 * silêncio — parece "sem resultado" quando na verdade é "chave com
 * outro nome". Procurar por lista transforma um mistério em um fato.
 */
function primeiraChave(nomes: string[]): { nome: string; valor: string } | null {
  for (const nome of nomes) {
    const valor = Deno.env.get(nome)?.trim()
    if (valor) return { nome, valor }
  }
  return null
}

const HUNTER = primeiraChave([
  "HUNTER_API_KEY", "HUNTER_KEY", "HUNTERIO_API_KEY", "VITE_HUNTER_KEY",
  // Variantes com espaço e caixa mista, porque o painel aceita digitar
  // assim e o nome vira exatamente o que foi escrito.
  "hunter API Key", "Hunter API Key", "HUNTER API KEY", "hunter_api_key",
  // O dono cadastrou com "pai" no lugar de "api". O nome do segredo é
  // literal: se está escrito assim no painel, é assim que se lê.
  "hunter_pai_key", "HUNTER_PAI_KEY",
])
const PDL = primeiraChave([
  "PDL_API_KEY", "PEOPLEDATALABS_API_KEY", "PEOPLE_DATA_LABS_API_KEY",
  "PDL_KEY", "PDL_API",
  "PDL PAI key", "PDL API key", "PDL API Key", "pdl_api_key", "PDL PAI KEY",
])

/** Teto por requisição. Sem isto, um laço distraído vira fatura. */
const MAXIMO_POR_CHAMADA = 25

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

async function exigirUsuario(req: Request): Promise<boolean> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim()
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) return false

  // A chave de serviço vale como chamador. Não é afrouxamento: quem a
  // possui já tem acesso total ao banco, então aceitá-la aqui não
  // concede nada novo. É o caminho servidor-a-servidor que o pipeline
  // de ingestão vai usar, e o único jeito de rodar a medição sem
  // inventar um usuário de teste.
  if (SERVICE_ROLE_KEY && token === SERVICE_ROLE_KEY) return true
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    })
    if (!r.ok) return false
    const u = await r.json()
    return Boolean(u?.id)
  } catch {
    // Falha de rede recusa. Falhar aberto num endpoint pago
    // transformaria instabilidade em conta alta.
    return false
  }
}

interface Empresa {
  nome: string
  /** Número de registro no Companies House, quando houver. */
  numeroRegistro?: string
  cep?: string
  pais?: string
}

interface Enriquecida {
  nome: string
  numeroRegistro: string | null
  dominio: string | null
  /** De onde veio o domínio — procedência é obrigatória em cada campo. */
  fonteDominio: "pdl" | "nenhuma"
  confiancaDominio: number | null
  emails: { valor: string; tipo: string; confianca: number | null }[]
  fonteEmail: "hunter" | "nenhuma"
  telefone: string | null
  erro?: string
}

/**
 * PDL: nome da empresa → domínio.
 *
 * Este é o passo que substitui a adivinhação. O PDL devolve também um
 * grau de similaridade; abaixo de um limiar razoável preferimos não
 * ter domínio a ter o domínio de outra empresa — contato errado com
 * cara de certo é pior que contato ausente.
 */
async function dominioPeloPdl(
  empresa: Empresa,
): Promise<{ dominio: string | null; confianca: number | null; erro?: string }> {
  if (!PDL) return { dominio: null, confianca: null, erro: "pdl_sem_chave" }

  const params = new URLSearchParams({ name: empresa.nome })
  if (empresa.pais) params.set("country", empresa.pais.toLowerCase())
  if (empresa.cep) params.set("postal_code", empresa.cep)

  try {
    const r = await fetch(
      `https://api.peopledatalabs.com/v5/company/enrich?${params}`,
      { headers: { "X-Api-Key": PDL.valor } },
    )

    // 404 é resposta legítima: o PDL não conhece essa empresa. Não é
    // erro, é ausência — e precisa aparecer como tal na medição.
    if (r.status === 404) return { dominio: null, confianca: null }
    if (!r.ok) return { dominio: null, confianca: null, erro: `pdl_http_${r.status}` }

    const d = await r.json()
    const dominio = typeof d?.website === "string" ? d.website.toLowerCase() : null
    const confianca = typeof d?.likelihood === "number" ? d.likelihood : null

    // O PDL usa `likelihood` de 1 a 10. Abaixo de 6 a chance de ser
    // outra empresa com nome parecido é alta demais para um produto
    // cujo pilar é contato confiável.
    if (confianca !== null && confianca < 6) {
      return { dominio: null, confianca, erro: "pdl_confianca_baixa" }
    }

    return { dominio, confianca }
  } catch (e) {
    return { dominio: null, confianca: null, erro: `pdl_falha: ${e}` }
  }
}

/**
 * Hunter: domínio → e-mails.
 *
 * Pede só endereço genérico. A decisão de não perseguir e-mail nominal
 * é técnica antes de jurídica: na medição anterior, e-mail com nome de
 * pessoa apareceu 1 vez em 9 sites corretos. Não está publicado. E
 * carrega o UK GDPR inteiro junto.
 */
async function emailsPeloHunter(
  dominio: string,
): Promise<{ emails: Enriquecida["emails"]; erro?: string }> {
  if (!HUNTER) return { emails: [], erro: "hunter_sem_chave" }

  const limpo = dominio.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
  const params = new URLSearchParams({
    domain: limpo,
    api_key: HUNTER.valor,
    type: "generic",
    limit: "5",
  })

  try {
    const r = await fetch(`https://api.hunter.io/v2/domain-search?${params}`)
    if (!r.ok) return { emails: [], erro: `hunter_http_${r.status}` }

    const d = await r.json()
    const lista = Array.isArray(d?.data?.emails) ? d.data.emails : []

    return {
      emails: lista.map((e: Record<string, unknown>) => ({
        valor: String(e.value ?? ""),
        tipo: String(e.type ?? "desconhecido"),
        confianca: typeof e.confidence === "number" ? e.confidence : null,
      })).filter((e: { valor: string }) => e.valor.includes("@")),
    }
  } catch (e) {
    return { emails: [], erro: `hunter_falha: ${e}` }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (!(await exigirUsuario(req))) {
    return responder({ erro: "Não autenticado." }, 401)
  }

  let corpo: { empresas?: Empresa[]; diagnostico?: boolean }
  try {
    corpo = await req.json()
  } catch {
    corpo = {}
  }

  // Modo diagnóstico: responde QUAIS chaves existem, nunca os valores.
  // Serve para descobrir com que nome o segredo foi cadastrado sem
  // precisar expor nada.
  if (corpo.diagnostico) {
    // Lista os NOMES das variáveis presentes, nunca os valores. Sem
    // isto, descobrir com que nome o segredo foi cadastrado vira
    // adivinhação — e adivinhar nome de variável é o tipo de coisa que
    // consome uma tarde e termina em "ah, era com espaço".
    //
    // Filtra o que é da plataforma (SUPABASE_*, PATH, DENO_*) para a
    // resposta caber e não virar ruído.
    let nomesPresentes: string[] = []
    try {
      nomesPresentes = Object.keys(Deno.env.toObject())
        .filter((n) => !/^(SUPABASE_|DENO_|PATH$|HOME$|PWD$|LANG$|TERM$|HOSTNAME$)/i.test(n))
        .sort()
    } catch {
      nomesPresentes = []
    }

    return responder({
      hunter: HUNTER ? { configurada: true, nomeDaVariavel: HUNTER.nome } : { configurada: false },
      pdl: PDL ? { configurada: true, nomeDaVariavel: PDL.nome } : { configurada: false },
      // Só nomes. Nenhum valor é lido nem devolvido em nenhum caminho.
      variaveisDisponiveis: nomesPresentes,
      maximoPorChamada: MAXIMO_POR_CHAMADA,
    })
  }

  const empresas = Array.isArray(corpo.empresas) ? corpo.empresas : []
  if (empresas.length === 0) {
    return responder({ erro: "Informe ao menos uma empresa." }, 400)
  }
  if (empresas.length > MAXIMO_POR_CHAMADA) {
    return responder(
      { erro: `Máximo de ${MAXIMO_POR_CHAMADA} empresas por chamada.` },
      400,
    )
  }

  const resultados: Enriquecida[] = []

  for (const empresa of empresas) {
    if (!empresa?.nome?.trim()) continue

    const { dominio, confianca, erro: erroPdl } = await dominioPeloPdl(empresa)

    let emails: Enriquecida["emails"] = []
    let erroHunter: string | undefined
    if (dominio) {
      const r = await emailsPeloHunter(dominio)
      emails = r.emails
      erroHunter = r.erro
    }

    resultados.push({
      nome: empresa.nome,
      numeroRegistro: empresa.numeroRegistro ?? null,
      dominio,
      fonteDominio: dominio ? "pdl" : "nenhuma",
      confiancaDominio: confianca,
      emails,
      fonteEmail: emails.length > 0 ? "hunter" : "nenhuma",
      telefone: null,
      erro: erroPdl ?? erroHunter,
    })
  }

  const comDominio = resultados.filter((r) => r.dominio).length
  const comEmail = resultados.filter((r) => r.emails.length > 0).length

  return responder({
    resultados,
    resumo: {
      total: resultados.length,
      comDominio,
      comEmail,
      taxaDominio: resultados.length ? comDominio / resultados.length : 0,
      taxaEmail: resultados.length ? comEmail / resultados.length : 0,
    },
  })
})
