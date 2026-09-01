# -*- coding: utf-8 -*-
"""DE-5400.00-6312-120-TX3-002 — ARMADURAS da fundação do TQ-6312824 (tanque de UCO)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_armaduras as CA
from pranchas_armaduras import (CARIMBO_COMUM, LEIAME_BASE, NOTAS_GERAIS, OBS_CORR_SUPINF,
                                cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 1
DOC = "DE-5400.00-6312-120-TX3-002"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanque de UCO "
         "TQ-6312824 - ARMADURAS" % DOC)

DEV_EXT, DEV_SI, DEV_INT = 91.500, 89.850, 88.235
R_INT, R_EIXO, R_EXT = 13.975, 14.30, 14.625
SEC_B, SEC_H = 0.65, 1.50
VOL_ANEL = SEC_B * SEC_H * DEV_SI      # 87,60 m³ (apenas o anel)
VOL_FORMAS = 114.00                     # concreto estrutural declarado no 6312 TX3-001

BARRAS = [
 (1, 20, 2, "CORR", None, 214.20, "N1", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un (1 sup. + 1 inf.); 107,10 m de desenvolvimento por barra."),
 (2, 20, 2, "CORR", None, 222.20, "N2", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un (1 sup. + 1 inf.); 111,10 m de desenvolvimento por barra."),
 (3, 20, 2, "CORR", None, 222.20, "N3", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un (1 sup. + 1 inf.); 111,10 m de desenvolvimento por barra."),
 (4, 20, 2, "CORR", None, 222.20, "N4", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un (1 sup. + 1 inf.); 111,10 m de desenvolvimento por barra."),
 (5, 20, 2, "CORR", None, 223.00, "N5", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un (1 sup. + 1 inf.); 111,50 m de desenvolvimento por barra."),
 (6, 20, 7, "CORR", None, 780.50, "N6", "Corrida face externa", "CORTE A-A / FACE EXTERNA",
  "Barra corrida (CORR) na face externa; 111,50 m por barra. O CORTE A-A chama 6 N6 c/20 (e o "
  "CORTE B-B, 5 N6 c/20), mas a LISTA DE BARRAS traz QUANT. 7 — ver aba Validações."),
 (7, 20, 7, "CORR", None, 749.70, "N7", "Corrida face interna", "CORTE A-A / FACE INTERNA",
  "Barra corrida (CORR) na face interna; 107,10 m por barra. O CORTE A-A chama 6 N7 c/20 (e o "
  "CORTE B-B, 5 N7 c/20), mas a LISTA DE BARRAS traz QUANT. 7 — ver aba Validações."),
 (8, 8, 442, "465", 465, 2055.30, "N8", "Estribo", "PLANTA / CORTE A-A",
  "N8-2x221 Ø8 C=465: a planta indica 221 N8 c/20 em cada metade do anel, totalizando 442 un. "
  "Estribo fechado 55 × 140 cm (dimensões internas ao cobrimento de 5 cm da seção de 65 × 150 cm)."),
 (9, 8, 12, "473", 473, 56.76, "N9", "Estribo no rebaixo", "VISTA C-C",
  "6 N9 c/20 em cada um dos dois rebaixos (VISTA C-C 2x), totalizando 12 un; C=473 cm."),
 (10, 16, 8, "500", 500, 40.00, "N10", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N10-4 Ø16 C=500 cm, disposto 2x2, em cada um dos dois rebaixos: 4 × 2 = 8 un."),
 (11, 20, 16, "600", 600, 96.00, "N11", "Reforço superior do rebaixo", "VISTA C-C / CORTE B-B",
  "N11-4 Ø20 C=600 cm (SUP.), dobra Ri=8 e perna 120 cm; dois conjuntos de 4 un por rebaixo, "
  "em dois rebaixos: 16 un. Ver Nota 5."),
 (12, 8, 8, "VAR", None, 38.64, "N12", "Estribo de comprimento variável", "VISTA C-C",
  "N12-2x2 Ø8 C=VAR em cada um dos dois rebaixos: 4 × 2 = 8 un; forma cotada com perna variável "
  "(113 a 133) cm."),
 (13, 16, 4, "500", 500, 20.00, "N13", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "2 un por rebaixo, em dois rebaixos: 4 un. A chamada do detalhe traz 'N13-2 Ø16-485' (C=485 cm), "
  "mas a coluna UNIT. da lista traz 500 cm — ver aba Validações."),
]

RESUMO_DES = {8: (2150.70, 850), 16: (60.00, 95), 20: (2730.00, 6732)}
TOTAL_DES = 7676

MASSA_LISTA = sum(b[CA.TOT] * CA.KGM[b[CA.BIT]] for b in BARRAS)
# impacto se N6/N7 fossem 6 un, como chama o CORTE A-A
DELTA_N67 = (780.50 / 7 + 749.70 / 7) * CA.KGM[20]

SPEC = {
 "nt": NT,
 "barras": BARRAS,
 "resumo_des": RESUMO_DES,
 "total_des": TOTAL_DES,
 "fonte": FONTE,
 "elemento": "Fundação anelar — armadura",
 "tanques": ["TQ-6312824"],
 "grupos": [
   ("Barras corridas — faces superior e inferior", [1, 2, 3, 4, 5]),
   ("Barras corridas — faces externa e interna", [6, 7]),
   ("Estribos", [8, 9, 12]),
   ("Reforços da região do rebaixo", [10, 11, 13]),
 ],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - ARMADURAS DA FUNDAÇÃO DO TQ-6312824 (TANQUE DE UCO)",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6312824 - tanque de UCO  |  "
                      "U-6312 - Refino Boaventura  |  Escopo: armadura passiva CA-50" % DOC),
 "cards": cards_padrao,
 "nota_lista": ("Quadro LISTA DE BARRAS transcrito posição a posição. A prancha atende uma única "
                "fundação, de modo que as colunas 'por fundação' repetem os totais do desenho."),
 "nota_unitario": ("A prancha atende uma única fundação (TQ-6312824). Os valores desta aba são, "
                   "portanto, iguais aos totais do quadro da prancha."),
 "msg_desvio_compr": {},
 "notas_bitola": [
  "As três bitolas fecham exatamente entre a LISTA DE BARRAS e o quadro RESUMO GERAL.",
  "TOTAL (kg) impresso na prancha = 7.676 kg. O somatório não arredondado é 7.676,39 kg; a soma das "
  "três linhas já arredondadas é 7.677 kg. A diferença é apenas de arredondamento.",
  "Nesta fundação as barras corridas das faces (N6 e N7) são Ø20, e não Ø16 como nas fundações dos "
  "tanques de lubrificação. O Ø16 aparece apenas nos reforços N10 e N13, com 60,00 m no total.",
  "A coluna 'Barras de 12 m' é um equivalente de suprimentos (comprimento / 12 m, arredondado para "
  "cima). Não considera perdas de corte, dobra e emendas.",
 ],
 "geometria": [
  ["Vista", "PLANTA - ARMADURA - TQ-6312824", "1:150", None, "PRANCHA",
   "Planta de armadura do anel; indicação 221 N8 c.20 em cada metade e 6 N9 c.20 em cada rebaixo."],
  ["Vista", "CORTE A-A", "1:20", None, "PRANCHA",
   "Seção corrente do anel, com 6 N6 c/20 na face externa e 6 N7 c/20 na face interna."],
  ["Vista", "CORTE B-B (2x)", "1:20", None, "PRANCHA",
   "Seção na região do rebaixo, com 5 N6 / 5 N7 c/20, N10, N11, N8 e 2 N13."],
  ["Vista", "VISTA C-C (2x)", "1:25", None, "PRANCHA",
   "Detalhe do rebaixo: N9, N10, N11, N12 e N13. A indicação (2x) confirma os dois rebaixos."],
  ["Vista", "FACE EXTERNA - ELEVAÇÃO", "S/ESC.", DEV_EXT, "PRANCHA",
   "Desenvolvimento cotado de 9150 cm; malha de N5 e N6 com trechos de 200 cm e traspasses de 40 cm."],
  ["Vista", "FACE INTERNA - ELEVAÇÃO", "S/ESC.", DEV_INT, "PRANCHA",
   "Desenvolvimento cotado de 8823,5 cm; malha de N1 e N7."],
  ["Vista", "FACE SUPERIOR E INFERIOR - PLANTA", "S/ESC.", DEV_SI, "PRANCHA",
   "Desenvolvimento cotado de 8985 cm; malha de N1 a N5. Corresponde ao eixo do anel."],
  ["Anel (6312 TX3-001)", "Raio interno do anel (m)", "-", R_INT, "PRANCHA TX3-001",
   "R1397,5 cm na planta de formas; diâmetro interno cotado de 2795 cm."],
  ["Anel (6312 TX3-001)", "Raio do eixo do anel (m)", "-", R_EIXO, "PRANCHA TX3-001", "R1430 cm."],
  ["Anel (6312 TX3-001)", "Raio externo do anel (m)", "-", R_EXT, "PRANCHA TX3-001", "R1462,5 cm."],
  ["Anel (6312 TX3-001)", "Largura radial da seção (m)", "-", SEC_B, "PRANCHA TX3-001",
   "Cota 65 cm no DETALHE 1 (R1462,5 - R1397,5 = 65 cm)."],
  ["Anel (6312 TX3-001)", "Altura da seção (m)", "-", SEC_H, "PRANCHA TX3-001",
   "Cota 150 cm no DETALHE 1. O estribo N8 de 55 × 140 cm resulta do cobrimento de 5 cm."],
  ["Espaçamento", "Estribos N8 na seção corrente (m)", "-", 0.20, "PRANCHA",
   "442 N8 c/20; 442 × 0,20 = 88,40 m, coerente com o desenvolvimento do eixo (89,85 m)."],
  ["Espaçamento", "Barras horizontais N6 / N7 (m)", "-", 0.20, "PRANCHA",
   "6 N6 c/20 e 6 N7 c/20 no CORTE A-A; 5 + 5 c/20 no CORTE B-B (trecho do rebaixo)."],
  ["Traspasse", "Traspasse típico das barras corridas (m)", "-", 0.40, "PRANCHA",
   "Cotas 40 (TÍP.) e 200 repetidas nas elevações das faces."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO",
   "0,65 m × 1,50 m, conforme o DETALHE 1 da prancha de formas 6312 TX3-001."],
  ["Derivado", "Volume do anel corrente (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "Área da seção × desenvolvimento do eixo (89,85 m). Cobre apenas o anel corrente."],
  ["Prancha 6312 TX3-001", "Concreto estrutural (m³)", "-", VOL_FORMAS, "PRANCHA TX3-001",
   "Valor oficial do quadro QUANTITATIVO TOTAL da prancha de formas. Supera o anel corrente em "
   "26,40 m³, diferença atribuível aos rebaixos e demais elementos não cobertos pela seção corrente."],
  ["Derivado", "Taxa de armadura (kg/m³)", "-", round(MASSA_LISTA / VOL_FORMAS, 1), "DERIVADO",
   "Massa de aço dividida pelo concreto estrutural do 6312 TX3-001. Comparável às taxas das "
   "fundações dos tanques de lubrificação."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título", "Desenho de fundação - tanque de UCO TQ-6312824 - ARMADURAS"],
    ["Identificação", "Área",
     "Parque de tanques de produtos intermediários (lubrificantes) - U-6312"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6312-120-TX3-004 - Memória de cálculo de fundação - tanque de UCO."],
    ["Documento complementar", "Formas",
     "DE-5400.00-6312-120-TX3-001 - Desenho de fundação - tanque de UCO - TQ-6312824 - FORMAS."],
    ["Pendência P1", "Cargas", "CI-6312-001 - Cargas de vento e chumbadores."],
    ["Pendência P2", "Arranjo geral", "CI-6312-003 - Emissão do arranjo geral de equipamentos."]]
 ),
 "validacoes": [
  ["Lista de barras", "TOTAL = QUANT. × UNIT. (N8, N9, N10, N11, N13)", 5, 5, 0,
   "As cinco posições de comprimento fixo fecham exatamente: N8 442 × 4,65 = 2.055,30 m; "
   "N9 12 × 4,73 = 56,76 m; N10 8 × 5,00 = 40,00 m; N11 16 × 6,00 = 96,00 m; N13 4 × 5,00 = 20,00 m."],
  ["Multiplicidade", "N8 - quantidade vs. cota da planta", 442, 442, 0,
   "A planta indica 221 N8 c.20 em cada metade do anel e a forma traz 'N8-2x221'. 2 × 221 = 442, "
   "exatamente a quantidade da lista."],
  ["Multiplicidade", "Rebaixos - VISTA C-C (2x) e CORTE B-B (2x)", 2, 2, 0,
   "As quantidades de N9 (12 = 6 × 2), N10 (8 = 4 × 2), N11 (16 = 8 × 2), N12 (8 = 4 × 2) e "
   "N13 (4 = 2 × 2) são todas coerentes com dois rebaixos."],
  ["DIVERGÊNCIA", "N6 / N7 - quantidade por face (un)", 7, 6, 1,
   "O CORTE A-A chama '6 N6 c/20' e '6 N7 c/20' (e o CORTE B-B, 5 e 5), mas a LISTA DE BARRAS traz "
   "QUANT. 7 para ambas. A lista é internamente consistente (780,50/7 = 111,50 m e 749,70/7 = "
   "107,10 m, exatos) e é ela que alimenta o RESUMO GERAL. Se prevalecerem as 6 un do corte, saem "
   "218,60 m de Ø20, ou %.2f kg (-7,0%% da massa total). CONFIRMAR COM O PROJETISTA." % DELTA_N67],
  ["DIVERGÊNCIA", "N13 - comprimento unitário (cm)", 500, 485, 15,
   "A chamada do detalhe traz 'N13-2 Ø16-485' (C=485 cm), mas a coluna UNIT. da lista traz 500 cm. "
   "A lista é consistente com seu próprio TOTAL (4 × 5,00 = 20,00 m) e com o RESUMO GERAL. Adotando "
   "485 cm, o total cairia para 19,40 m (-0,95 kg). CONFIRMAR COM O PROJETISTA."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(38.64 / 8, 2), 1.23,
   round(38.64 / 8 - 1.23, 2),
   "A coluna UNIT. traz 'VAR' e a forma está cotada com perna variável (113 a 133) cm. Contudo, "
   "TOTAL 38,64 m para 8 un implica comprimento médio de 483 cm por barra - próximo dos estribos "
   "N8 (465) e N9 (473) e não da faixa cotada. CONFIRMAR COM O PROJETISTA."],
  ["Coerência geométrica", "Estribos N8 × desenvolvimento do eixo (m)", round(442 * 0.20, 2),
   DEV_SI, round(442 * 0.20 - DEV_SI, 2),
   "442 estribos a cada 20 cm cobrem 88,40 m, contra 89,85 m de desenvolvimento do eixo. "
   "Distribuição coerente."],
  ["Coerência geométrica", "Desenvolvimento do eixo × raio da prancha de formas (m)", DEV_SI,
   round(2 * math.pi * R_EIXO, 3), round(DEV_SI - 2 * math.pi * R_EIXO, 3),
   "2π × R1430 = 89,847 m contra os 8985 cm cotados na FACE SUPERIOR E INFERIOR. As três elevações "
   "conferem com os raios R1397,5 / R1430 / R1462,5 do 6312 TX3-001, descontado o cobrimento."],
  ["Coerência entre pranchas", "Anel corrente vs. concreto do 6312 TX3-001 (m³)",
   round(VOL_ANEL, 2), VOL_FORMAS, round(VOL_ANEL - VOL_FORMAS, 2),
   "A seção corrente 0,65 × 1,50 m ao longo do eixo resulta em 87,60 m³, contra os 114,00 m³ "
   "declarados. A diferença de 26,40 m³ corresponde aos rebaixos e demais elementos fora da seção "
   "corrente. Verificação informativa, não uma divergência."],
  ["Materiais", "Massas lineares adotadas (kg/m)", 3, 3, 0,
   "Ø8 = 0,395; Ø16 = 1,578; Ø20 = 2,466. Coincidem com os valores nominais da NBR 7480 para aço CA-50."],
  ["Escopo", "Perdas de corte, dobra e emendas", 0, 0, 0,
   "Os quantitativos são os do desenho (comprimentos de projeto). Não há acréscimo de perdas."],
  ["Escopo", "Concreto, formas e terraplenagem", 0, 0, 0,
   "Esta prancha é exclusivamente de ARMADURAS. Concreto, formas, grout, terraplenagem, "
   "impermeabilização e drenagem estão na prancha de formas DE-5400.00-6312-120-TX3-001."],
 ],
 "destaques": [
  ["Comprimento", "Somatório da lista vs. RESUMO GERAL (m)", 4940.70, 4940.70, 0.0,
   "As três bitolas fecham exatamente com o quadro impresso na prancha."],
  ["Massa", "Massa total de aço (kg)", round(MASSA_LISTA, 2), TOTAL_DES,
   round(MASSA_LISTA - TOTAL_DES, 2), "Diferença apenas de arredondamento do TOTAL (kg) impresso."],
  ["DIVERGÊNCIA", "N6 / N7 - quantidade por face (un)", 7, 6, 1,
   "O CORTE A-A chama 6 c/20; a lista traz 7. Se prevalecer o corte, saem 218,60 m de Ø20 "
   "(-539,07 kg, -7,0% da massa). Confirmar."],
  ["DIVERGÊNCIA", "N13 - comprimento unitário (cm)", 500, 485, 15,
   "Detalhe chama C=485 cm; a coluna UNIT. da lista traz 500 cm. Impacto de -0,95 kg. Confirmar."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(38.64 / 8, 2), 1.23,
   round(38.64 / 8 - 1.23, 2),
   "Forma cotada como (113 a 133) cm, mas o TOTAL de 38,64 m para 8 un implica 483 cm por barra. Confirmar."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar, de forma rastreável, todo o quantitativo de armadura da prancha %s (fundação "
   "anelar do tanque de UCO TQ-6312824), com painel gerencial e abas de auditoria." % DOC],
  ["Fonte primária",
   "Quadros LISTA DE BARRAS e RESUMO GERAL da própria prancha, complementados pelas cotas das vistas "
   "(planta de armadura, cortes A-A e B-B, vista C-C e elevações das faces) e pela geometria do anel "
   "lida na prancha de formas DE-5400.00-6312-120-TX3-001."],
  ["Fundação única",
   "Diferente das pranchas dos tanques de lubrificação, esta atende uma única fundação: a lista de "
   "barras não traz multiplicador. As quantidades dos rebaixos, porém, já consideram os dois "
   "rebaixos indicados por 'VISTA C-C (2x)' e 'CORTE B-B (2x)'."],
  ["Controle crítico",
   "Três divergências do próprio desenho estão destacadas na aba Validações: (1) N6/N7 - o corte "
   "chama 6 c/20 e a lista traz 7, com impacto de 7,0% da massa; (2) N13 - o detalhe chama C=485 cm "
   "e a lista traz 500 cm; (3) N12 - forma cotada em (113 a 133) cm, mas o total implica 483 cm por "
   "barra. Confirmar com o projetista antes da compra."],
  ["Como usar",
   "Comece pelo Dashboard Executivo. Para auditoria, use Lista de Barras (transcrição integral), "
   "Resumo por Bitola, Resumo por Posição e Quantitativo Unitário. Geometria e Seções e Parâmetros "
   "Técnicos guardam as cotas e o carimbo."],
 ] + LEIAME_BASE,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Quantitativo_Armaduras_%s.xlsx" % DOC)
    r = CA.gerar(SPEC, saida)
    print("gerado: %s" % r["arquivo"])
    print("massa %.2f kg | prancha %d kg | comprimento %.2f m" % (r["massa"], TOTAL_DES, r["compr"]))
