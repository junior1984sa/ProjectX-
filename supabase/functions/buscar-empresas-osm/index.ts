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

function mapearSegmentoParaTagsOSM(segmento: string): string[] | null {
  // Acentos fora antes de comparar: quem digita "construcao" ou
  // "caminhao" — a maioria — nao casava com "construção"/"caminhão" e
  // caia no filtro generico, recebendo "qualquer empresa da regiao".
  const s = segmento
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  // As etiquetas do OSM são universais — craft=stonemason vale em
  // Curitiba e em Austin. O que faltava era reconhecer o TERMO em
  // outros idiomas: até aqui só português casava, então "stonemason"
  // ou "dental clinic" caíam no filtro genérico e devolviam sempre a
  // mesma lista de empresas quaisquer. Medido em Austin: "dental
  // clinic" retornava exatamente os mesmos 29 estabelecimentos que
  // "office" — o segmento era simplesmente ignorado fora do Brasil.
  const mapeamentos: Array<{ palavras: string[]; tags: string[] }> = [
    // ── Construcao e reforma ──
    // marmoraria NAO leva shop=doityourself: essa etiqueta significa
    // loja de material de construcao no OSM, e trazia Balaroti e Leroy
    // Merlin no lugar de marmorarias.
    { palavras: ["marmoraria", "marmorista", "granito", "marmore", "stonemason", "stone mason", "granite", "marble", "countertop", "marmoleria", "marmol"], tags: ["craft=stonemason"] },
    { palavras: ["material de construcao", "materiais de construcao", "ferragem", "hardware store", "building supply", "builders merchant", "ferreteria", "materiales de construccion"], tags: ["shop=doityourself", "shop=hardware", "shop=trade"] },
    { palavras: ["construtora", "construcao civil", "engenharia", "empreiteira", "construction", "builder", "contractor", "engineering", "constructora", "constructora civil", "ingenieria"], tags: ["office=engineering", "craft=builder", "office=architect"] },
    { palavras: ["marcenaria", "marceneiro", "movei", "carpenter", "carpentry", "joinery", "cabinet maker", "furniture", "carpinteria", "mueble"], tags: ["craft=carpenter", "shop=furniture"] },
    { palavras: ["serralheria", "serralheiro", "esquadria", "solda", "welding", "welder", "metalwork", "blacksmith", "herreria", "soldadura"], tags: ["craft=metal_construction", "craft=blacksmith"] },
    { palavras: ["vidracaria", "vidraceiro", "glazier", "glass", "vidrieria"], tags: ["craft=glaziery"] },
    { palavras: ["eletricista", "eletrica", "electrician", "electrical", "electricista"], tags: ["craft=electrician"] },
    { palavras: ["encanador", "hidraulica", "bombeiro hidraulico", "plumber", "plumbing", "plomero", "fontanero"], tags: ["craft=plumber"] },
    { palavras: ["telhado", "cobertura", "telhadista", "roofer", "roofing", "techador", "techos"], tags: ["craft=roofer"] },
    { palavras: ["gesso", "drywall", "gesseiro", "plasterer", "plastering", "yesero", "pladur"], tags: ["craft=plasterer"] },
    { palavras: ["piscina", "pool", "swimming pool", "alberca"], tags: ["shop=swimming_pool", "craft=pool_maintenance"] },

    // ── Servicos industriais (o nucleo do publico) ──
    { palavras: ["jateamento", "pintura industrial", "tratamento de superficie", "sandblasting", "abrasive blasting", "industrial painting", "surface treatment", "arenado", "chorreado", "pintura industrial"], tags: ["craft=painter", "craft=metal_construction"] },
    { palavras: ["caldeiraria", "usinagem", "metalurgica", "metalurgia", "boilermaking", "machining", "machine shop", "metallurgy", "calderería", "metalurgica"], tags: ["craft=metal_construction", "man_made=works"] },
    { palavras: ["industria", "fabrica", "industrial", "factory", "manufacturing", "plant", "fabrica", "industria"], tags: ["man_made=works", "office=company"] },
    { palavras: ["andaime", "isolamento termico", "refratario", "scaffolding", "scaffolder", "thermal insulation", "refractory", "andamio", "aislamiento"], tags: ["craft=scaffolder", "shop=trade"] },

    // ── Locacao e logistica ──
    { palavras: ["container", "locacao", "aluguel de equip", "betoneira", "guindaste", "equipment rental", "plant hire", "crane", "concrete mixer", "alquiler de equipos", "renta de equipo", "grua"], tags: ["shop=trade", "office=company"] },
    { palavras: ["caminhao", "transporte", "frete", "transportadora", "logistica", "trucking", "freight", "haulage", "logistics", "shipping", "transporte", "fletes", "logistica"], tags: ["office=logistics", "shop=trade"] },

    // ── Saude ──
    { palavras: ["odontolog", "dentista", "dental", "dentist", "orthodont"], tags: ["amenity=dentist"] },
    { palavras: ["clinica", "consultorio", "medic", "clinic", "medical", "doctor", "physician", "consultorio"], tags: ["amenity=clinic", "amenity=doctors"] },
    { palavras: ["hospital"], tags: ["amenity=hospital"] },
    { palavras: ["farmacia", "drogaria", "pharmacy", "drugstore", "chemist", "farmacia"], tags: ["amenity=pharmacy"] },
    { palavras: ["pet shop", "veterinari", "pet ", "veterinary", "vet clinic", "veterinaria"], tags: ["shop=pet", "amenity=veterinary"] },

    // ── Comercio e alimentacao ──
    { palavras: ["restaurante", "comida", "lanchonete", "restaurant", "diner", "cafe", "food", "comida", "restaurante"], tags: ["amenity=restaurant", "amenity=fast_food"] },
    { palavras: ["padaria", "confeitaria", "bakery", "pastry", "panaderia", "pasteleria"], tags: ["shop=bakery", "shop=confectionery"] },
    { palavras: ["mercado", "supermercado", "atacad", "supermarket", "grocery", "wholesale", "supermercado", "mayorista"], tags: ["shop=supermarket", "shop=wholesale"] },
    { palavras: ["hotel", "pousada", "motel", "guest house", "inn", "hosteria", "posada"], tags: ["tourism=hotel", "tourism=guest_house"] },

    // ── Servicos ──
    { palavras: ["academia", "fitness", "ginastica", "crossfit", "gym", "gimnasio"], tags: ["leisure=fitness_centre"] },
    { palavras: ["mecanic", "auto center", "funilaria", "oficina", "auto repair", "car repair", "mechanic", "body shop", "taller mecanico", "mecanico"], tags: ["shop=car_repair"] },
    { palavras: ["advocacia", "advogado", "juridic", "law firm", "lawyer", "attorney", "solicitor", "abogado", "juridico"], tags: ["office=lawyer"] },
    { palavras: ["contabilidade", "contador", "contabil", "accounting", "accountant", "bookkeeping", "contaduria", "contable"], tags: ["office=accountant"] },
    { palavras: ["imobiliaria", "corretor de imove", "real estate", "estate agent", "realtor", "inmobiliaria"], tags: ["office=estate_agent"] },
    { palavras: ["salao", "cabeleireiro", "barbearia", "estetica", "hair salon", "barber", "beauty salon", "peluqueria", "barberia"], tags: ["shop=hairdresser", "shop=beauty"] },
    { palavras: ["escola", "colegio", "curso", "school", "college", "academy", "escuela", "colegio"], tags: ["amenity=school", "amenity=college"] },
    { palavras: ["condominio", "administradora", "property management", "facility management", "administracion de propiedades"], tags: ["office=property_management"] },
  ]

  for (const m of mapeamentos) {
    if (m.palavras.some((p) => s.includes(p))) {
      return m.tags
    }
  }

  // Sem correspondencia conhecida: devolve null, e NAO uma lista
  // generica.
  //
  // Antes isto retornava ["office=company", "shop=yes", "craft=yes"]
  // com o comentario "melhor que nada". Nao era. O efeito medido:
  // "estaleiro naval", "manutencao industrial" e "arquitetura"
  // devolviam EXATAMENTE as mesmas 53 empresas em Curitiba — Agiplan,
  // Aldeia Coworking, Amway, um sindicato de professores. O segmento
  // era ignorado e o assinante recebia escritorios quaisquer com o
  // rotulo do que ele pediu.
  //
  // Isso e pior que resultado vazio por tres motivos: gasta credito,
  // destroi a confianca no primeiro uso, e faz a mensagem de abordagem
  // dizer "encontrei voces ao mapear o ramo de estaleiro naval" para
  // um coworking. Dado errado com cara de dado certo e o pior defeito
  // que um produto de dados pode ter.
  return null
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
// ═══ CACHE DE BUSCAS ═══
// O Nominatim e o Overpass são gratuitos, mas bloqueiam sob uso
// intenso — com vários assinantes buscando ao mesmo tempo, o bloqueio
// atinge todos de uma vez. O cache reduz drasticamente as chamadas.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const DIAS_VALIDADE_CACHE = 30

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
    // Cache fora do ar nunca pode derrubar a busca
    return null
  }
}

