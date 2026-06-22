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

async function geocodificarCidadeGratis(
  cidade: string,
  estado: string
): Promise<{ lat: number; lng: number } | null> {
  const query = estado ? `${cidade}, ${estado}, Brasil` : `${cidade}, Brasil`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`

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
  maxResultados: number
): Promise<PlaceResult[]> {
  const textQuery = estado
    ? `${segmento} em ${cidade}, ${estado}`
    : `${segmento} em ${cidade}`

  const corpo: Record<string, unknown> = {
    textQuery,
    languageCode: "pt-BR",
    regionCode: "BR",
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

    const { cidade, estado, raioKm, segmento, quantidadeDesejada } = await req.json()

    if (!cidade || !segmento) {
      return new Response(
        JSON.stringify({ erro: "Parâmetros 'cidade' e 'segmento' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const ponto = await geocodificarCidadeGratis(cidade, estado ?? "")
    const raioMetros = (raioKm ?? 10) * 1000

    const places = await buscarNoGooglePlaces(
      segmento,
      cidade,
      estado ?? "",
      ponto,
      raioMetros,
      quantidadeDesejada ?? 20
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
