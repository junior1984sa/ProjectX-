// ═══════════════════════════════════════════════════════════
// EDGE FUNCTION: buscar-empresas-osm
//
// Faz a ponte entre o navegador e as APIs do OpenStreetMap
// (Nominatim + Overpass). Isso existe porque a Overpass API
// bloqueia chamadas diretas do navegador por política de CORS —
// rodando no servidor (aqui), essa restrição não se aplica.
//
// Deploy: supabase functions deploy buscar-empresas-osm --no-verify-jwt
// (--no-verify-jwt porque tanto visitantes sem login quanto usuários
// logados precisam poder fazer a busca de demonstração/real)
// ═══════════════════════════════════════════════════════════

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
const OVERPASS_URL = "https://overpass-api.de/api/interpreter"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const HEADERS_OSM = {
  "Accept-Language": "pt-BR",
  "User-Agent": "ProspectX/1.0 (https://prospectx-oficial.vercel.app)",
}

function mapearSegmentoParaTagsOSM(segmento: string): string[] {
  const s = segmento.toLowerCase()

  const mapeamentos: Array<{ palavras: string[]; tags: string[] }> = [
    { palavras: ["marmoraria", "granito", "marmore"], tags: ["shop=doityourself", "craft=stonemason"] },
    { palavras: ["odontolog", "dentista"], tags: ["amenity=dentist"] },
    { palavras: ["restaurante", "comida"], tags: ["amenity=restaurant"] },
    { palavras: ["academia", "fitness", "ginastica"], tags: ["leisure=fitness_centre"] },
    { palavras: ["mecanic", "auto"], tags: ["shop=car_repair"] },
    { palavras: ["farmacia", "drogaria"], tags: ["amenity=pharmacy"] },
    { palavras: ["pet shop", "veterinari", "pet "], tags: ["shop=pet", "amenity=veterinary"] },
    { palavras: ["construtora", "construção", "engenharia"], tags: ["office=engineering", "craft=builder"] },
    { palavras: ["advocacia", "advogado", "jurídic"], tags: ["office=lawyer"] },
    { palavras: ["contabilidade", "contador", "contábil"], tags: ["office=accountant"] },
    { palavras: ["jateamento", "pintura industrial"], tags: ["craft=metal_construction", "craft=painter"] },
    { palavras: ["container", "locação", "aluguel de equip"], tags: ["shop=trade", "office=company"] },
    { palavras: ["caminhão", "betoneira", "transporte"], tags: ["shop=trade", "office=logistics"] },
    { palavras: ["hotel", "pousada"], tags: ["tourism=hotel"] },
  ]

  for (const m of mapeamentos) {
    if (m.palavras.some((p) => s.includes(p))) {
      return m.tags
    }
  }

  return ["office=company", "shop=yes", "craft=yes"]
}

/**
 * Países atendidos pela busca. `nome` entra na consulta ao Nominatim e
 * `iso2` restringe o resultado àquele país — sem a restrição, uma
 * cidade de nome comum ("Springfield", "Santiago") cai em qualquer
 * lugar do mundo.
 *
 * Esta tabela espelha PAISES_DISPONIVEIS em src/types/prestador.ts.
 * Edge Function não compartilha código com o frontend, por isso a
 * duplicação: ao incluir um país novo, atualize os dois lugares.
 */
const PAISES: Record<string, { nome: string; iso2: string }> = {
  BR: { nome: "Brasil", iso2: "br" },
  US: { nome: "United States", iso2: "us" },
  AU: { nome: "Australia", iso2: "au" },
  GB: { nome: "United Kingdom", iso2: "gb" },
  PT: { nome: "Portugal", iso2: "pt" },
}

async function geocodificarCidade(
  cidade: string,
  estado: string,
  pais: string
): Promise<{ lat: number; lng: number } | null> {
  const p = PAISES[pais] ?? PAISES.BR
  const query = estado
    ? `${cidade}, ${estado}, ${p.nome}`
    : `${cidade}, ${p.nome}`
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=${p.iso2}`

  const resposta = await fetch(url, { headers: HEADERS_OSM })
  if (!resposta.ok) return null

  const dados = await resposta.json()
  if (!dados || dados.length === 0) return null

  return { lat: parseFloat(dados[0].lat), lng: parseFloat(dados[0].lon) }
}

async function buscarEstabelecimentosOverpass(
  lat: number,
  lng: number,
  raioMetros: number,
  tagsOSM: string[]
): Promise<any[]> {
  const filtrosTag = tagsOSM
    .map((tag) => {
      const [chave, valor] = tag.split("=")
      return `node[${chave}=${valor}](around:${raioMetros},${lat},${lng});way[${chave}=${valor}](around:${raioMetros},${lat},${lng});`
    })
    .join("\n")

  const query = `
    [out:json][timeout:25];
    (
      ${filtrosTag}
    );
    out center 60;
  `

  const resposta = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...HEADERS_OSM },
  })

  if (!resposta.ok) {
    console.error("Overpass API respondeu com erro:", resposta.status)
    return []
  }

  const dados = await resposta.json()
  return dados.elements ?? []
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // `pais` é opcional e cai em BR quando ausente, para não quebrar
    // chamadas de versões anteriores do app que ainda não o enviam.
    const { cidade, estado, raioKm, segmento, pais } = await req.json()

    if (!cidade || !segmento) {
      return new Response(
        JSON.stringify({ erro: "Parâmetros 'cidade' e 'segmento' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const ponto = await geocodificarCidade(cidade, estado ?? "", pais ?? "BR")
    if (!ponto) {
      return new Response(
        JSON.stringify({ encontrado: false, motivo: "cidade_nao_localizada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const tagsOSM = mapearSegmentoParaTagsOSM(segmento)
    const raioMetros = (raioKm ?? 10) * 1000

    const elementos = await buscarEstabelecimentosOverpass(ponto.lat, ponto.lng, raioMetros, tagsOSM)

    return new Response(
      JSON.stringify({ encontrado: true, elementos, ponto }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (erro) {
    console.error("Erro inesperado na busca OSM:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao buscar empresas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
