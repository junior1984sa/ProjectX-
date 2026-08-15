import {
  PLANOS,
  ORDEM_PLANOS,
  PRECOS_POR_PAIS,
  PAISES_DISPONIVEIS,
  obterPais,
  type TipoPlano,
} from "@/types/prestador"

/**
 * PROJEÇÃO FINANCEIRA
 *
 * O painel de "Visão geral" mostra o que JÁ aconteceu: assinantes reais,
 * receita real. Enquanto não houver assinantes, ele mostra zeros — e
 * zero não ajuda a decidir nada.
 *
 * Este módulo responde a outra pergunta: quanto o negócio RENDE se
 * entrarem N assinantes. É o que permite saber quantas vendas pagam a
 * operação antes de gastar com anúncio.
 *
 * Nenhum número aqui é inventado como se fosse fato. As taxas e custos
 * variáveis são PREMISSAS editáveis pelo dono, com valor inicial
 * documentado. Cada uma diz de onde veio.
 */

// ═══════════════════════════════════════════════════════════
// PREMISSAS — todas editáveis no painel
// ═══════════════════════════════════════════════════════════

export interface Premissas {
  /** Quanto custa cada crédito de busca consumido (BRL) */
  custoPorCredito: number
  /** Percentual retido pelo gateway sobre cada cobrança */
  taxaGatewayPct: Record<"mercadopago" | "stripe" | "paypal", number>
  /**
   * Anexo do Simples Nacional em que a empresa se enquadra.
   *
   * SaaS por assinatura está sujeito ao fator "r" (LC 123, art. 18,
   * §5º-M): folha ÷ receita dos últimos 12 meses. Igual ou acima de
   * 28% cai no Anexo III; abaixo, no Anexo V. Sem pró-labore, é V.
   *
   * O painel usava 6% fixo, assumindo Anexo III — o que só é verdade
   * se houver pró-labore. A diferença entre os dois anexos é de 9,5
   * pontos percentuais da receita.
   */
  anexoSimples: "III" | "V"
  /** Quanto do saldo de créditos o assinante médio realmente usa (0 a 1) */
  usoMedioCreditos: number
  /** Câmbio para real. O dono atualiza quando quiser. */
  cambio: Record<string, number>
}

/**
 * Valores iniciais. São PONTOS DE PARTIDA plausíveis, não cotações ao
 * vivo — o painel deixa isso explícito e permite corrigir cada um.
 *
 *  - custoPorCredito: cada crédito equivale a uma consulta de dados.
 *    Hoje a fonte é o OpenStreetMap via Overpass, que não cobra — o
 *    custo real de API é ZERO. O valor inicial de R$ 0,20 é uma reserva
 *    deliberada para o dia em que entrar uma fonte paga, porque projetar
 *    com custo zero produz margem que some assim que a base melhorar.
 *    Quando contratar a fonte definitiva, troque por (preço por mil
 *    consultas ÷ 1000), convertido pelo câmbio.
 *  - taxaGatewayPct: faixas públicas de cartão de crédito. Mercado Pago
 *    e Stripe variam conforme prazo de repasse e volume — confira a sua.
 *  - anexoSimples: começa em "V" de propósito. Sem pró-labore é esse
 *    o enquadramento, e projetar com o Anexo III sem ter folha
 *    subestima o imposto em 9,5 pontos da receita. Mude para "III"
 *    quando o pró-labore estiver ativo — o ponto em que ele compensa
 *    é cerca de R$ 1.900/mês de receita.
 *  - usoMedioCreditos: assinante médio não gasta 100% do saldo. Como os
 *    créditos acumulam, o custo real fica abaixo do teto do plano.
 */
export const PREMISSAS_PADRAO: Premissas = {
  custoPorCredito: 0.2,
  taxaGatewayPct: { mercadopago: 4.99, stripe: 3.9, paypal: 4.4 },
  anexoSimples: "V",
  usoMedioCreditos: 0.7,
  cambio: {
    BRL: 1, USD: 5.4, AUD: 3.5, NZD: 3.2, CAD: 3.9,
    GBP: 6.9, EUR: 5.9, MXN: 0.29, PYG: 0.00072,
  },
}

const CHAVE_PREMISSAS = "prospectx:premissas-financeiras"

