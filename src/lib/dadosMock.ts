import type { Empresa, ParametrosBusca } from "@/types/empresa"
import { gerarId, esperar } from "@/lib/utils"

// ═══ BANCO DE DADOS DE BAIRROS POR CIDADE ═══

const BAIRROS_POR_CIDADE: Record<string, string[]> = {
  // São Paulo - SP
  "são paulo": [
    "Vila Mariana", "Itaquera", "Mooca", "Tatuapé", "Santana",
    "Lapa", "Santo André", "Ipiranga", "Penha", "Jardins",
    "Pinheiros", "Vila Olimpia", "Bela Vista", "Liberdade", "Consolação"
  ],
  "sp": [
    "Vila Mariana", "Itaquera", "Mooca", "Tatuapé", "Santana",
    "Lapa", "Ipiranga", "Penha", "Jardins", "Pinheiros"
  ],

  // Rio de Janeiro - RJ
  "rio de janeiro": [
    "Barra da Tijuca", "Copacabana", "Ipanema", "Botafogo", "Centro",
    "Madureira", "Tijuca", "Méier", "Jacarepaguá", "Campo Grande",
    "Santa Cruz", "Penha", "Ilha do Governador", "Bangu", "Realengo"
  ],
  "rj": [
    "Barra da Tijuca", "Copacabana", "Botafogo", "Centro", "Tijuca",
    "Méier", "Jacarepaguá", "Campo Grande", "Penha", "Bangu"
  ],

  // Florianópolis - SC
  "florianópolis": [
    "Centro", "Trindade", "Estreito", "Capoeiras", "Campinas",
    "Kobrasol", "Coqueiros", "Balneário", "Biguaçu", "São José",
    "Ingleses", "Canasvieiras", "Jurerê", "Lagoa da Conceição", "Ribeirão da Ilha"
  ],
  "florianopolis": [
    "Centro", "Trindade", "Estreito", "Capoeiras", "Campinas",
    "Kobrasol", "Coqueiros", "Biguaçu", "São José", "Ingleses"
  ],

  // Curitiba - PR
  "curitiba": [
    "Batel", "Centro", "Água Verde", "Cristo Rei", "Portão",
    "Rebouças", "Cajuru", "Bacacheri", "Hauer", "Pinheirinho",
    "Boa Vista", "Santa Felicidade", "Xaxim", "Sítio Cercado", "Alto Boqueirão"
  ],

  // Belo Horizonte - MG
  "belo horizonte": [
    "Savassi", "Centro", "Lourdes", "Funcionários", "Buritis",
    "Gutierrez", "Pampulha", "Contagem", "Betim", "Nova Lima",
    "Barreiro", "Venda Nova", "Nordeste", "Sagrada Família", "Santa Efigênia"
  ],

  // Porto Alegre - RS
  "porto alegre": [
    "Moinhos de Vento", "Bom Fim", "Cidade Baixa", "Centro", "Menino Deus",
    "Petrópolis", "Auxiliadora", "Passo d'Areia", "Cavalhada", "Glória",
    "Sarandi", "Rubem Berta", "Lomba do Pinheiro", "Belém Novo", "Restinga"
  ],

  // Salvador - BA
  "salvador": [
    "Itaigara", "Pituba", "Caminho das Árvores", "Barra", "Ondina",
    "Rio Vermelho", "Brotas", "Liberdade", "Periperi", "Cajazeiras",
    "Calçada", "Comércio", "Pelourinho", "Nazaré", "São Caetano"
  ],

  // Fortaleza - CE
  "fortaleza": [
    "Meireles", "Aldeota", "Fátima", "Dionísio Torres", "Centro",
    "Messejana", "Mondubim", "Barra do Ceará", "Parangaba", "Maraponga",
    "Conjunto Ceará", "Siqueira", "Canindezinho", "Jangurussu", "Itaperi"
  ],

  // Manaus - AM
  "manaus": [
    "Centro", "Adrianópolis", "Chapada", "Aleixo", "Parque 10",
    "Flores", "Cidade Nova", "Jorge Teixeira", "Colônia Antônio Aleixo", "Tarumã",
    "São Jorge", "Lírio do Vale", "Compensa", "Monte das Oliveiras", "Novo Israel"
  ],

  // Recife - PE
  "recife": [
    "Boa Viagem", "Recife Antigo", "Santo Antônio", "Graças", "Aflitos",
    "Torre", "Imbiribeira", "Pina", "Afogados", "Mustardinha",
    "Várzea", "Madalena", "Encruzilhada", "Tamarineira", "Casa Forte"
  ],

  // Default (cidade genérica)
  "default": [
    "Centro", "Jardim América", "Vila Nova", "Bairro Industrial", "São João",
    "Santa Luzia", "Boa Vista", "Parque das Flores", "Residencial Sul", "Alto da Boa Vista"
  ]
}

