# -*- coding: utf-8 -*-
"""DE-5400.00-6310-120-TX3-002 — ARMADURAS das fundações dos TQ-6310816/817 A/B/C/D (8x)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_armaduras as CA
from pranchas_armaduras import (CARIMBO_COMUM, LEIAME_BASE, NOTAS_GERAIS, OBS_CORR_SUPINF,
                                cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 8
DOC = "DE-5400.00-6310-120-TX3-002"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanques de lubrificação "
         "TQ-6310816A/B/C/D & TQ-6310817A/B/C/D - ARMADURAS" % DOC)

# cotas impressas nas elevações (m)
COTA_EXT, COTA_INT_IMPRESSA, COTA_SI_IMPRESSA = 61.556, 59.942, 58.327
# leitura geométrica: a média de externa e interna tem de ser o eixo
DEV_EIXO = (COTA_EXT + COTA_SI_IMPRESSA) / 2      # 59,942 m
R_EIXO = DEV_EIXO / (2 * math.pi)
SEC_B, SEC_H = 0.65, 1.50
VOL_ANEL = SEC_B * SEC_H * DEV_EIXO

BARRAS = [
 (1, 20, 16, "CORR", None, 1142.40, "N1", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 71,40 m de desenvolvimento por barra."),
 (2, 20, 16, "CORR", None, 1206.40, "N2", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 75,40 m de desenvolvimento por barra."),
 (3, 20, 16, "CORR", None, 1206.40, "N3", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 75,40 m de desenvolvimento por barra."),
 (4, 20, 16, "CORR", None, 1206.40, "N4", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 75,40 m de desenvolvimento por barra."),
 (5, 20, 16, "CORR", None, 1209.60, "N5", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 75,60 m de desenvolvimento por barra."),
 (6, 16, 48, "CORR", None, 3427.20, "N6", "Corrida face externa", "CORTE A-A / FACE EXTERNA",
  "6 N6 c/20 na face externa (5 N6 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel."),
 (7, 16, 48, "CORR", None, 3264.00, "N7", "Corrida face interna", "CORTE A-A / FACE INTERNA",
  "6 N7 c/20 na face interna (5 N7 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel."),
 (8, 8, 2384, "465", 465, 11085.60, "N8", "Estribo", "PLANTA / CORTE A-A",
  "298 N8 c/20 por fundação; estribo fechado 55 × 140 cm, C=465 cm (dimensões internas ao "
  "cobrimento de 5 cm da seção de 65 × 150 cm)."),
 (9, 8, 48, "473", 473, 227.04, "N9", "Estribo no rebaixo", "VISTA C-C",
  "6 N9 c/20 por fundação; estribo na região do rebaixo, C=473 cm."),
 (10, 16, 32, "500", 500, 160.00, "N10", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N10-4 Ø16 C=500 cm; disposto 2x2 na região do rebaixo."),
 (11, 20, 32, "600", 600, 192.00, "N11", "Reforço superior do rebaixo", "VISTA C-C / CORTE B-B",
  "N11-4 Ø20 C=600 cm (SUP.), dobra Ri=8 e perna 120 cm; ver Nota 5."),
 (12, 8, 32, "VAR", None, 150.72, "N12", "Estribo de comprimento variável", "VISTA C-C",
  "N12-2x2 Ø8 C=VAR; forma cotada com perna variável (113 a 133) cm."),
 (13, 16, 8, "485", 485, 38.80, "N13", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N13-2 Ø16 C=485 cm na região do rebaixo. A lista traz 8 un (1 por fundação), enquanto o detalhe "
  "chama 2 un — ver aba Validações."),
]

RESUMO_DES = {8: (11463.36, 4528), 16: (6890.00, 10872), 20: (6163.20, 15198)}
TOTAL_DES = 30599
MASSA_LISTA = sum(b[CA.TOT] * CA.KGM[b[CA.BIT]] for b in BARRAS)

SPEC = {
 "nt": NT,
 "barras": BARRAS,
 "resumo_des": RESUMO_DES,
 "total_des": TOTAL_DES,
 "fonte": FONTE,
 "elemento": "Fundação anelar — armadura",
 "tanques": ["TQ-6310816A", "TQ-6310816B", "TQ-6310816C", "TQ-6310816D",
             "TQ-6310817A", "TQ-6310817B", "TQ-6310817C", "TQ-6310817D"],
 "grupos": [
   ("Barras corridas — faces superior e inferior", [1, 2, 3, 4, 5]),
   ("Barras corridas — faces externa e interna", [6, 7]),
   ("Estribos", [8, 9, 12]),
   ("Reforços da região do rebaixo", [10, 11, 13]),
 ],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - ARMADURAS DAS FUNDAÇÕES DOS TQ-6310816/817 A/B/C/D",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6310816A/B/C/D & TQ-6310817A/B/C/D (8x)"
                      "  |  U-6310 - Refino Boaventura  |  Escopo: armadura passiva CA-50" % DOC),
 "cards": cards_padrao,
 "nota_lista": ("Quadro LISTA DE BARRAS (8x) transcrito posição a posição. As colunas QUANT. e TOTAL "
                "do desenho referem-se ao conjunto das 8 fundações; as colunas por fundação são "
                "derivadas por divisão por 8."),
 "nota_unitario": ("A prancha atende 8 fundações idênticas (indicação '8x' na planta e na lista de "
                   "barras). O quantitativo unitário é obtido dividindo os totais por 8."),
 "msg_desvio_compr": {},
 "notas_bitola": [
  "As três bitolas fecham exatamente entre a LISTA DE BARRAS e o quadro RESUMO GERAL.",
  "TOTAL (kg) impresso na prancha = 30.599 kg. O somatório não arredondado é 30.598,90 kg; a soma "
  "das três linhas já arredondadas é 30.598 kg. A diferença é apenas de arredondamento.",
  "A coluna 'Barras de 12 m' é um equivalente de suprimentos (comprimento / 12 m, arredondado para "
  "cima). Não considera perdas de corte, dobra e emendas.",
 ],
 "geometria": [
  ["Vista", "PLANTA - ARMADURA - TQ-6310816 A/B/C/D & TQ-6310817 A/B/C/D (8x)", "1:100", None,
   "PRANCHA", "Planta de armadura do anel de fundação; indicação 298 N8 c.20 e 6 N9 c.20."],
  ["Vista", "CORTE A-A", "1:20", None, "PRANCHA",
   "Seção corrente do anel, com 6 N6 c/20 na face externa e 6 N7 c/20 na face interna."],
  ["Vista", "CORTE B-B", "1:20", None, "PRANCHA",
   "Seção na região do rebaixo, com 5 N6 / 5 N7 c/20, N10, N11, N8 e 2 N13."],
  ["Vista", "VISTA C-C (2x)", "1:25", None, "PRANCHA",
   "Detalhe do rebaixo: N9, N10, N11, N12 e N13."],
  ["Vista", "FACE EXTERNA - ELEVAÇÃO", "S/ESC.", COTA_EXT, "PRANCHA",
   "Desenvolvimento cotado de 6155,6 cm; malha de N5 e N6 com trechos de 160 cm e traspasses de 40 cm."],
  ["Vista", "FACE INTERNA - ELEVAÇÃO", "S/ESC.", COTA_INT_IMPRESSA, "PRANCHA",
   "Cota impressa de 5994,2 cm. Geometricamente este valor corresponde ao eixo do anel, e não à "
   "face interna — ver aba Validações."],
  ["Vista", "FACE SUPERIOR E INFERIOR - PLANTA", "S/ESC.", COTA_SI_IMPRESSA, "PRANCHA",
   "Cota impressa de 5832,7 cm. Geometricamente este valor corresponde à face interna — ver aba "
   "Validações."],
  ["Derivado", "Desenvolvimento do eixo do anel (m)", "-", round(DEV_EIXO, 3), "DERIVADO",
   "Média entre os desenvolvimentos das faces externa (61,556 m) e interna (58,327 m). "
   "Coincide com a cota de 5994,2 cm impressa na prancha."],
  ["Derivado", "Raio do eixo do anel (m)", "-", round(R_EIXO, 3), "DERIVADO",
   "Desenvolvimento do eixo dividido por 2π."],
  ["Derivado", "Raio interno do anel (m)", "-", round(R_EIXO - SEC_B / 2, 3), "DERIVADO",
   "Raio do eixo menos meia largura da seção."],
  ["Derivado", "Raio externo do anel (m)", "-", round(R_EIXO + SEC_B / 2, 3), "DERIVADO",
   "Raio do eixo mais meia largura da seção."],
  ["Seção", "Largura radial da seção (m)", "-", SEC_B, "DERIVADO",
   "A diferença entre os desenvolvimentos das faces externa e interna resulta em 51,4 cm entre as "
   "camadas de armadura; somados os 2 × 6,8 cm de cobrimento e meia bitola, a seção é de 65 cm — "
   "a mesma das pranchas de formas TX3-059 e 6312 TX3-001. A prancha de formas deste conjunto "
   "(DE-5400.00-6310-120-TX3-001) não foi fornecida."],
  ["Seção", "Altura da seção (m)", "-", SEC_H, "DERIVADO",
   "O estribo N8 de 55 × 140 cm mais o cobrimento de 5 cm em cada face resulta em 65 × 150 cm, "
   "seção idêntica à das pranchas de formas fornecidas."],
  ["Espaçamento", "Estribos N8 na seção corrente (m)", "-", 0.20, "PRANCHA",
   "298 N8 c/20 por fundação; 298 × 0,20 = 59,60 m, coerente com o desenvolvimento do eixo (59,94 m)."],
  ["Espaçamento", "Barras horizontais N6 / N7 (m)", "-", 0.20, "PRANCHA",
   "6 N6 c/20 e 6 N7 c/20 no CORTE A-A; 5 + 5 c/20 no CORTE B-B (trecho do rebaixo)."],
  ["Traspasse", "Traspasse típico das barras corridas (m)", "-", 0.40, "PRANCHA",
   "Cotas 40 (TÍP.) e 160 repetidas nas elevações das faces."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO", "0,65 m × 1,50 m."],
  ["Derivado", "Volume de concreto por fundação (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "ESTIMATIVA: área da seção × desenvolvimento do eixo. O mesmo cálculo aplicado ao TQ-6310818 "
   "resulta em 52,59 m³ contra os 52,50 m³ declarados na prancha de formas TX3-059 — diferença de "
   "0,17%, o que valida o método. O valor oficial deve sair da prancha de formas deste conjunto."],
  ["Derivado", "Volume de concreto — 8 fundações (m³)", "-", round(VOL_ANEL * NT, 2), "DERIVADO",
   "ESTIMATIVA — mesma ressalva da linha anterior."],
  ["Derivado", "Taxa de armadura (kg/m³)", "-", round((MASSA_LISTA / NT) / VOL_ANEL, 1), "DERIVADO",
   "Massa de aço por fundação dividida pelo volume estimado. Comparável aos 67,1 kg/m³ do "
   "TQ-6310818 e aos 67,3 kg/m³ do TQ-6312824."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título",
     "Desenho de fundação - tanques de lubrificação TQ-6310816A/B/C/D & TQ-6310817A/B/C/D - ARMADURAS"],
    ["Identificação", "Área", "Parque de tanques de produtos acabados (lubrificantes) - U-6310"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6310-120-TX3-001 - Memória de cálculo de fundação - tanques de lubrificação (U-6310)."],
    ["Documento complementar", "Formas",
     "DE-5400.00-6310-120-TX3-001 - Desenho de fundação - tanques de lubrificação "
     "TQ-6310816A/B/C/D & TQ-6310817A/B/C/D - FORMAS. Não fornecida nesta análise."],
    ["Pendência P1", "Arranjo geral", "CI-6310-001 - Arranjo geral de equipamentos."],
    ["Pendência P2", "Cargas", "CI-6310-004 - Cargas finais de vento e chumbador."]]
 ),
 "validacoes": [
  ["Lista de barras", "TOTAL = QUANT. × UNIT. (N8, N9, N10, N11, N13)", 5, 5, 0,
   "As cinco posições de comprimento fixo fecham exatamente: N8 2384 × 4,65 = 11.085,60 m; "
   "N9 48 × 4,73 = 227,04 m; N10 32 × 5,00 = 160,00 m; N11 32 × 6,00 = 192,00 m; "
   "N13 8 × 4,85 = 38,80 m."],
  ["Multiplicidade 8x", "N8 - quantidade total vs. cota da planta", 2384, 298 * NT, 0,
   "A planta indica 298 N8 c.20 por fundação. 298 × 8 = 2.384, confirmando que a coluna QUANT. da "
   "lista já corresponde ao conjunto das 8 fundações."],
  ["Multiplicidade 8x", "N9 / N10 / N11 / N12 - quantidade vs. cotas dos detalhes", 4, 4, 0,
   "N9 = 6/fundação (48/8); N10 = 4 (32/8); N11 = 4 (32/8); N12 = 2x2 = 4 (32/8). Coerentes com as "
   "chamadas da VISTA C-C."],
  ["DIVERGÊNCIA", "N13 - quantidade por fundação (un)", 1, 2, -1,
   "A LISTA DE BARRAS indica QUANT. 8 (1 un por fundação) e TOTAL 38,80 m, internamente consistente. "
   "Já o detalhe da VISTA C-C / CORTE B-B chama 'N13-2 Ø16-485' e '2N13', ou seja, 2 un por fundação "
   "(16 no total). A prancha irmã TX3-060, de mesma família, traz N13 com 8 un para 4 fundações "
   "(2 por fundação), o que reforça a leitura do detalhe. Se prevalecer o detalhe, acrescem 8 barras, "
   "38,80 m e 61,23 kg de Ø16 (+0,20% da massa total). CONFIRMAR COM O PROJETISTA."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(150.72 / 32, 2), 1.23,
   round(150.72 / 32 - 1.23, 2),
   "A coluna UNIT. traz 'VAR' e a forma está cotada com perna variável (113 a 133) cm. Contudo, "
   "TOTAL 150,72 m para 32 un implica comprimento médio de 471 cm por barra - próximo dos estribos "
   "N8 (465) e N9 (473) e não da faixa cotada. O mesmo padrão aparece nas outras duas pranchas de "
   "armadura da série (483 cm em ambas). CONFIRMAR COM O PROJETISTA."],
  ["DIVERGÊNCIA", "Cotas das elevações FACE INTERNA e FACE SUP./INF. (m)", COTA_INT_IMPRESSA,
   COTA_SI_IMPRESSA, round(COTA_INT_IMPRESSA - COTA_SI_IMPRESSA, 3),
   "A cota do eixo do anel tem de ser a média das cotas das faces externa e interna. Aqui, "
   "(61,556 + 58,327)/2 = 59,942 m — exatamente o valor impresso na FACE INTERNA - ELEVAÇÃO, e não "
   "na FACE SUPERIOR E INFERIOR - PLANTA, que é a vista desenvolvida no eixo. Nas pranchas irmãs "
   "TX3-060 e 6312 TX3-002 a convenção é a inversa e fecha corretamente. Os dois valores parecem "
   "trocados entre as vistas. Não altera o quantitativo de aço; afeta a leitura da geometria."],
  ["Coerência geométrica", "Estribos N8 × desenvolvimento do eixo (m)", round(298 * 0.20, 2),
   round(DEV_EIXO, 2), round(298 * 0.20 - DEV_EIXO, 2),
   "298 estribos a cada 20 cm cobrem 59,60 m, contra 59,94 m de desenvolvimento do eixo. "
   "Distribuição coerente."],
  ["Coerência entre pranchas", "Seção do anel (m)", 0.65, 0.65, 0,
   "A diferença entre as cotas das faces externa e interna (61,556 - 58,327 = 3,229 m) corresponde "
   "a 51,4 cm de afastamento radial entre as camadas de armadura; somado o cobrimento, resulta em "
   "65 cm — exatamente a seção das pranchas de formas TX3-059 e 6312 TX3-001. Atenção: o 55 × 140 cm "
   "do CORTE A-A é a dimensão do ESTRIBO, não da seção de concreto."],
  ["Materiais", "Massas lineares adotadas (kg/m)", 3, 3, 0,
   "Ø8 = 0,395; Ø16 = 1,578; Ø20 = 2,466. Coincidem com os valores nominais da NBR 7480 para aço CA-50."],
  ["Escopo", "Perdas de corte, dobra e emendas", 0, 0, 0,
   "Os quantitativos são os do desenho (comprimentos de projeto). Não há acréscimo de perdas."],
  ["Escopo", "Concreto, formas e terraplenagem", 0, 0, 0,
   "Esta prancha é exclusivamente de ARMADURAS. O volume de concreto informado na aba Geometria é "
   "ESTIMATIVA: a prancha de formas deste conjunto (DE-5400.00-6310-120-TX3-001) não foi fornecida."],
 ],
 "destaques": [
  ["Comprimento", "Somatório da lista vs. RESUMO GERAL (m)", 24516.56, 24516.56, 0.0,
   "As três bitolas fecham exatamente com o quadro impresso na prancha."],
  ["Massa", "Massa total de aço (kg)", round(MASSA_LISTA, 2), TOTAL_DES,
   round(MASSA_LISTA - TOTAL_DES, 2), "Diferença apenas de arredondamento do TOTAL (kg) impresso."],
  ["DIVERGÊNCIA", "N13 - quantidade por fundação (un)", 1, 2, -1,
   "Lista traz 8 un (1/fundação); o detalhe chama 'N13-2' (2/fundação), leitura reforçada pela "
   "prancha irmã TX3-060. Se prevalecer: +8 un, +38,80 m, +61,23 kg. Confirmar."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(150.72 / 32, 2), 1.23,
   round(150.72 / 32 - 1.23, 2),
   "Forma cotada como (113 a 133) cm, mas o TOTAL de 150,72 m para 32 un implica 471 cm por barra. Confirmar."],
  ["DIVERGÊNCIA", "Cotas FACE INTERNA vs. FACE SUP./INF. (m)", COTA_INT_IMPRESSA, COTA_SI_IMPRESSA,
   round(COTA_INT_IMPRESSA - COTA_SI_IMPRESSA, 3),
   "A média de externa e interna tem de dar o eixo: (61,556+58,327)/2 = 59,942, valor impresso na "
   "FACE INTERNA. Os dois desenvolvimentos parecem trocados entre as vistas. Não afeta o aço."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar, de forma rastreável, todo o quantitativo de armadura da prancha %s (fundações "
   "anelares dos tanques de lubrificação TQ-6310816A/B/C/D e TQ-6310817A/B/C/D), com painel "
   "gerencial e abas de auditoria." % DOC],
  ["Fonte primária",
   "Quadros LISTA DE BARRAS (8x) e RESUMO GERAL da própria prancha, complementados pelas cotas das "
   "vistas (planta de armadura, cortes A-A e B-B, vista C-C e elevações das faces)."],
  ["Multiplicidade",
   "A prancha atende 8 fundações idênticas - indicação '8x' no título da planta e da lista de barras. "
   "As colunas QUANT. e TOTAL do desenho já são o somatório das 8 fundações. A leitura foi "
   "confirmada pela cota '298 N8 c.20' da planta (298 × 8 = 2.384, exatamente a quantidade da lista)."],
  ["Seção do anel",
   "A seção de concreto é de 65 × 150 cm. O 55 × 140 cm que aparece no CORTE A-A é a dimensão do "
   "ESTRIBO N8, medida dentro do cobrimento de 5 cm. A leitura foi confirmada pelas pranchas de "
   "formas TX3-059 e 6312 TX3-001, que cotam 65 × 150 cm, e pelo afastamento radial entre as "
   "camadas de armadura desta prancha."],
  ["Volume de concreto",
   "A prancha de formas deste conjunto (DE-5400.00-6310-120-TX3-001) não foi fornecida, de modo que "
   "o volume de concreto na aba Geometria e Seções é ESTIMATIVA. O método foi validado no TQ-6310818: "
   "seção × desenvolvimento do eixo resulta em 52,59 m³ contra os 52,50 m³ declarados na prancha de "
   "formas TX3-059 (0,17% de diferença)."],
  ["Controle crítico",
   "Três divergências do próprio desenho estão destacadas na aba Validações: (1) N13 - a lista traz "
   "8 un (1/fundação) enquanto o detalhe chama 2, leitura reforçada pela prancha irmã TX3-060 "
   "(+61,23 kg); (2) N12 - forma cotada em (113 a 133) cm, mas o total implica 471 cm por barra; "
   "(3) as cotas de desenvolvimento das vistas FACE INTERNA e FACE SUPERIOR E INFERIOR parecem "
   "trocadas entre si. Confirmar com o projetista antes da compra."],
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
    print("massa %.2f kg | prancha %d kg | comprimento %.2f m | volume estimado %.2f m3"
          % (r["massa"], TOTAL_DES, r["compr"], VOL_ANEL * NT))