export function carregarPremissas(): Premissas {
  try {
    const salvo = localStorage.getItem(CHAVE_PREMISSAS)
    if (!salvo) return PREMISSAS_PADRAO
    const lido = JSON.parse(salvo) as Partial<Premissas>
    // Mescla com o padrão para que uma premissa nova adicionada depois
    // não fique indefinida em quem já tem preferências salvas.
    return {
      ...PREMISSAS_PADRAO,
      ...lido,
      taxaGatewayPct: { ...PREMISSAS_PADRAO.taxaGatewayPct, ...lido.taxaGatewayPct },
      cambio: { ...PREMISSAS_PADRAO.cambio, ...lido.cambio },
    }
  } catch {
    return PREMISSAS_PADRAO
  }
}

export function salvarPremissas(premissas: Premissas): void {
  localStorage.setItem(CHAVE_PREMISSAS, JSON.stringify(premissas))
}

// ═══════════════════════════════════════════════════════════
// RECEITA POR ASSINANTE
// ═══════════════════════════════════════════════════════════

export interface ReceitaUnitaria {
  pais: string
  plano: TipoPlano
  /** Preço cheio do ciclo, na moeda local */
  precoCicloLocal: number
  moeda: string
  /** Receita bruta mensalizada, em reais */
  brutoMensalBRL: number
  /** O que o gateway retém, em reais por mês */
  taxaGatewayBRL: number
  /** Imposto sobre o faturamento, em reais por mês */
  impostoBRL: number
  /** Custo de API para atender esse assinante, em reais por mês */
  custoVariavelBRL: number
  /** O que sobra por mês para pagar o custo fixo */
  margemContribuicaoBRL: number
  /** Margem de contribuição como % da receita bruta */
  margemPct: number
}

/**
 * ALÍQUOTA EFETIVA DO SIMPLES, por anexo e por destino da receita.
 *
 * Receita de exportação de serviço paga MENOS: a LC 123, art. 18, §14
 * manda desconsiderar PIS, Cofins e ISS no cálculo do DAS. Sobram só
 * IRPJ, CSLL e CPP — que no Anexo III somam 50,90% da alíquota, e no
 * Anexo V somam 68,85%.
 *
 * Na prática, um assinante americano custa menos imposto que um
 * brasileiro do mesmo valor. Isso muda a decisão de para onde vender.
 *
 * A tese de exportação depende de três requisitos cumulativos:
 * tomador no exterior, ingresso de divisas no país, e RESULTADO
 * verificado no exterior. O terceiro é o frágil — se um assinante
 * americano buscar empresas em São Paulo, cabe o argumento de que o
 * resultado ocorreu no Brasil.
 */
export function aliquotaSimples(anexo: "III" | "V", pais: string): number {
  const exportacao = pais !== "BR"
  if (anexo === "III") return exportacao ? 3.054 : 6.0
  return exportacao ? 10.672 : 15.5
}

/**
 * Quanto um único assinante deixa por mês, já descontando tudo que
 * varia com ele: taxa do gateway, imposto e consumo de API.
 *
 * O que sobra é a MARGEM DE CONTRIBUIÇÃO — o valor que efetivamente
 * ajuda a pagar o custo fixo. É esse número, e não o preço de tabela,
 * que determina quantos assinantes são necessários para o negócio
 * se sustentar.
 */
export function calcularReceitaUnitaria(
  pais: string,
  plano: TipoPlano,
  premissas: Premissas,
): ReceitaUnitaria {
  const config = obterPais(pais)
  const configPlano = PLANOS[plano]
  const precoCicloLocal = PRECOS_POR_PAIS[config.codigo]?.[plano] ?? configPlano.precoTotal
  const taxaCambio = premissas.cambio[config.moeda] ?? 1

  const brutoMensalBRL = (precoCicloLocal / configPlano.meses) * taxaCambio

  // País sem gateway definido ainda não vende — mas o custo de atender
  // existiria do mesmo jeito, então projetamos com a taxa do Stripe,
  // que é a rota provável para fora do Brasil.
  const gateway = config.gateway ?? "stripe"
  const taxaGatewayBRL = brutoMensalBRL * (premissas.taxaGatewayPct[gateway] / 100)
  const impostoBRL = brutoMensalBRL * (aliquotaSimples(premissas.anexoSimples, config.codigo) / 100)
  const custoVariavelBRL =
    configPlano.creditosMensais * premissas.usoMedioCreditos * premissas.custoPorCredito

  const margemContribuicaoBRL =
    brutoMensalBRL - taxaGatewayBRL - impostoBRL - custoVariavelBRL

  return {
    pais: config.codigo,
    plano,
    precoCicloLocal,
    moeda: config.moeda,
    brutoMensalBRL,
    taxaGatewayBRL,
    impostoBRL,
    custoVariavelBRL,
    margemContribuicaoBRL,
    margemPct: brutoMensalBRL > 0 ? (margemContribuicaoBRL / brutoMensalBRL) * 100 : 0,
  }
}