// ═══ BANCO DE NOMES POR SEGMENTO ═══

const NOMES_POR_SEGMENTO: Record<string, string[]> = {
  marmoraria: [
    "Mármores", "Granitos", "Pedras Naturais", "Mármores e Granitos",
    "Pedras", "Rochas", "Lapidação", "Marmoritex", "Granitex", "Pedreira"
  ],
  clínica_odontológica: [
    "Clínica Odontológica", "OdontoCenter", "Smile", "DentaVida", "Odonto",
    "Sorriso", "DentoClin", "OdontoPrime", "Belo Sorriso", "OdontoCare"
  ],
  restaurante: [
    "Restaurante", "Churrascaria", "Sabor", "Grill", "Bistrô",
    "Casa", "Cantina", "Refeitório", "Gastronomia", "Mesa"
  ],
  academia: [
    "Academia", "Fitness", "Gym", "FitCenter", "SportLife",
    "Body", "CrossFit", "Studio", "Training", "Power"
  ],
  advocacia: [
    "Advocacia", "Advogados", "Assessoria Jurídica", "Escritório de Advocacia",
    "Consultoria Jurídica", "Jurídico", "Law", "Direito", "Assessoria", "Gestão Jurídica"
  ],
  contabilidade: [
    "Contabilidade", "Contábil", "Assessoria Contábil", "Escritório Contábil",
    "Gestão Financeira", "Tributos", "Fiscal", "Balanço", "Consultoria Contábil", "Auditoria"
  ],
  mecânica: [
    "Mecânica", "Auto Center", "Auto Peças", "Oficina", "Borracharia",
    "Auto Elétrica", "Alinhamento", "Suspensão", "Freios", "Motor"
  ],
  farmácia: [
    "Farmácia", "Drogaria", "Farma", "Medicamentos", "Saúde",
    "FarmaCenter", "Drogão", "PharmaPlus", "Medicinal", "Vida"
  ],
  pet: [
    "Pet Shop", "Veterinária", "Pet Center", "Bichos", "Animal",
    "PetVida", "Clínica Veterinária", "Pet Care", "Animais", "Zoo"
  ],
  construção: [
    "Construtora", "Engenharia", "Obras", "Construção", "Reforma",
    "Edificações", "Alvenaria", "Projetos", "Build", "Habitação"
  ],
  construtora: [
    "Construtora", "Engenharia", "Incorporadora", "Edificações", "Obras",
    "Empreendimentos", "Construções", "Build", "Realizações", "Habitação"
  ],
  arquitetura: [
    "Arquitetura", "Design de Interiores", "Studio", "Projetos", "Ateliê",
    "Espaço", "Ambientes", "Arq.", "Decor", "Living"
  ],
  marcenaria: [
    "Marcenaria", "Móveis Planejados", "Madeiras", "Marcenaria Fina", "Ambientes",
    "Móveis", "Decor Madeira", "Carpintaria", "Marcenaria Premium", "Design em Madeira"
  ],
  "indústria metalúrgica": [
    "Metalúrgica", "Indústria Metal", "Aços", "Metais", "Fundição",
    "Metalúrgica Industrial", "Estruturas Metálicas", "Aço e Cia", "Metalmecânica", "Industrial Metal"
  ],
  petroquímica: [
    "Petroquímica", "Química Industrial", "Refinaria", "Processamento", "Indústria Química",
    "Petróleo e Gás", "Química", "Insumos Industriais", "Petroquímica do Brasil", "Derivados"
  ],
  "estaleiro naval": [
    "Estaleiro", "Naval", "Construção Naval", "Indústria Naval", "Navios e Cia",
    "Estaleiro Naval", "Embarcações", "Naval Service", "Marítima Industrial", "Docas"
  ],
  mineração: [
    "Mineração", "Mineradora", "Mining", "Extração Mineral", "Recursos Minerais",
    "Mineração do Brasil", "Pedreira Industrial", "Britagem", "Minérios", "Mineral"
  ],
  default: [
    "Empresa", "Serviços", "Soluções", "Center", "Plus",
    "Pro", "Master", "Express", "Total", "Prime"
  ]
}

