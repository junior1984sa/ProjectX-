# -*- coding: utf-8 -*-
"""Dados transcritos das pranchas de ARMADURAS.

Cada especificacao carrega apenas o que foi lido do desenho e as observacoes de
auditoria. A montagem das abas fica em `construtor_armaduras.py`.
"""
from estilo import ACO, AZUL, LARANJA, N_2, N_INT, VERDE

# ---------------------------------------------------------------- comuns
NOTAS_GERAIS = [
 ["Nota geral 1", "Unidades", "Dimensões em centímetro, bitolas das barras em milímetro, exceto onde indicado."],
 ["Nota geral 2", "Aço", "CA-50."],
 ["Nota geral 3", "Dobramento", "Dobramento das barras conforme NBR-6118."],
 ["Nota geral 4", "Cobrimento", "Cobrimento mínimo pela face externa das barras: 5 cm."],
 ["Nota geral 5", "Interferências", "Cortar e dobrar as barras que interferirem com os rebaixos."],
 ["Critério adotado", "Massa linear das barras",
  "Ø8 = 0,395 kg/m; Ø16 = 1,578 kg/m; Ø20 = 2,466 kg/m — valores do quadro RESUMO GERAL, "
  "coincidentes com os nominais da NBR 7480."],
 ["Legenda", "Abreviaturas",
  "F.EXT. = face externa; F.INT. = face interna; SUP. = superior; INF. = inferior; "
  "CORR = barra corrida; VAR = comprimento variável."],
]

CARIMBO_COMUM = [
 ["Identificação", "Revisão", "0 — EMISSÃO ORIGINAL - PARA CONSTRUÇÃO (07/08/2026)"],
 ["Identificação", "Proprietário do documento", "Petrobras — SRGE/SI-III (classificação INTERNA)"],
 ["Identificação", "Razão social", "Consórcio TEM Boaventura"],
 ["Identificação", "Número do contrato", "ICJ 5900.0131990.25.2"],
 ["Identificação", "Responsável técnico", "Antenor de Castro — CREA 17974D-MG"],
 ["Identificação", "Executou / Verificou / Aprovou", "Carmen Santos / Marcio Yukio / Helgo Santos"],
 ["Identificação", "Folha e formato", "01 de 01 — A1 (841 × 594 mm) — escala INDICADA"],
]


def cards_padrao(massa, compr, nt, nposicoes, estribos, barras12, nbitolas):
    """Oito cartoes de indicador do painel, na ordem do layout."""
    plural = "fundações" if nt > 1 else "fundação"
    return [
     (1, 4, "MASSA TOTAL DE AÇO", round(massa, 2),
      "kg de armadura CA-50 (%d %s)" % (nt, plural), AZUL, N_2),
     (4, 4, "COMPRIMENTO TOTAL", round(compr, 2), "m lineares de barra", LARANJA, N_2),
     (7, 4, "FUNDAÇÕES ATENDIDAS", nt, "tanques cobertos pela prancha", ACO, N_INT),
     (10, 4, "POSIÇÕES DE BARRA", nposicoes, "posições N1 a N%d na lista" % nposicoes, VERDE, N_INT),
     (1, 9, "MASSA POR FUNDAÇÃO", round(massa / nt, 2), "kg de aço por tanque", VERDE, N_2),
     (4, 9, "BITOLAS EMPREGADAS", nbitolas, "bitolas distintas — aço CA-50", ACO, N_INT),
     (7, 9, "ESTRIBOS", estribos, "un de estribo no conjunto", LARANJA, N_INT),
     (10, 9, "BARRAS DE 12 m", barras12, "un equivalentes para suprimento", AZUL, N_INT),
    ]


OBS_CORR_SUPINF = "Barra corrida (CORR) do banzo superior e inferior."
OBS_N6 = "N6 c/20 na face externa; barra corrida (CORR) ao longo do desenvolvimento do anel."
OBS_N7 = "N7 c/20 na face interna; barra corrida (CORR) ao longo do desenvolvimento do anel."

LEIAME_BASE = [
 ["Critério de massa",
  "Massa = comprimento total × massa linear nominal (Ø8 = 0,395 kg/m; Ø16 = 1,578 kg/m; "
  "Ø20 = 2,466 kg/m), exatamente como no quadro RESUMO GERAL da prancha e em linha com a NBR 7480."],
 ["Valores DERIVADOS",
  "Na aba Geometria e Seções, as linhas marcadas como DERIVADO não constam do desenho: são cálculo "
  "próprio, apenas indicativo, para apoio de planejamento."],
 ["Perdas",
  "Os números são os de projeto. Nenhuma taxa de perda de corte, dobra ou emenda foi acrescida. A "
  "coluna 'Barras de 12 m' é apenas um equivalente de suprimento (comprimento / 12 m, arredondado "
  "para cima)."],
 ["Unidades",
  "mm = milímetro (bitola); cm = centímetro (cotas do desenho); m = metro; kg = quilograma; "
  "t = tonelada; un = unidade; CORR = barra corrida; VAR = comprimento variável."],
 ["Limite de uso",
  "Levantamento para planejamento, orçamento e controle. Qualquer uso para execução ou compra deve "
  "ser submetido à validação do responsável técnico do projeto."],
]
