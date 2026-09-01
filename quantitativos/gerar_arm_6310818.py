# -*- coding: utf-8 -*-
"""DE-5400.00-6310-120-TX3-060 — ARMADURAS das fundações dos TQ-6310818 A/B/C/D (4x)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_armaduras as CA
from pranchas_armaduras import (CARIMBO_COMUM, LEIAME_BASE, NOTAS_GERAIS, OBS_CORR_SUPINF,
                                cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 4
DOC = "DE-5400.00-6310-120-TX3-060"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanques de lubrificação "
         "TQ-6310818 A/B/C/D - ARMADURAS" % DOC)

# desenvolvimentos cotados nas elevações (m) e geometria do anel (prancha de formas TX3-059)
DEV_EXT, DEV_SI, DEV_INT = 55.555, 53.941, 52.326
R_INT, R_EIXO, R_EXT = 8.26, 8.585, 8.91
SEC_B, SEC_H = 0.65, 1.50
VOL_ANEL = SEC_B * SEC_H * DEV_SI          # 52,59 m³ — confere com os 52,50 m³ do TX3-059
VOL_FORMAS = 52.50                          # concreto estrutural declarado no TX3-059

BARRAS = [
 (1, 20, 8, "CORR", None, 516.00, "N1", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 64,50 m de desenvolvimento por barra."),
 (2, 20, 8, "CORR", None, 528.00, "N2", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 66,00 m de desenvolvimento por barra."),
 (3, 20, 8, "CORR", None, 528.00, "N3", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 66,00 m de desenvolvimento por barra."),
 (4, 20, 8, "CORR", None, 528.00, "N4", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 66,00 m de desenvolvimento por barra."),
 (5, 20, 8, "CORR", None, 544.00, "N5", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 68,00 m de desenvolvimento por barra."),
 (6, 16, 24, "CORR", None, 1567.20, "N6", "Corrida face externa", "CORTE A-A / FACE EXTERNA",
  "6 N6 c/20 na face externa (5 N6 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel."),
 (7, 16, 24, "CORR", None, 1504.80, "N7", "Corrida face interna", "CORTE A-A / FACE INTERNA",
  "6 N7 c/20 na face interna (5 N7 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel."),
 (8, 8, 1088, "465", 465, 5059.20, "N8", "Estribo", "PLANTA / CORTE A-A",
  "272 N8 c/20 por fundação; estribo fechado 55 × 140 cm, C=465 cm (dimensões internas ao "
  "cobrimento de 5 cm da seção de 65 × 150 cm)."),
 (9, 8, 20, "473", 473, 94.60, "N9", "Estribo no rebaixo", "VISTA C-C",
  "5 N9 c/20 por fundação; estribo na região do rebaixo para fixação da porta de limpeza, C=473 cm."),
 (10, 16, 16, "500", 500, 80.00, "N10", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N10-4 Ø16 C=500 cm; disposto 2x2 na região do rebaixo."),
 (11, 20, 32, "600", 600, 192.00, "N11", "Reforço superior do rebaixo", "VISTA C-C / CORTE B-B",
  "N11-4 Ø20 C=600 cm (SUP.), dobra Ri=8 e perna 120 cm; a VISTA C-C traz dois conjuntos de 4 un, "
  "totalizando 8 un por fundação. Ver Nota 5."),
 (12, 8, 16, "VAR", None, 77.28, "N12", "Estribo de comprimento variável", "VISTA C-C",
  "N12-2x2 Ø8 C=VAR; forma cotada com perna variável (113 a 133) cm."),
 (13, 16, 8, "455", 455, 36.40, "N13", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N13-2 Ø16 C=455 cm na região do rebaixo; 2 un por fundação, coerente com a chamada do detalhe."),
]

# quadro RESUMO GERAL impresso: bitola -> (comprimento m, massa kg)
RESUMO_DES = {8: (5231.08, 2066), 16: (3152.00, 4974), 20: (2836.00, 6994)}
TOTAL_DES = 14034

COMP_LISTA = {d: sum(b[CA.TOT] for b in BARRAS if b[CA.BIT] == d) for d in RESUMO_DES}
MASSA_LISTA = sum(b[CA.TOT] * CA.KGM[b[CA.BIT]] for b in BARRAS)
MASSA_RESUMO = sum(RESUMO_DES[d][0] * CA.KGM[d] for d in RESUMO_DES)
DELTA_N13 = 36.40 * CA.KGM[16]

SPEC = {
 "nt": NT,
 "barras": BARRAS,
 "resumo_des": RESUMO_DES,
 "total_des": TOTAL_DES,
 "fonte": FONTE,
 "elemento": "Fundação anelar — armadura",
 "tanques": ["TQ-6310818A", "TQ-6310818B", "TQ-6310818C", "TQ-6310818D"],
 "grupos": [
   ("Barras corridas — faces superior e inferior", [1, 2, 3, 4, 5]),
   ("Barras corridas — faces externa e interna", [6, 7]),
   ("Estribos", [8, 9, 12]),
   ("Reforços da região do rebaixo", [10, 11, 13]),
 ],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - ARMADURAS DAS FUNDAÇÕES DOS TQ-6310818 A/B/C/D",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6310818 A/B/C/D (4x)  |  "
                      "U-6310 - Refino Boaventura  |  Escopo: armadura passiva CA-50" % DOC),
 "cards": cards_padrao,
 "nota_lista": ("Quadro LISTA DE BARRAS (4x) transcrito posição a posição. As colunas QUANT. e TOTAL "
                "do desenho referem-se ao conjunto das 4 fundações; as colunas por fundação são "
                "derivadas por divisão por 4."),
 "nota_unitario": ("A prancha atende 4 fundações idênticas (indicação '4x' na planta e na lista de "
                   "barras). O quantitativo unitário é obtido dividindo os totais por 4."),
 "msg_desvio_compr": {
   16: ("O somatório das posições Ø16 da LISTA DE BARRAS (N6+N7+N10+N13) é 3.188,40 m, mas o quadro "
        "RESUMO GERAL traz 3.152,00 m. A diferença de 36,40 m é exatamente a posição N13 "
        "(8 un × 4,55 m), que aparece na lista mas NÃO foi somada ao "
        "RESUMO GERAL. Impacto: +57,44 kg de Ø16. CONFIRMAR COM O PROJETISTA."),
 },
 "notas_bitola": [
  "As bitolas Ø8 e Ø20 fecham exatamente entre a LISTA DE BARRAS e o quadro RESUMO GERAL.",
  "Ø16: a lista soma 3.188,40 m e o RESUMO GERAL traz 3.152,00 m. A diferença de 36,40 m corresponde "
  "integralmente à posição N13, que não foi incorporada ao resumo impresso (+57,44 kg).",
  "Em consequência, a massa total auditada pela lista é 14.091,15 kg, contra os 14.034 kg impressos "
  "no TOTAL (kg) da prancha. Adote 14.091,15 kg se a posição N13 for confirmada.",
  "A coluna 'Barras de 12 m' é um equivalente de suprimentos (comprimento / 12 m, arredondado para "
  "cima). Não considera perdas de corte, dobra e emendas.",
 ],
 "geometria": [
  ["Vista", "PLANTA - ARMADURA - TQ-6310818 A/B/C/D (4x)", "1:100", None, "PRANCHA",
   "Planta de armadura do anel de fundação; indicação 272 N8 c.20 e 5 N9 c.20."],
  ["Vista", "CORTE A-A", "1:20", None, "PRANCHA",
   "Seção corrente do anel, com 6 N6 c/20 na face externa e 6 N7 c/20 na face interna."],
  ["Vista", "CORTE B-B", "1:20", None, "PRANCHA",
   "Seção na região do rebaixo, com 5 N6 / 5 N7 c/20, N10, N11, N8 e 2 N13."],
  ["Vista", "VISTA C-C", "1:25", None, "PRANCHA",
   "Detalhe do rebaixo para fixação da porta de limpeza: N9, N10, N11, N12 e N13."],
  ["Vista", "FACE EXTERNA - ELEVAÇÃO", "S/ESC.", DEV_EXT, "PRANCHA",
   "Desenvolvimento cotado de 5555,5 cm; malha de N5 e N6 com trechos de 160 cm e traspasses de 40 cm."],
  ["Vista", "FACE INTERNA - ELEVAÇÃO", "S/ESC.", DEV_INT, "PRANCHA",
   "Desenvolvimento cotado de 5232,6 cm; malha de N1 e N7."],
  ["Vista", "FACE SUPERIOR E INFERIOR - PLANTA", "S/ESC.", DEV_SI, "PRANCHA",
   "Desenvolvimento cotado de 5394,1 cm; malha de N1 a N5."],
  ["Anel (TX3-059)", "Raio interno do anel (m)", "-", R_INT, "PRANCHA TX3-059",
   "R826 cm na planta de formas; diâmetro interno cotado de 1652 cm."],
  ["Anel (TX3-059)", "Raio do eixo do anel (m)", "-", R_EIXO, "PRANCHA TX3-059", "R858,5 cm."],
  ["Anel (TX3-059)", "Raio externo do anel (m)", "-", R_EXT, "PRANCHA TX3-059", "R891 cm."],
  ["Anel (TX3-059)", "Largura radial da seção (m)", "-", SEC_B, "PRANCHA TX3-059",
   "Cota 65 cm no DETALHE 1 (R891 - R826 = 65 cm)."],
  ["Anel (TX3-059)", "Altura da seção (m)", "-", SEC_H, "PRANCHA TX3-059",
   "Cota 150 cm no DETALHE 1. O estribo N8 de 55 × 140 cm resulta do cobrimento de 5 cm "
   "(65 - 2×5 = 55 e 150 - 2×5 = 140)."],
  ["Espaçamento", "Estribos N8 na seção corrente (m)", "-", 0.20, "PRANCHA",
   "272 N8 c/20 por fundação; 272 × 0,20 = 54,40 m, coerente com o desenvolvimento do eixo (53,94 m)."],
  ["Espaçamento", "Barras horizontais N6 / N7 (m)", "-", 0.20, "PRANCHA",
   "6 N6 c/20 e 6 N7 c/20 no CORTE A-A; 5 + 5 c/20 no CORTE B-B (trecho do rebaixo)."],
  ["Traspasse", "Traspasse típico das barras corridas (m)", "-", 0.40, "PRANCHA",
   "Cotas 40 (TÍP.) e 160 repetidas nas elevações das faces."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO",
   "0,65 m × 1,50 m, conforme o DETALHE 1 da prancha de formas TX3-059."],
  ["Derivado", "Volume de concreto por fundação (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "Área da seção × desenvolvimento do eixo (53,941 m). Confere com os 52,50 m³ de concreto "
   "estrutural declarados no quadro da prancha de formas TX3-059 (diferença de 0,17%)."],
  ["Prancha TX3-059", "Concreto estrutural por fundação (m³)", "-", VOL_FORMAS, "PRANCHA TX3-059",
   "Valor oficial do quadro QUANTITATIVO TOTAL da prancha de formas."],
  ["Derivado", "Taxa de armadura (kg/m³)", "-", round((MASSA_LISTA / NT) / VOL_FORMAS, 1), "DERIVADO",
   "Massa de aço por fundação (pela lista auditada) dividida pelo concreto estrutural do TX3-059."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título",
     "Desenho de fundação - tanques de lubrificação TQ-6310818 A/B/C/D - ARMADURAS"],
    ["Identificação", "Área",
     "Parque de tanques de produtos acabados (lubrificantes) - U-6310"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6310-120-TX3-001 - Memória de cálculo de fundação - tanques de lubrificação (U-6310)."],
    ["Documento complementar", "Formas",
     "DE-5400.00-6310-120-TX3-059 - Desenho de fundação - tanques de lubrificação OB 500/600N - FORMAS."],
    ["Pendência P1", "Arranjo geral", "CI-6310-001 - Arranjo geral de equipamentos."],
    ["Pendência P2", "Cargas", "CI-6310-004 - Cargas finais de vento e chumbador."]]
 ),
 "validacoes": [
  ["Massa", "Massa total auditada pela lista (kg)", round(MASSA_LISTA, 2), TOTAL_DES,
   round(MASSA_LISTA - TOTAL_DES, 2),
   "Soma das 13 posições da LISTA DE BARRAS. Excede o TOTAL impresso em 57,44 kg, exatamente a "
   "posição N13 ausente do RESUMO GERAL."],
  ["Lista de barras", "TOTAL = QUANT. × UNIT. (N8, N9, N10, N11, N13)", 5, 5, 0,
   "As cinco posições de comprimento fixo fecham exatamente: N8 1088 × 4,65 = 5.059,20 m; "
   "N9 20 × 4,73 = 94,60 m; N10 16 × 5,00 = 80,00 m; N11 32 × 6,00 = 192,00 m; "
   "N13 8 × 4,55 = 36,40 m."],
  ["Multiplicidade 4x", "N8 - quantidade total vs. cota da planta", 1088, 272 * NT, 0,
   "A planta indica 272 N8 c.20 por fundação. 272 × 4 = 1.088, confirmando que a coluna QUANT. da "
   "lista já corresponde ao conjunto das 4 fundações."],
  ["Multiplicidade 4x", "N9 / N10 / N12 / N13 - quantidade vs. cotas dos detalhes", 4, 4, 0,
   "N9 = 5/fundação (20/4); N10 = 4 (16/4); N12 = 2x2 = 4 (16/4); N13 = 2 (8/4). Todas coerentes "
   "com as chamadas da VISTA C-C."],
  ["Multiplicidade 4x", "N11 - quantidade por fundação (un)", 8, 8, 0,
   "32/4 = 8 un por fundação, coerente com os dois conjuntos 'N11-4 Ø20-600 (SUP.)' desenhados na "
   "VISTA C-C."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(77.28 / 16, 2), 1.23,
   round(77.28 / 16 - 1.23, 2),
   "A coluna UNIT. traz 'VAR' e a forma está cotada com perna variável (113 a 133) cm. Contudo, "
   "TOTAL 77,28 m para 16 un implica comprimento médio de 483 cm por barra - próximo dos estribos "
   "N8 (465) e N9 (473) e não da faixa cotada. O RESUMO GERAL adota 77,28 m. CONFIRMAR COM O PROJETISTA."],
  ["Coerência geométrica", "Estribos N8 × desenvolvimento do eixo (m)", round(272 * 0.20, 2),
   DEV_SI, round(272 * 0.20 - DEV_SI, 2),
   "272 estribos a cada 20 cm cobrem 54,40 m, contra 53,94 m de desenvolvimento do eixo do anel. "
   "Distribuição coerente."],
  ["Coerência geométrica", "Desenvolvimentos × raios da prancha de formas (m)", DEV_SI,
   round(2 * math.pi * R_EIXO, 3), round(DEV_SI - 2 * math.pi * R_EIXO, 3),
   "2π × R858,5 = 53,943 m contra os 5394,1 cm cotados na FACE SUPERIOR E INFERIOR. As três "
   "elevações conferem com os raios R826 / R858,5 / R891 do TX3-059, descontado o cobrimento."],
  ["Coerência entre pranchas", "Volume de concreto do anel (m³)", round(VOL_ANEL, 2), VOL_FORMAS,
   round(VOL_ANEL - VOL_FORMAS, 2),
   "Seção 0,65 × 1,50 m × desenvolvimento do eixo, contra o concreto estrutural declarado no "
   "quadro do TX3-059. Confirma a geometria adotada."],
  ["Materiais", "Massas lineares adotadas (kg/m)", 3, 3, 0,
   "Ø8 = 0,395; Ø16 = 1,578; Ø20 = 2,466. Coincidem com os valores nominais da NBR 7480 para aço CA-50."],
  ["Escopo", "Perdas de corte, dobra e emendas", 0, 0, 0,
   "Os quantitativos são os do desenho (comprimentos de projeto). Não há acréscimo de perdas."],
  ["Escopo", "Concreto, formas e terraplenagem", 0, 0, 0,
   "Esta prancha é exclusivamente de ARMADURAS. Concreto, formas, grout, terraplenagem, "
   "impermeabilização e drenagem estão na prancha de formas DE-5400.00-6310-120-TX3-059."],
 ],
 "destaques": [
  ["Comprimento", "Ø8 e Ø20 - lista vs. RESUMO GERAL (m)", round(COMP_LISTA[8] + COMP_LISTA[20], 2),
   round(RESUMO_DES[8][0] + RESUMO_DES[20][0], 2), 0.0,
   "As duas bitolas fecham exatamente com o quadro impresso na prancha."],
  ["DIVERGÊNCIA", "Ø16 - N13 ausente do RESUMO GERAL (m)", COMP_LISTA[16], RESUMO_DES[16][0],
   round(COMP_LISTA[16] - RESUMO_DES[16][0], 2),
   "A lista soma 3.188,40 m de Ø16; o resumo traz 3.152,00 m. Faltam os 36,40 m da posição N13 "
   "(+57,44 kg). A massa total passaria de 14.034 kg para 14.091,15 kg. Confirmar."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(77.28 / 16, 2), 1.23,
   round(77.28 / 16 - 1.23, 2),
   "Forma cotada como (113 a 133) cm, mas o TOTAL de 77,28 m para 16 un implica 483 cm por barra. Confirmar."],
  ["Multiplicidade 4x", "N8 - 272 c/20 por fundação × 4", 1088, 1088, 0,
   "Confirma que as colunas QUANT. e TOTAL da lista já são o conjunto das 4 fundações."],
  ["Coerência entre pranchas", "Volume do anel vs. TX3-059 (m³)", round(VOL_ANEL, 2), VOL_FORMAS,
   round(VOL_ANEL - VOL_FORMAS, 2),
   "Seção 0,65 × 1,50 m × 53,941 m confere com os 52,50 m³ de concreto estrutural da prancha de formas."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar, de forma rastreável, todo o quantitativo de armadura da prancha %s (fundações "
   "anelares dos tanques de lubrificação TQ-6310818 A/B/C/D), com painel gerencial e abas de auditoria." % DOC],
  ["Fonte primária",
   "Quadros LISTA DE BARRAS (4x) e RESUMO GERAL da própria prancha, complementados pelas cotas das "
   "vistas (planta de armadura, cortes A-A e B-B, vista C-C e elevações das faces) e pela geometria "
   "do anel lida na prancha de formas DE-5400.00-6310-120-TX3-059."],
  ["Multiplicidade",
   "A prancha atende 4 fundações idênticas - indicação '4x' no título da planta e da lista de barras. "
   "As colunas QUANT. e TOTAL do desenho já são o somatório das 4 fundações; os valores unitários "
   "são derivados por divisão por 4. A leitura foi confirmada pela cota '272 N8 c.20' da planta "
   "(272 × 4 = 1.088, exatamente a quantidade da lista)."],
  ["Controle crítico",
   "O quadro RESUMO GERAL não incorporou a posição N13 ao total de Ø16: a lista soma 3.188,40 m e o "
   "resumo traz 3.152,00 m. São 36,40 m e 57,44 kg a mais. Por isso a massa auditada é 14.091,15 kg "
   "contra os 14.034 kg impressos. A aba Validações detalha o caso; confirmar com o projetista antes da compra."],
  ["Como usar",
   "Comece pelo Dashboard Executivo. Para auditoria, use Lista de Barras (transcrição integral), "
   "Resumo por Bitola (fechamento contra o quadro do desenho), Resumo por Posição e Quantitativo "
   "Unitário. Geometria e Seções e Parâmetros Técnicos guardam as cotas e o carimbo."],
 ] + LEIAME_BASE,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Quantitativo_Armaduras_%s.xlsx" % DOC)
    r = CA.gerar(SPEC, saida)
    print("gerado: %s" % r["arquivo"])
    print("massa auditada %.2f kg | prancha %d kg | comprimento %.2f m" %
          (r["massa"], TOTAL_DES, r["compr"]))