/** Grade completa: cada país × cada plano. Alimenta a tabela de referência. */
export function montarGradeReceitas(premissas: Premissas): ReceitaUnitaria[] {
  return PAISES_DISPONIVEIS.flatMap((pais) =>
    ORDEM_PLANOS.map((plano) => calcularReceitaUnitaria(pais.codigo, plano, premissas)),
  )
}

// ═══════════════════════════════════════════════════════════
// PRÓ-LABORE — o preço de ficar no Anexo III
// ═══════════════════════════════════════════════════════════

/**
 * Piso do pró-labore: um sócio que trabalha na empresa não pode receber
 * menos que o salário mínimo. Confirme o valor vigente — este é o de
 * referência usado no modelo, e ele muda todo ano.
 */
export const SALARIO_MINIMO_REFERENCIA = 1621

/** Percentual da receita que precisa virar folha para o fator "r" fechar 28%. */
export const PRO_LABORE_PCT_FATOR_R = 25.4

export interface CustoProLabore {
  /** Bruto pago ao sócio, em reais por mês */
  bruto: number
  /** INSS de 11% retido sobre o bruto */
  inss: number
  /** O que sai do caixa da empresa (o bruto; o INSS já está dentro dele) */
  saidaDeCaixa: number
  /** Se o pró-labore foi puxado pelo piso e não pelo fator "r" */
  limitadoPeloPiso: boolean
  /** Se o sócio provavelmente entra na faixa de IRRF */
  atingeIRRF: boolean
}

/**
 * Quanto custa manter o enquadramento no Anexo III.
 *
 * O fator "r" (LC 123, art. 18, §5º-J e §5º-M) compara folha com receita
 * dos últimos 12 meses. Igual ou acima de 28%, Anexo III; abaixo, Anexo V.
 * A folha considerada inclui o pró-labore e seus encargos — por isso
 * 25,4% da receita em pró-labore, somado ao INSS de 11% que incide
 * sobre ele, chega aos 28%.
 *
 * A conta que importa: o Anexo III economiza 9,5 pontos de imposto,
 * e o pró-labore custa 25,4% da receita. Só que o pró-labore NÃO é
 * dinheiro perdido — é o dono se pagando. O que se perde de fato é o
 * INSS de 11% sobre ele, cerca de 2,8% da receita. Contra 9,5 pontos
 * de economia, o Anexo III ganha com folga assim que o pró-labore
 * deixa de ser puxado pelo piso.
 *
 * RESSALVA: o modelo aplica 11% sem teto. Existe teto de contribuição
 * do INSS, acima do qual ela para de crescer — em receitas altas isso
 * SUPERESTIMA o custo. Confirme a faixa vigente com o contador.
 * O IRRF não entra aqui: ele incide sobre o sócio, não sobre a empresa.
 */
export function calcularProLabore(
  receitaBrutaMensal: number,
  anexo: "III" | "V",
): CustoProLabore | null {
  // No Anexo V não há obrigação de folha para manter enquadramento.
  // O sócio pode retirar como lucro, isento. Modelar pró-labore aqui
  // inventaria uma despesa que a empresa não tem.
  if (anexo !== "III") return null

  const peloFatorR = receitaBrutaMensal * (PRO_LABORE_PCT_FATOR_R / 100)
  const limitadoPeloPiso = peloFatorR < SALARIO_MINIMO_REFERENCIA
  const bruto = Math.max(SALARIO_MINIMO_REFERENCIA, peloFatorR)

  return {
    bruto,
    inss: bruto * 0.11,
    saidaDeCaixa: bruto,
    limitadoPeloPiso,
    // Faixa de isenção do IRRF na fonte. Acima dela o sócio passa a
    // recolher — o que não muda o custo da empresa, mas muda o que
    // chega ao bolso dele.
    atingeIRRF: bruto > 5000,
  }
}

export interface ComparacaoAnexos {
  /** Imposto + INSS que cada anexo tira do dono, por mês */
  custoAnexoIII: number
  custoAnexoV: number
  /** Positivo = o Anexo III sai mais barato */
  vantagemDoIII: number
  /** Receita a partir da qual o Anexo III passa a valer a pena */
  receitaDeVirada: number
}

