// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: buscar-empresas-google
//
// Busca empresas reais usando o Google Places API — Text Search (New).
// Tem precisão de categoria muito superior ao OpenStreetMap, porque
// aceita busca livre por texto (ex: "jateamento abrasivo em Florianópolis")
// em vez de depender de tags fixas cadastradas manualmente.
//
// A chave da API (GOOGLE_PLACES_API_KEY) fica só aqui no servidor,
// nunca no frontend — mesmo sendo uma chave restrita por API, é
// boa prática não expor chaves de billing no navegador.
//
// Deploy: supabase functions deploy buscar-empresas-google --no-verify-jwt
// Secret: supabase secrets set GOOGLE_PLACES_API_KEY=sua-chave-aqui
// ═══════════════════════════════════════════════════════════

const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") ?? ""
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

// ═══ CACHE DE BUSCAS ═══
// A mesma pergunta feita duas vezes não pode custar duas chamadas de
// API. O ganho é coletivo: a busca de um assinante serve todos os
// outros até expirar — e num produto onde gente da mesma região
// procura os mesmos segmentos, isso se repete muito.
//
// Fica no SERVIDOR de propósito. No navegador, cada cliente teria o
// próprio cache e a economia seria quase nenhuma.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const DIAS_VALIDADE_CACHE = 30

/** Chave normalizada: mesma pergunta escrita de formas diferentes vira a mesma chave */
function chaveDeCache(partes: (string | number)[]): string {
  return partes
    .map((p) =>
      String(p)
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "-")
    )
    .join("__")
}

async function chamarRpc(nome: string, corpo: unknown): Promise<unknown> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null

  try {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(corpo),
    })
    if (!resposta.ok) return null
    return await resposta.json()
  } catch {
    // Cache indisponível nunca pode derrubar a busca: se falhar, o
    // fluxo segue chamando a API normalmente.
    return null
  }
}

async function lerCache(chave: string): Promise<unknown | null> {
  return await chamarRpc("ler_cache_busca", { p_chave: chave })
}

async function gravarCache(chave: string, resposta: unknown): Promise<void> {
  await chamarRpc("gravar_cache_busca", {
    p_chave: chave,
    p_fonte: "google",
    p_resposta: resposta,
    p_dias_validade: DIAS_VALIDADE_CACHE,
  })
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
].join(",")

interface PlaceResult {
  displayName?: { text?: string }
  formattedAddress?: string
  addressComponents?: Array<{ longText?: string; types?: string[] }>
  location?: { latitude?: number; longitude?: number }
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  businessStatus?: string
}

/**
 * Países atendidos pela busca.
 *   nome/iso2      → geocodificação no Nominatim
 *   idioma/regiao  → em que língua e mercado o Google Places responde
 *   preposicao     → monta "jateamento EM Joinville" / "sandblasting IN Miami"
 *
 * Espelha PAISES_DISPONIVEIS em src/types/prestador.ts. Edge Function
 * não compartilha código com o frontend, daí a duplicação: ao incluir
 * um país novo, atualize os dois lugares.
 */
const PAISES: Record<
  string,
  { nome: string; iso2: string; idioma: string; regiao: string; preposicao: string }
> = {
  BR: { nome: "Brasil", iso2: "br", idioma: "pt-BR", regiao: "BR", preposicao: "em" },
  US: { nome: "United States", iso2: "us", idioma: "en-US", regiao: "US", preposicao: "in" },
  AU: { nome: "Australia", iso2: "au", idioma: "en-AU", regiao: "AU", preposicao: "in" },
  NZ: { nome: "New Zealand", iso2: "nz", idioma: "en-NZ", regiao: "NZ", preposicao: "in" },
  GB: { nome: "United Kingdom", iso2: "gb", idioma: "en-GB", regiao: "GB", preposicao: "in" },
  PT: { nome: "Portugal", iso2: "pt", idioma: "pt-PT", regiao: "PT", preposicao: "em" },
  // Espanhol usa "en" como preposição de lugar: "marmolería EN Guadalajara"
  CA: { nome: "Canada", iso2: "ca", idioma: "en-CA", regiao: "CA", preposicao: "in" },
  MX: { nome: "México", iso2: "mx", idioma: "es-MX", regiao: "MX", preposicao: "en" },
  PY: { nome: "Paraguay", iso2: "py", idioma: "es-PY", regiao: "PY", preposicao: "en" },
}