const PAISES: Record<string, { nome: string; iso2: string }> = {
  BR: { nome: "Brasil", iso2: "br" },
  US: { nome: "United States", iso2: "us" },
  AU: { nome: "Australia", iso2: "au" },
  NZ: { nome: "New Zealand", iso2: "nz" },
  GB: { nome: "United Kingdom", iso2: "gb" },
  PT: { nome: "Portugal", iso2: "pt" },
  CA: { nome: "Canada", iso2: "ca" },
  MX: { nome: "México", iso2: "mx" },
  PY: { nome: "Paraguay", iso2: "py" },
}

/**
 * Localiza o ponto central da busca.
 *
 * `bairro` é opcional e muda muito o resultado em cidade grande: o
 * centro de São Paulo fica a 40 km da Vila Olímpia, então buscar "São
 * Paulo" devolve empresas que ninguém vai visitar. Com o bairro, o
 * ponto cai onde o prestador realmente atende.
 */
async function geocodificarCidade(
  cidade: string,
  estado: string,
  pais: string,
  bairro?: string
): Promise<{ lat: number; lng: number } | null> {
  const p = PAISES[pais] ?? PAISES.BR
  const partes = [bairro, cidade, estado, p.nome].filter(Boolean)
  const query = partes.join(", ")
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=${p.iso2}`

  const resposta = await fetch(url, { headers: HEADERS_OSM })
  if (!resposta.ok) return null

  const dados = await resposta.json()
  if (!dados || dados.length === 0) return null

  return { lat: parseFloat(dados[0].lat), lng: parseFloat(dados[0].lon) }
}

async function consultarOverpass(
  lat: number,
  lng: number,
  raioMetros: number,
  tagsOSM: string[]
): Promise<{ elementos: any[]; excedeuTempo: boolean }> {
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
    // 429 = uso excessivo, 504 = a consulta demorou demais no servidor.
    // Os dois pedem raio menor, não desistência.
    const excedeuTempo = resposta.status === 504 || resposta.status === 429
    console.error(`Overpass respondeu ${resposta.status} (raio ${raioMetros}m)`)
    return { elementos: [], excedeuTempo }
  }

  const dados = await resposta.json()
  return { elementos: dados.elements ?? [], excedeuTempo: false }
}

/**
 * Busca com redução automática de raio.
 *
 * Em cidades densas (São Paulo, Miami, Toronto), um raio de 10km cobre
 * dezenas de milhares de estabelecimentos e a consulta estoura o limite
 * de 25 segundos do Overpass — devolvendo VAZIO. Para o cliente isso é
 * pior do que devolver pouco: ele busca na maior cidade do país e conclui
 * que a ferramenta não funciona.
 *
 * Quando isso acontece, tentar de novo com raio menor resolve, porque o
 * que sobra é justamente o que está mais perto — e mais perto é melhor
 * para quem vai visitar o cliente.
 */
async function buscarEstabelecimentosOverpass(
  lat: number,
  lng: number,
  raioMetros: number,
  tagsOSM: string[]
): Promise<{ elementos: any[]; raioUsado: number }> {
  const raios = [raioMetros, Math.round(raioMetros / 2), Math.round(raioMetros / 4)]

  for (const raio of raios) {
    if (raio < 500) break

    const { elementos, excedeuTempo } = await consultarOverpass(lat, lng, raio, tagsOSM)

    if (elementos.length > 0) {
      if (raio !== raioMetros) {
        console.log(`Raio reduzido de ${raioMetros}m para ${raio}m — região muito densa.`)
      }
      return { elementos, raioUsado: raio }
    }

    // Vazio sem estouro de tempo significa que realmente não há nada
    // ali; reduzir o raio só encontraria menos ainda.
    if (!excedeuTempo) break
  }

  return { elementos: [], raioUsado: raioMetros }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // `pais` é opcional e cai em BR quando ausente, para não quebrar
    // chamadas de versões anteriores do app que ainda não o enviam.
    const { cidade, estado, raioKm, segmento, pais, bairro } = await req.json()

    if (!cidade || !segmento) {
      return new Response(
        JSON.stringify({ erro: "Parâmetros 'cidade' e 'segmento' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const paisBusca = pais ?? "BR"
    // `bairro` entra na chave: buscar na Vila Olímpia e no Itaim são
    // buscas diferentes, e sem ele a segunda receberia o cache da
    // primeira.
    const chave = chaveDeCache([
      "osm",
      segmento,
      bairro ?? "",
      cidade,
      estado ?? "",
      raioKm ?? 10,
      paisBusca,
    ])

    const doCache = await chamarRpc("ler_cache_busca", { p_chave: chave })
    if (doCache) {
      console.log(`Cache aproveitado: ${chave}`)
      return new Response(JSON.stringify(doCache), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "hit" },
      })
    }

    const ponto = await geocodificarCidade(cidade, estado ?? "", paisBusca, bairro)
    if (!ponto) {
      // Cidade não localizada costuma ser erro de digitação, que a
      // pessoa repete. Guardar por pouco tempo evita martelar o
      // Nominatim com a mesma consulta inválida.
      const naoLocalizada = { encontrado: false, motivo: "cidade_nao_localizada" }
      await chamarRpc("gravar_cache_busca", {
        p_chave: chave,
        p_fonte: "openstreetmap",
        p_resposta: naoLocalizada,
        p_dias_validade: 1,
      })

      return new Response(JSON.stringify(naoLocalizada), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const tagsOSM = mapearSegmentoParaTagsOSM(segmento)

    // Segmento fora do mapeamento: avisa em vez de inventar. O app usa
    // `semCobertura` para explicar ao assinante e devolver o credito.
    if (!tagsOSM) {
      const semCobertura = {
        encontrado: false,
        semCobertura: true,
        segmento,
        elementos: [],
        ponto,
      }
      return new Response(JSON.stringify(semCobertura), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const raioMetros = (raioKm ?? 10) * 1000

    const { elementos, raioUsado } = await buscarEstabelecimentosOverpass(
      ponto.lat,
      ponto.lng,
      raioMetros,
      tagsOSM
    )

    // `raioUsado` sobe para o app avisar quando a área foi reduzida —
    // sem isso, o cliente acharia que a busca cobriu os 10km pedidos.
    const resultado = {
      encontrado: true,
      elementos,
      ponto,
      raioKmUsado: Math.round(raioUsado / 1000),
      raioReduzido: raioUsado !== raioMetros,
    }

    // Resultado vazio guarda por menos tempo: pode ter sido o Overpass
    // sobrecarregado no momento, e não ausência real de empresas.
    chamarRpc("gravar_cache_busca", {
      p_chave: chave,
      p_fonte: "openstreetmap",
      p_resposta: resultado,
      p_dias_validade: elementos.length > 0 ? DIAS_VALIDADE_CACHE : 1,
    })

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "miss" },
    })
  } catch (erro) {
    console.error("Erro inesperado na busca OSM:", erro)
    return new Response(
      JSON.stringify({ erro: "Erro interno ao buscar empresas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