const SUFIXOS_EMPRESA = [
  "Ltda", "ME", "S/A", "EIRELI", "SS", "EPP", ""
]

// ═══ SUFIXOS LOCAIS PARA NOMES REALISTAS ═══

function getSufixoLocal(bairro: string): string {
  const partes = bairro.split(" ")
  return partes[partes.length - 1]
}

function getNomesSegmento(segmento: string): string[] {
  const segLower = segmento.toLowerCase()
  for (const [chave, nomes] of Object.entries(NOMES_POR_SEGMENTO)) {
    if (segLower.includes(chave.replace("_", " ")) || segLower.includes(chave)) {
      return nomes
    }
  }
  return NOMES_POR_SEGMENTO.default
}

function getBairros(cidade: string): string[] {
  const cidadeLower = cidade.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
  
  for (const [chave, bairros] of Object.entries(BAIRROS_POR_CIDADE)) {
    const chaveLower = chave.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (cidadeLower.includes(chaveLower) || chaveLower.includes(cidadeLower)) {
      return bairros
    }
  }
  return BAIRROS_POR_CIDADE.default
}

// ═══ GERADORES DE DADOS ALEATÓRIOS ═══

function gerarTelefone(): string {
  const ddds = ["11", "12", "13", "21", "22", "31", "41", "47", "48", "51", "61", "71", "81", "85", "92"]
  const ddd = ddds[Math.floor(Math.random() * ddds.length)]
  const prefixo = Math.random() > 0.5 ? "9" : "8"
  const numero = Math.floor(Math.random() * 10000000).toString().padStart(7, "0")
  return `(${ddd}) ${prefixo}${numero.slice(0, 4)}-${numero.slice(4)}`
}

function gerarEmail(nome: string, dominio?: string): string {
  const nomeSlug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20)
  
  const dominios = [
    "gmail.com", "hotmail.com", "outlook.com",
    `${nomeSlug}.com.br`, `${nomeSlug}.com`,
    "yahoo.com.br", "uol.com.br"
  ]
  
  const dom = dominio || dominios[Math.floor(Math.random() * dominios.length)]
  const prefixos = ["contato", "comercial", "vendas", "atendimento", "info", "administrativo"]
  const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)]
  
  return `${prefixo}@${dom}`
}

function gerarWebsite(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20)
  return `www.${slug}.com.br`
}

function gerarInstagram(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
    .slice(0, 20)
  return `@${slug}`
}

function gerarAvaliacao(): number | null {
  if (Math.random() < 0.15) return null // 15% sem avaliação
  const avaliacoes = [3.5, 3.8, 4.0, 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]
  return avaliacoes[Math.floor(Math.random() * avaliacoes.length)]
}

function gerarTotalAvaliacoes(): number {
  const bases = [12, 23, 45, 67, 89, 134, 201, 312, 456, 678, 890]
  return bases[Math.floor(Math.random() * bases.length)] + Math.floor(Math.random() * 50)
}

/**
 * Calcula o score com base nos dados da empresa
 */
function calcularScore(empresa: Partial<Empresa>): number {
  let score = 0

  if (empresa.telefone) score += 1
  if (empresa.email) score += 1
  if (empresa.website) score += 1
  if (empresa.instagram || empresa.facebook) score += 0.5

  if (empresa.avaliacaoGoogle) {
    if (empresa.avaliacaoGoogle >= 4.5) score += 1
    else if (empresa.avaliacaoGoogle >= 4.0) score += 0.5
  }

  return Math.min(5, Math.round(score * 10) / 10)
}

