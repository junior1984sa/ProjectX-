/**
 * ANUNCIANTES DE DEMONSTRAÇÃO
 *
 * Empresas fictícias usadas enquanto não há anunciantes reais na base.
 * Servem para validar visualmente o banner e, principalmente, para
 * testar a SEGMENTAÇÃO: um dentista não deve ver anúncio de oficina
 * mecânica — deve ver fornecedores do ramo odontológico.
 *
 * Assim que houver anunciantes reais (perfis pagos e publicados no
 * diretório), eles têm prioridade e estes deixam de aparecer.
 *
 * O campo `segmento` precisa bater com uma chave de
 * MAPA_SEGMENTOS_CLIENTES em types/prestador.ts, porque é isso que
 * define para QUEM cada anúncio é relevante.
 */

export interface AnuncianteBanner {
  id: string
  nomeEmpresa: string
  /** Segmento do ANUNCIANTE (quem vende) */
  segmento: string
  cidade: string
  estado: string
  /** Chamada curta — o que ele oferece */
  chamada: string
  /** Cores do bloco de identidade visual (gradiente) */
  corInicio: string
  corFim: string
  /** true quando é empresa fictícia de demonstração */
  demonstracao: boolean
}

/** Gera as iniciais para o bloco de logo */
export function iniciaisDe(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export const ANUNCIANTES_DEMONSTRACAO: AnuncianteBanner[] = [
  {
    id: "demo-mat-construcao",
    nomeEmpresa: "Casa Forte Materiais",
    segmento: "loja de material de construção",
    cidade: "Florianópolis",
    estado: "SC",
    chamada: "Cimento, areia e brita com entrega em obra",
    corInicio: "#8B7332",
    corFim: "#3A3520",
    demonstracao: true,
  },
  {
    id: "demo-locacao",
    nomeEmpresa: "LocaMáquinas Sul",
    segmento: "locação de equipamentos",
    cidade: "Joinville",
    estado: "SC",
    chamada: "Betoneiras, andaimes e compactadores por diária",
    corInicio: "#5A6270",
    corFim: "#2A2E35",
    demonstracao: true,
  },
  {
    id: "demo-transportadora",
    nomeEmpresa: "RotaCerta Logística",
    segmento: "transportadora",
    cidade: "Curitiba",
    estado: "PR",
    chamada: "Fretes dedicados para indústria e comércio",
    corInicio: "#4A6B8A",
    corFim: "#22303D",
    demonstracao: true,
  },
  {
    id: "demo-equip-hospitalar",
    nomeEmpresa: "MedSupply Equipamentos",
    segmento: "fornecedor de equipamentos hospitalares",
    cidade: "São Paulo",
    estado: "SP",
    chamada: "Equipamentos e insumos para clínicas e consultórios",
    corInicio: "#3E7B7D",
    corFim: "#1D3536",
    demonstracao: true,
  },
  {
    id: "demo-equip-restaurante",
    nomeEmpresa: "ChefPro Equipamentos",
    segmento: "fornecedor de equipamentos para restaurantes",
    cidade: "Campinas",
    estado: "SP",
    chamada: "Fornos, coifas e câmaras frias com instalação",
    corInicio: "#8A5A3C",
    corFim: "#3A251A",
    demonstracao: true,
  },
  {
    id: "demo-distrib-alimentos",
    nomeEmpresa: "Sabor & Cia Distribuidora",
    segmento: "distribuidora de alimentos",
    cidade: "Porto Alegre",
    estado: "RS",
    chamada: "Abastecimento semanal para restaurantes e hotéis",
    corInicio: "#6B7A3C",
    corFim: "#2E351B",
    demonstracao: true,
  },
  {
    id: "demo-cosmeticos",
    nomeEmpresa: "BellaDistrib Cosméticos",
    segmento: "distribuidor de cosméticos",
    cidade: "Belo Horizonte",
    estado: "MG",
    chamada: "Linha profissional para salões e clínicas",
    corInicio: "#8A4A6B",
    corFim: "#3A1F2E",
    demonstracao: true,
  },
  {
    id: "demo-contabilidade",
    nomeEmpresa: "Contábil Precisa",
    segmento: "contabilidade",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    chamada: "Contabilidade completa para empresas de serviço",
    corInicio: "#4A5A8A",
    corFim: "#1F2638",
    demonstracao: true,
  },
  {
    id: "demo-advocacia",
    nomeEmpresa: "Marques & Associados",
    segmento: "advocacia",
    cidade: "São Paulo",
    estado: "SP",
    chamada: "Direito empresarial, contratos e trabalhista",
    corInicio: "#6B5A3C",
    corFim: "#2E271B",
    demonstracao: true,
  },
  {
    id: "demo-marketing",
    nomeEmpresa: "Órbita Marketing",
    segmento: "marketing digital",
    cidade: "Florianópolis",
    estado: "SC",
    chamada: "Google Ads e social media para PMEs",
    corInicio: "#7A4A8A",
    corFim: "#331F3A",
    demonstracao: true,
  },
  {
    id: "demo-ti",
    nomeEmpresa: "NexTI Soluções",
    segmento: "consultoria em ti",
    cidade: "Recife",
    estado: "PE",
    chamada: "Suporte, servidores e segurança para empresas",
    corInicio: "#3C6B7A",
    corFim: "#1B2E35",
    demonstracao: true,
  },
  {
    id: "demo-solar",
    nomeEmpresa: "SolarMax Energia",
    segmento: "energia solar",
    cidade: "Goiânia",
    estado: "GO",
    chamada: "Reduza até 90% da conta de luz da sua empresa",
    corInicio: "#8A7A3C",
    corFim: "#3A331B",
    demonstracao: true,
  },
  {
    id: "demo-rh",
    nomeEmpresa: "TalentoCerto RH",
    segmento: "recursos humanos / recrutamento",
    cidade: "Belo Horizonte",
    estado: "MG",
    chamada: "Recrutamento técnico e operacional",
    corInicio: "#4A7A5A",
    corFim: "#1F352A",
    demonstracao: true,
  },
  {
    id: "demo-agricola",
    nomeEmpresa: "AgroMáquinas Central",
    segmento: "maquinário agrícola",
    cidade: "Cascavel",
    estado: "PR",
    chamada: "Tratores e implementos com assistência técnica",
    corInicio: "#5A7A3C",
    corFim: "#28351B",
    demonstracao: true,
  },
  {
    id: "demo-autopecas",
    nomeEmpresa: "GiroPeças Distribuidora",
    segmento: "distribuidor de autopeças",
    cidade: "São Bernardo do Campo",
    estado: "SP",
    chamada: "Peças originais e paralelas com entrega no mesmo dia",
    corInicio: "#6B4A3C",
    corFim: "#2E201B",
    demonstracao: true,
  },
  {
    id: "demo-rochas",
    nomeEmpresa: "Pedra Nobre Rochas",
    segmento: "distribuidor de rochas ornamentais",
    cidade: "Cachoeiro de Itapemirim",
    estado: "ES",
    chamada: "Chapas de granito, mármore e quartzito direto da jazida",
    corInicio: "#5A5A6B",
    corFim: "#26262E",
    demonstracao: true,
  },
  {
    id: "demo-maq-marmoraria",
    nomeEmpresa: "TecnoCorte Máquinas",
    segmento: "fornecedor de máquinas para marmoraria",
    cidade: "Serra",
    estado: "ES",
    chamada: "Politrizes, ponte-serra e CNC para marmorarias",
    corInicio: "#3C5A6B",
    corFim: "#1B262E",
    demonstracao: true,
  },
]
