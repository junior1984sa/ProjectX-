// ═══════════════════════════════════════════════════════════
// BUSCA DE EMPRESAS REAIS — OpenStreetMap (Nominatim + Overpass)
//
// Substitui o gerador de dados fictícios por dados reais e gratuitos:
// 1. Nominatim: converte "cidade, estado" em coordenadas (geocodificação)
// 2. Overpass: busca estabelecimentos reais próximos àquele ponto
//
// Limitação conhecida: a cobertura de telefone/e-mail no OpenStreetMap
// depende de quem cadastrou aquele estabelecimento no mapa colaborativo.
// Em muitas cidades brasileiras, isso é mais escasso que no Google Places.
// Por isso, um score menor para empresas sem contato cadastrado é
// esperado e reflete a realidade dos dados, não um bug.
// ═══════════════════════════════════════════════════════════

import type { Empresa, ParametrosBusca } from "@/types/empresa"
import { gerarId } from "@/lib/utils"

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
const OVERPASS_URL = "https://overpass-api.de/api/interpreter"

const HEADERS_OSM = {
  "Accept-Language": "pt-BR",
}

/**
 * Mapeia segmentos em português para tags do OpenStreetMap (shop=*, amenity=*, office=*).
 * O OSM usa um vocabulário próprio de categorias; aproximamos pelo texto digitado.
 */
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
 * Converte "cidade, estado" em coordenadas usando Nominatim (geocodificação gratuita).
 */
async function geocodificarCidade(
  cidade: string,
  estado: string
): Promise<{ lat: number; lng: number } | null> {
  const query = estado ? `${cidade}, ${estado}, Brasil` : `${cidade}, Brasil`
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`

  try {
    const resposta = await fetch(url, { headers: HEADERS_OSM })
    if (!resposta.ok) return null

    const dados = await resposta.json()
    if (!dados || dados.length === 0) return null

    return {
      lat: parseFloat(dados[0].lat),
      lng: parseFloat(dados[0].lon),
    }
  } catch (erro) {
    console.error("Erro ao geocodificar cidade:", erro)
    return null
  }
}

/**
 * Busca estabelecimentos reais próximos a um ponto usando Overpass API.
 */
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

  try {
    const resposta = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })

    if (!resposta.ok) {
      console.error("Overpass API respondeu com erro:", resposta.status)
      return []
    }

    const dados = await resposta.json()
    return dados.elements ?? []
  } catch (erro) {
    console.error("Erro ao buscar estabelecimentos no Overpass:", erro)
    return []
  }
}

/**
 * Calcula o score de uma empresa com base nos dados reais disponíveis.
 */
function calcularScoreReal(tags: Record<string, string>): number {
  let score = 0
  if (tags.phone || tags["contact:phone"]) score += 1
  if (tags.email || tags["contact:email"]) score += 1
  if (tags.website || tags["contact:website"]) score += 1
  if (tags["contact:facebook"] || tags["contact:instagram"]) score += 0.5
  return Math.min(5, Math.round(score * 10) / 10)
}

/**
 * Converte um elemento do Overpass em uma Empresa do nosso formato interno.
 */
function converterParaEmpresa(
  elemento: any,
  segmento: string,
  cidade: string,
  estado: string
): Empresa | null {
  const tags = elemento.tags ?? {}
  const nome = tags.name
  if (!nome) return null

  const lat = elemento.lat ?? elemento.center?.lat
  const lng = elemento.lon ?? elemento.center?.lon
  if (!lat || !lng) return null

  const telefone = tags.phone ?? tags["contact:phone"] ?? null
  const email = tags.email ?? tags["contact:email"] ?? null
  const website = tags.website ?? tags["contact:website"] ?? null
  const instagram = tags["contact:instagram"] ?? null
  const facebook = tags["contact:facebook"] ?? null

  const bairro = tags["addr:suburb"] ?? tags["addr:neighbourhood"] ?? cidade
  const rua = tags["addr:street"] ?? ""
  const numero = tags["addr:housenumber"] ?? ""
  const endereco = rua ? `${rua}${numero ? ", " + numero : ""}` : "Endereço não informado"

  return {
    id: gerarId(),
    nome,
    segmento,
    endereco,
    bairro,
    cidade,
    estado,
    cep: tags["addr:postcode"] ?? "",
    telefone,
    email,
    website,
    instagram,
    facebook,
    avaliacaoGoogle: null,
    totalAvaliacoes: 0,
    score: calcularScoreReal(tags),
    latitude: lat,
    longitude: lng,
    favorita: false,
    criadaEm: new Date(),
  }
}

/**
 * Busca empresas reais via OpenStreetMap. Retorna null se a geocodificação
 * falhar ou se nenhum estabelecimento for encontrado — nesse caso, quem
 * chamou esta função deve decidir se cai no gerador de dados de exemplo.
 */
export async function buscarEmpresasReais(
  params: ParametrosBusca
): Promise<Empresa[] | null> {
  const ponto = await geocodificarCidade(params.cidade, params.estado)
  if (!ponto) {
    console.warn(`Não foi possível localizar "${params.cidade}" no mapa.`)
    return null
  }

  const tagsOSM = mapearSegmentoParaTagsOSM(params.segmento)
  const raioMetros = params.raioKm * 1000

  const elementosBrutos = await buscarEstabelecimentosOverpass(
    ponto.lat,
    ponto.lng,
    raioMetros,
    tagsOSM
  )

  const empresas = elementosBrutos
    .map((el) => converterParaEmpresa(el, params.segmento, params.cidade, params.estado))
    .filter((e): e is Empresa => e !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, params.quantidadeDesejada)

  return empresas.length > 0 ? empresas : null
}