/**
 * Qual anexo sai mais barato PARA O DONO.
 *
 * A linha de despesa do cenário desconta o pró-labore inteiro, o que é
 * contabilmente correto e financeiramente enganoso: o pró-labore sai da
 * empresa mas entra no bolso do sócio. Só o INSS de 11% desaparece.
 *
 * Comparando o que efetivamente evapora — imposto mais INSS — o Anexo III
 * vira quando 9,5% da receita supera 11% do pró-labore. Enquanto o
 * pró-labore está travado no piso do salário mínimo, isso exige cerca de
 * R$ 1.900 de receita mensal. Acima disso o III ganha sempre, porque a
 * economia cresce mais rápido que o encargo (9,5% contra 2,79%).
 *
 * A conta usa alíquotas de mercado interno. Com receita de exportação a
 * diferença encolhe — 3,054% contra 10,672% — mas a conclusão não muda.
 */
export function compararAnexos(receitaBrutaMensal: number): ComparacaoAnexos {
  const proLabore = calcularProLabore(receitaBrutaMensal, "III")
  const custoAnexoIII = receitaBrutaMensal * 0.06 + (proLabore?.inss ?? 0)
  const custoAnexoV = receitaBrutaMensal * 0.155

  return {
    custoAnexoIII,
    custoAnexoV,
    vantagemDoIII: custoAnexoV - custoAnexoIII,
    // 0,095·R = 0,11·piso, enquanto o piso manda
    receitaDeVirada: (SALARIO_MINIMO_REFERENCIA * 0.11) / 0.095,
  }
}

// ═══════════════════════════════════════════════════════════
// CENÁRIO — N assinantes distribuídos entre planos
// ═══════════════════════════════════════════════════════════

export type MixDePlanos = Record<TipoPlano, number>

export interface ResultadoCenario {
  totalAssinantes: number
  receitaBrutaMensal: number
  totalTaxasGateway: number
  totalImpostos: number
  totalCustoVariavel: number
  margemContribuicaoTotal: number
  custoFixoMensal: number
  /** Pró-labore obrigatório para manter o Anexo III. Nulo no Anexo V. */
  proLabore: CustoProLabore | null
  lucroMensal: number
  margemLiquidaPct: number
  /** Receita anual, se o quadro de assinantes se mantiver */
  receitaAnualProjetada: number
  /** Quantos assinantes do mix atual pagariam exatamente o custo fixo */
  pontoEquilibrio: number | null
  /** Margem média que um assinante deixa neste mix */
  margemMediaPorAssinante: number
}

/**
 * Roda um cenário completo.
 *
 * O ponto de equilíbrio usa a margem MÉDIA do mix informado, não o
 * preço de tabela: dois negócios com a mesma receita e mixes diferentes
 * empatam em pontos diferentes, porque o plano mensal deixa proporção
 * menor que o anual.
 */
export function calcularCenario(
  mix: MixDePlanos,
  pais: string,
  custoFixoMensal: number,
  premissas: Premissas,
): ResultadoCenario {
  let receitaBrutaMensal = 0
  let totalTaxasGateway = 0
  let totalImpostos = 0
  let totalCustoVariavel = 0
  let totalAssinantes = 0

  for (const plano of ORDEM_PLANOS) {
    const quantidade = mix[plano] ?? 0
    if (quantidade <= 0) continue

    const unitaria = calcularReceitaUnitaria(pais, plano, premissas)
    receitaBrutaMensal += unitaria.brutoMensalBRL * quantidade
    totalTaxasGateway += unitaria.taxaGatewayBRL * quantidade
    totalImpostos += unitaria.impostoBRL * quantidade
    totalCustoVariavel += unitaria.custoVariavelBRL * quantidade
    totalAssinantes += quantidade
  }

  const margemContribuicaoTotal =
    receitaBrutaMensal - totalTaxasGateway - totalImpostos - totalCustoVariavel

  // O pró-labore não é opcional no Anexo III: sem ele o fator "r" não
  // fecha e a empresa cai no Anexo V, perdendo justamente o desconto
  // que motivou a escolha. Por isso entra como despesa do cenário, e
  // não como retirada do dono "quando sobrar".
  const proLabore = calcularProLabore(receitaBrutaMensal, premissas.anexoSimples)
  const lucroMensal =
    margemContribuicaoTotal - custoFixoMensal - (proLabore?.saidaDeCaixa ?? 0)
  const margemMediaPorAssinante =
    totalAssinantes > 0 ? margemContribuicaoTotal / totalAssinantes : 0

  return {
    totalAssinantes,
    receitaBrutaMensal,
    totalTaxasGateway,
    totalImpostos,
    totalCustoVariavel,
    margemContribuicaoTotal,
    custoFixoMensal,
    proLabore,
    lucroMensal,
    margemLiquidaPct:
      receitaBrutaMensal > 0 ? (lucroMensal / receitaBrutaMensal) * 100 : 0,
    receitaAnualProjetada: receitaBrutaMensal * 12,
    pontoEquilibrio: acharPontoEquilibrio(mix, pais, custoFixoMensal, premissas),
    margemMediaPorAssinante,
  }
}

