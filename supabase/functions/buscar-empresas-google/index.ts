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
  GB: { nome: "United Kingdom", iso2: "gb", idioma: "en-GB", regiao: "GB", preposicao: "in" },
  PT: { nome: "Portugal", iso2: "pt", idioma: "pt-PT", regiao: "PT", preposicao: "em" },
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
    const ponto = await geocodificarCidadeGratis(cidade, estado ?? "", paisBusca)
    const raioMetros = (raioKm ?? 10) * 1000

    const places = await buscarNoGooglePlaces(
      segmento,
      cidade,
      estado ?? "",
      ponto,
      raioMetros,
      quantidadeDesejada ?? 20,
      paisBusca
    )

    if (places.length === 0) {
      return new Response(
        JSON.stringify({ encontrado: false, motivo: "sem_resultados" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
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

    return new Response(
      JSON.stringify({ encontrado: true, empresas }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (erro) {
    console.error("Erro inesperado na busca Google Places:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao buscar empresas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