/**
 * Gera coordenadas aleatórias próximas ao centro da cidade
 */
function gerarCoordenadas(
  cidade: string,
  raioKm: number
): { lat: number; lng: number } {
  const CENTROS: Record<string, { lat: number; lng: number }> = {
    "são paulo": { lat: -23.5505, lng: -46.6333 },
    "sp": { lat: -23.5505, lng: -46.6333 },
    "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
    "rj": { lat: -22.9068, lng: -43.1729 },
    "florianópolis": { lat: -27.5954, lng: -48.5480 },
    "florianopolis": { lat: -27.5954, lng: -48.5480 },
    "curitiba": { lat: -25.4290, lng: -49.2671 },
    "belo horizonte": { lat: -19.9167, lng: -43.9345 },
    "porto alegre": { lat: -30.0277, lng: -51.2287 },
    "salvador": { lat: -12.9714, lng: -38.5014 },
    "fortaleza": { lat: -3.7319, lng: -38.5267 },
    "manaus": { lat: -3.1190, lng: -60.0217 },
    "recife": { lat: -8.0522, lng: -34.9286 },
  }

  const cidadeLower = cidade.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

  let centro = { lat: -15.7801, lng: -47.9292 } // Brasília como fallback
  for (const [chave, coords] of Object.entries(CENTROS)) {
    if (cidadeLower.includes(chave.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
      centro = coords
      break
    }
  }

  // Dispersão proporcional ao raio (1 grau ≈ 111km)
  const dispersao = (raioKm / 111) * 0.8
  const lat = centro.lat + (Math.random() - 0.5) * dispersao * 2
  const lng = centro.lng + (Math.random() - 0.5) * dispersao * 2

  return { lat, lng }
}

/**
 * Gera nome realista baseado no segmento e bairro
 */
function gerarNomeEmpresa(segmento: string, bairro: string, index: number): string {
  const nomes = getNomesSegmento(segmento)
  const nomePrincipal = nomes[index % nomes.length]
  const sufixoLocal = getSufixoLocal(bairro)
  const sufixo = SUFIXOS_EMPRESA[Math.floor(Math.random() * SUFIXOS_EMPRESA.length)]
  
  // Variações de padrão de nome
  const padroes = [
    `${nomePrincipal} ${bairro}${sufixo ? " " + sufixo : ""}`,
    `${nomePrincipal} ${sufixoLocal}${sufixo ? " " + sufixo : ""}`,
    `${sufixoLocal} ${nomePrincipal}${sufixo ? " " + sufixo : ""}`,
    `${nomePrincipal} e ${nomePrincipal} ${bairro}`,
    `${nomePrincipal} do ${sufixoLocal}${sufixo ? " " + sufixo : ""}`,
  ]
  
  return padroes[Math.floor(Math.random() * padroes.length)]
}

/**
 * Gera endereço fictício realista
 */
function gerarEndereco(bairro: string): string {
  const tiposRua = ["Rua", "Av.", "Travessa", "Alameda", "Estrada"]
  const nomesRua = [
    "das Flores", "Brasil", "São Paulo", "Independência", "Dom Pedro",
    "XV de Novembro", "Sete de Setembro", "Getúlio Vargas", "Presidente Vargas",
    "Tiradentes", "Santos Dumont", "Caxias do Sul", "das Acácias",
    "dos Pinheiros", "Beija-Flor"
  ]
  const tipo = tiposRua[Math.floor(Math.random() * tiposRua.length)]
  const nome = nomesRua[Math.floor(Math.random() * nomesRua.length)]
  const numero = Math.floor(Math.random() * 2000) + 100
  return `${tipo} ${nome}, ${numero} — ${bairro}`
}

/**
 * Determina distribuição de score para ser realista:
 * 15% score 5, 25% score 4, 30% score 3, 20% score 2, 10% score 1
 */
function definirPerfil(): "alto" | "medio_alto" | "medio" | "medio_baixo" | "baixo" {
  const rand = Math.random()
  if (rand < 0.15) return "alto"
  if (rand < 0.40) return "medio_alto"
  if (rand < 0.70) return "medio"
  if (rand < 0.90) return "medio_baixo"
  return "baixo"
}

/**
 * Gera lista de empresas mock baseadas nos parâmetros de busca
 */
export async function gerarEmpresasMock(
  params: ParametrosBusca
): Promise<Empresa[]> {
  // Simula delay de API (1-2 segundos)
  const delayMs = 1000 + Math.random() * 1000
  await esperar(delayMs)

  const bairros = getBairros(params.cidade)
  // Gera exatamente a quantidade escolhida pelo usuário (ligada à faixa de créditos)
  const quantidade = params.quantidadeDesejada

  const empresas: Empresa[] = []

  // Determina estado baseado na cidade
  const estadoPorCidade: Record<string, string> = {
    "são paulo": "SP", "sp": "SP",
    "rio de janeiro": "RJ", "rj": "RJ",
    "florianópolis": "SC", "florianopolis": "SC",
    "curitiba": "PR", "porto alegre": "RS",
    "belo horizonte": "MG", "salvador": "BA",
    "fortaleza": "CE", "manaus": "AM", "recife": "PE",
  }
  const cidadeNorm = params.cidade.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  const estado = Object.entries(estadoPorCidade).find(([c]) =>
    cidadeNorm.includes(c) || c.includes(cidadeNorm)
  )?.[1] || "BR"

  // No modo "clientes potenciais", distribui os termos mapeados entre
  // as empresas geradas, para a demonstração simulada também refletir
  // a variedade de segmentos-clientes — não apenas o segmento do
  // prestador repetido em todas as linhas.
  const termosDisponiveis = params.segmentosBusca && params.segmentosBusca.length > 0
    ? params.segmentosBusca
    : [params.segmento]

  for (let i = 0; i < quantidade; i++) {
    const bairro = bairros[Math.floor(Math.random() * bairros.length)]
    const perfil = definirPerfil()
    const coordenadas = gerarCoordenadas(params.cidade, params.raioKm)
    const segmentoEmpresa = termosDisponiveis[i % termosDisponiveis.length]
    const nome = gerarNomeEmpresa(segmentoEmpresa, bairro, i)

    // Define presença de contatos por perfil
    const temTelefone = perfil !== "baixo" || Math.random() > 0.3
    const temEmail = perfil === "alto" || perfil === "medio_alto"
      ? Math.random() > 0.2
      : perfil === "medio"
      ? Math.random() > 0.4
      : Math.random() > 0.7
    const temWebsite = perfil === "alto"
      ? Math.random() > 0.1
      : perfil === "medio_alto"
      ? Math.random() > 0.3
      : Math.random() > 0.6
    const temInstagram = perfil === "alto" || perfil === "medio_alto"
      ? Math.random() > 0.3
      : Math.random() > 0.6
    const temFacebook = Math.random() > 0.5

    const avaliacao = gerarAvaliacao()

    const empresaParcial: Partial<Empresa> = {
      telefone: temTelefone ? gerarTelefone() : null,
      email: temEmail ? gerarEmail(nome) : null,
      website: temWebsite ? gerarWebsite(nome) : null,
      instagram: temInstagram ? gerarInstagram(nome) : null,
      facebook: temFacebook ? `fb.com/${nome.replace(/\s/g, "").toLowerCase().slice(0, 15)}` : null,
      avaliacaoGoogle: avaliacao,
    }

    const score = calcularScore(empresaParcial)

    const empresa: Empresa = {
      id: gerarId(),
      nome,
      segmento: segmentoEmpresa,
      endereco: gerarEndereco(bairro),
      bairro,
      cidade: params.cidade,
      estado,
      cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
      telefone: empresaParcial.telefone || null,
      email: empresaParcial.email || null,
      website: empresaParcial.website || null,
      instagram: empresaParcial.instagram || null,
      facebook: empresaParcial.facebook || null,
      avaliacaoGoogle: avaliacao,
      totalAvaliacoes: avaliacao ? gerarTotalAvaliacoes() : 0,
      score,
      latitude: coordenadas.lat,
      longitude: coordenadas.lng,
      favorita: false,
      criadaEm: new Date(),
    }

    empresas.push(empresa)
  }

  // Ordena por score decrescente
  return empresas.sort((a, b) => b.score - a.score)
}