/**
 * Quantos assinantes pagam a operação.
 *
 * Com o Anexo III o custo deixa de ser fixo — o pró-labore é 25,4% da
 * receita, então cada assinante novo traz margem E despesa junto.
 * Dividir custo fixo pela margem média, como se fazia antes, superestima
 * a facilidade de empatar. Aqui o cenário é recalculado assinante a
 * assinante até o lucro virar positivo.
 *
 * Retorna null se o mix nunca empata: acontece quando a margem por
 * assinante é negativa, e nesse caso vender mais só aumenta o prejuízo.
 */
function acharPontoEquilibrio(
  mixReferencia: MixDePlanos,
  pais: string,
  custoFixoMensal: number,
  premissas: Premissas,
): number | null {
  const totalReferencia = ORDEM_PLANOS.reduce((soma, p) => soma + (mixReferencia[p] ?? 0), 0)
  if (totalReferencia <= 0) return null

  // Mantém a mesma proporção do mix informado enquanto varia o total.
  const proporcao: MixDePlanos = { mensal: 0, trimestral: 0, semestral: 0, anual: 0 }
  for (const plano of ORDEM_PLANOS) {
    proporcao[plano] = ((mixReferencia[plano] ?? 0) / totalReferencia) * 100
  }

  const lucroCom = (n: number): number => {
    const mix = distribuirAssinantes(n, proporcao)
    let bruto = 0
    let margem = 0
    for (const plano of ORDEM_PLANOS) {
      const q = mix[plano] ?? 0
      if (q <= 0) continue
      const u = calcularReceitaUnitaria(pais, plano, premissas)
      bruto += u.brutoMensalBRL * q
      margem += u.margemContribuicaoBRL * q
    }
    const pl = calcularProLabore(bruto, premissas.anexoSimples)
    return margem - custoFixoMensal - (pl?.saidaDeCaixa ?? 0)
  }

  // 5.000 assinantes é teto de sanidade: se não empatou até aí, o
  // problema é o preço, não o volume.
  const TETO = 5000
  if (lucroCom(TETO) < 0) return null

  let baixo = 1
  let alto = TETO
  while (baixo < alto) {
    const meio = Math.floor((baixo + alto) / 2)
    if (lucroCom(meio) >= 0) alto = meio
    else baixo = meio + 1
  }
  return baixo
}

/**
 * Distribui N assinantes seguindo uma proporção de mix.
 *
 * A proporção padrão reflete a expectativa realista de venda: o plano
 * mensal é o mais escolhido por quem ainda não confia, e o anual é
 * minoria — mesmo sendo o mais rentável.
 */
export const MIX_PADRAO_PCT: MixDePlanos = {
  mensal: 45,
  trimestral: 25,
  semestral: 20,
  anual: 10,
}

export function distribuirAssinantes(total: number, mixPct: MixDePlanos): MixDePlanos {
  const distribuido: MixDePlanos = { mensal: 0, trimestral: 0, semestral: 0, anual: 0 }
  let alocado = 0

  ORDEM_PLANOS.forEach((plano, indice) => {
    if (indice === ORDEM_PLANOS.length - 1) {
      // O último recebe a sobra do arredondamento, para o total bater
      // exatamente com o número pedido.
      distribuido[plano] = Math.max(0, total - alocado)
      return
    }
    const quantidade = Math.round((total * (mixPct[plano] ?? 0)) / 100)
    distribuido[plano] = quantidade
    alocado += quantidade
  })

  return distribuido
}

/** Degraus de crescimento usados na tabela de cenários prontos */
export const DEGRAUS_CENARIO = [10, 25, 50, 100, 250, 500, 1000]
