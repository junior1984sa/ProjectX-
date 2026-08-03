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
  // Acentos fora antes de comparar: quem digita "construcao" ou
  // "caminhao" — a maioria — nao casava com "construção"/"caminhão" e
  // caia no filtro generico, recebendo "qualquer empresa da regiao".
  const s = segmento
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  const mapeamentos: Array<{ palavras: string[]; tags: string[] }> = [
    // ── Construcao e reforma ──
    // marmoraria NAO leva shop=doityourself: essa etiqueta significa
    // loja de material de construcao no OSM, e trazia Balaroti e Leroy
    // Merlin no lugar de marmorarias.
    { palavras: ["marmoraria", "marmorista", "granito", "marmore"], tags: ["craft=stonemason"] },
    { palavras: ["material de construcao", "materiais de construcao", "ferragem"], tags: ["shop=doityourself", "shop=hardware", "shop=trade"] },
    { palavras: ["construtora", "construcao civil", "engenharia", "empreiteira"], tags: ["office=engineering", "craft=builder", "office=architect"] },
    { palavras: ["marcenaria", "marceneiro", "movei"], tags: ["craft=carpenter", "shop=furniture"] },
    { palavras: ["serralheria", "serralheiro", "esquadria", "solda"], tags: ["craft=metal_construction", "craft=blacksmith"] },
    { palavras: ["vidracaria", "vidraceiro"], tags: ["craft=glaziery"] },
    { palavras: ["eletricista", "eletrica"], tags: ["craft=electrician"] },
    { palavras: ["encanador", "hidraulica", "bombeiro hidraulico"], tags: ["craft=plumber"] },
    { palavras: ["telhado", "cobertura", "telhadista"], tags: ["craft=roofer"] },
    { palavras: ["gesso", "drywall", "gesseiro"], tags: ["craft=plasterer"] },
    { palavras: ["piscina"], tags: ["shop=swimming_pool", "craft=pool_maintenance"] },

    // ── Servicos industriais (o nucleo do publico) ──
    { palavras: ["jateamento", "pintura industrial", "tratamento de superficie"], tags: ["craft=painter", "craft=metal_construction"] },
    { palavras: ["caldeiraria", "usinagem", "metalurgica", "metalurgia"], tags: ["craft=metal_construction", "man_made=works"] },
    { palavras: ["industria", "fabrica", "industrial"], tags: ["man_made=works", "office=company"] },
    { palavras: ["andaime", "isolamento termico", "refratario"], tags: ["craft=scaffolder", "shop=trade"] },

    // ── Locacao e logistica ──
    { palavras: ["container", "locacao", "aluguel de equip", "betoneira", "guindaste"], tags: ["shop=trade", "office=company"] },
    { palavras: ["caminhao", "transporte", "frete", "transportadora", "logistica"], tags: ["office=logistics", "shop=trade"] },

    // ── Saude ──
    { palavras: ["odontolog", "dentista"], tags: ["amenity=dentist"] },
    { palavras: ["clinica", "consultorio", "medic"], tags: ["amenity=clinic", "amenity=doctors"] },
    { palavras: ["hospital"], tags: ["amenity=hospital"] },
    { palavras: ["farmacia", "drogaria"], tags: ["amenity=pharmacy"] },
    { palavras: ["pet shop", "veterinari", "pet "], tags: ["shop=pet", "amenity=veterinary"] },

    // ── Comercio e alimentacao ──
    { palavras: ["restaurante", "comida", "lanchonete"], tags: ["amenity=restaurant", "amenity=fast_food"] },
    { palavras: ["padaria", "confeitaria"], tags: ["shop=bakery", "shop=confectionery"] },
    { palavras: ["mercado", "supermercado", "atacad"], tags: ["shop=supermarket", "shop=wholesale"] },
    { palavras: ["hotel", "pousada", "motel"], tags: ["tourism=hotel", "tourism=guest_house"] },

    // ── Servicos ──
    { palavras: ["academia", "fitness", "ginastica", "crossfit"], tags: ["leisure=fitness_centre"] },
    { palavras: ["mecanic", "auto center", "funilaria", "oficina"], tags: ["shop=car_repair"] },
    { palavras: ["advocacia", "advogado", "juridic"], tags: ["office=lawyer"] },
    { palavras: ["contabilidade", "contador", "contabil"], tags: ["office=accountant"] },
    { palavras: ["imobiliaria", "corretor de imove"], tags: ["office=estate_agent"] },
    { palavras: ["salao", "cabeleireiro", "barbearia", "estetica"], tags: ["shop=hairdresser", "shop=beauty"] },
    { palavras: ["escola", "colegio", "curso"], tags: ["amenity=school", "amenity=college"] },
    { palavras: ["condominio", "administradora"], tags: ["office=property_management"] },
  ]

  for (const m of mapeamentos) {
    if (m.palavras.some((p) => s.includes(p))) {
      return m.tags
    }
  }

  // Sem correspondencia: devolve empresas em geral na regiao. E menos
  // preciso, mas melhor que nada — e a busca do Google, quando houver
  // chave, cobre justamente esses casos com precisao de categoria.
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
  NZ: { nome: "New Zealand", iso2: "nz" },
  GB: { nome: "United Kingdom", iso2: "gb" },
  PT: { nome: "Portugal", iso2: "pt" },
  MX: { nome: "México", iso2: "mx" },
  PY: { nome: "Paraguay", iso2: "py" },
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
