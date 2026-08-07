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
  /** Imposto sobre faturamento (Simples Nacional, %) */
  impostoPct: number
  /** Quanto do saldo de créditos o assinante médio realmente usa (0 a 1) */
  usoMedioCreditos: number
  /** Câmbio para real. O dono atualiza quando quiser. */
  cambio: Record<string, number>
}

/**
 * Valores iniciais. São PONTOS DE PARTIDA plausíveis, não cotações ao
 * vivo — o painel deixa isso explícito e permite corrigir cada um.
 *
 *  - custoPorCredito: cada crédito equivale a uma consulta de lugares.
 *    A faixa paga do Google Places gira em torno de US$ 32 por mil
 *    consultas; a R$ 5,40 o dólar isso dá ~R$ 0,17. Arredondado para
 *    cima, para não subestimar.
 *  - taxaGatewayPct: faixas públicas de cartão de crédito. Mercado Pago
 *    e Stripe variam conforme prazo de repasse e volume — confira a sua.
 *  - impostoPct: Simples Nacional, Anexo III, primeira faixa.
 *  - usoMedioCreditos: assinante médio não gasta 100% do saldo. Como os
 *    créditos acumulam, o custo real fica abaixo do teto do plano.
 */
export const PREMISSAS_PADRAO: Premissas = {
  custoPorCredito: 0.2,
  taxaGatewayPct: { mercadopago: 4.99, stripe: 3.9, paypal: 4.4 },
  impostoPct: 6,
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
  const impostoBRL = brutoMensalBRL * (premissas.impostoPct / 100)
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
  const lucroMensal = margemContribuicaoTotal - custoFixoMensal
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
    lucroMensal,
    margemLiquidaPct:
      receitaBrutaMensal > 0 ? (lucroMensal / receitaBrutaMensal) * 100 : 0,
    receitaAnualProjetada: receitaBrutaMensal * 12,
    pontoEquilibrio:
      margemMediaPorAssinante > 0
        ? Math.ceil(custoFixoMensal / margemMediaPorAssinante)
        : null,
    margemMediaPorAssinante,
  }
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