async function geocodificarCidadeGratis(
  cidade: string,
  estado: string,
  pais: string
): Promise<{ lat: number; lng: number } | null> {
  const p = PAISES[pais] ?? PAISES.BR
  const query = estado
    ? `${cidade}, ${estado}, ${p.nome}`
    : `${cidade}, ${p.nome}`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=${p.iso2}`

  try {
    const resposta = await fetch(url, {
      headers: { "User-Agent": "ProspectX/1.0 (https://prospectx-oficial.vercel.app)" },
    })
    if (!resposta.ok) return null

    const dados = await resposta.json()
    if (!dados || dados.length === 0) return null

    return { lat: parseFloat(dados[0].lat), lng: parseFloat(dados[0].lon) }
  } catch {
    return null
  }
}

async function buscarNoGooglePlaces(
  segmento: string,
  cidade: string,
  estado: string,
  ponto: { lat: number; lng: number } | null,
  raioMetros: number,
  maxResultados: number,
  pais: string
): Promise<PlaceResult[]> {
  const p = PAISES[pais] ?? PAISES.BR

  const textQuery = estado
    ? `${segmento} ${p.preposicao} ${cidade}, ${estado}`
    : `${segmento} ${p.preposicao} ${cidade}`

  const corpo: Record<string, unknown> = {
    textQuery,
    languageCode: p.idioma,
    regionCode: p.regiao,
    maxResultCount: Math.min(20, maxResultados),
  }

  if (ponto) {
    corpo.locationBias = {
      circle: {
        center: { latitude: ponto.lat, longitude: ponto.lng },
        radius: Math.min(raioMetros, 50000),
      },
    }
  }

  const resposta = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(corpo),
  })

  if (!resposta.ok) {
    const detalhes = await resposta.text()
    console.error("Google Places API respondeu com erro:", resposta.status, detalhes)
    return []
  }

  const dados = await resposta.json()
  return dados.places ?? []
}

function extrairBairro(componentes: PlaceResult["addressComponents"]): string {
  if (!componentes) return ""
  const bairro = componentes.find(
    (c) => c.types?.includes("sublocality") || c.types?.includes("neighborhood")
  )
  return bairro?.longText ?? ""
}

function calcularScore(place: PlaceResult): number {
  let score = 0
  if (place.nationalPhoneNumber || place.internationalPhoneNumber) score += 1
  if (place.websiteUri) score += 1
  if (place.rating) {
    if (place.rating >= 4.5) score += 1
    else if (place.rating >= 4.0) score += 0.5
  }
  return Math.min(5, Math.round(score * 10) / 10)
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({ encontrado: false, motivo: "chave_nao_configurada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // `pais` é opcional e cai em BR quando ausente, para não quebrar
    // chamadas de versões anteriores do app que ainda não o enviam.
    const { cidade, estado, raioKm, segmento, quantidadeDesejada, pais } =
      await req.json()

    if (!cidade || !segmento) {
      return new Response(
        JSON.stringify({ erro: "Parâmetros 'cidade' e 'segmento' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const paisBusca = pais ?? "BR"
    const quantidade = quantidadeDesejada ?? 20

    // A chave inclui tudo que muda o resultado. Faltando qualquer um
    // desses, duas buscas diferentes colidiriam e a segunda receberia
    // a resposta errada.
    const chave = chaveDeCache([
      "google",
      segmento,
      cidade,
      estado ?? "",
      raioKm ?? 10,
      quantidade,
      paisBusca,
    ])

    const doCache = await lerCache(chave)
    if (doCache) {
      console.log(`Cache aproveitado: ${chave}`)
      return new Response(JSON.stringify(doCache), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Ajuda a diagnosticar sem precisar abrir os logs
          "X-Cache": "hit",
        },
      })
    }

    const ponto = await geocodificarCidadeGratis(cidade, estado ?? "", paisBusca)
    const raioMetros = (raioKm ?? 10) * 1000

    const places = await buscarNoGooglePlaces(
      segmento,
      cidade,
      estado ?? "",
      ponto,
      raioMetros,
      quantidade,
      paisBusca
    )

    if (places.length === 0) {
      // Busca vazia também vai para o cache, com validade menor: sem
      // isso, um segmento sem resultados custaria uma chamada de API a
      // cada tentativa, que é justamente o caso mais desperdiçado.
      const vazio = { encontrado: false, motivo: "sem_resultados" }
      await chamarRpc("gravar_cache_busca", {
        p_chave: chave,
        p_fonte: "google",
        p_resposta: vazio,
        p_dias_validade: 7,
      })

      return new Response(JSON.stringify(vazio), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const empresas = places.map((place) => ({
      nome: place.displayName?.text ?? "Empresa sem nome",
      endereco: place.formattedAddress ?? "",
      bairro: extrairBairro(place.addressComponents) || cidade,
      telefone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      avaliacaoGoogle: place.rating ?? null,
      totalAvaliacoes: place.userRatingCount ?? 0,
      latitude: place.location?.latitude ?? null,
      longitude: place.location?.longitude ?? null,
      score: calcularScore(place),
    }))

    const resultado = { encontrado: true, empresas }

    // Grava sem esperar: a resposta do cliente não deve ficar mais
    // lenta por causa da escrita no cache.
    gravarCache(chave, resultado)

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "miss" },
    })
  } catch (erro) {
    console.error("Erro inesperado na busca Google Places:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao buscar empresas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
