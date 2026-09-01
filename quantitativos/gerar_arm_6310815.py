# -*- coding: utf-8 -*-
"""DE-5400.00-6310-120-TX3-057 — ARMADURAS das fundações dos TQ-6310815 A/B/C/D (4x)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_armaduras as CA
from pranchas_armaduras import (CARIMBO_COMUM, LEIAME_BASE, NOTAS_GERAIS, OBS_CORR_SUPINF,
                                cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 4
DOC = "DE-5400.00-6310-120-TX3-057"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanques de lubrificação "
         "TQ-6310815 A/B/C/D - ARMADURAS" % DOC)

DEV_EXT, DEV_SI, DEV_INT = 42.782, 41.940, 41.098
R_EIXO = DEV_SI / (2 * math.pi)
SEC_B, SEC_H = 0.40, 1.50
VOL_ANEL = SEC_B * SEC_H * DEV_SI

BARRAS = [
 (1, 16, 8, "CORR", None, 380.80, "N1", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 47,60 m de desenvolvimento por barra."),
 (2, 16, 8, "CORR", None, 406.40, "N2", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 50,80 m de desenvolvimento por barra."),
 (3, 16, 8, "CORR", None, 406.40, "N3", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 50,80 m de desenvolvimento por barra."),
 (4, 16, 8, "CORR", None, 406.40, "N4", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 50,80 m de desenvolvimento por barra."),
 (5, 16, 8, "CORR", None, 406.40, "N5", "Corrida face sup./inf.", "CORTE A-A / FACE SUP. E INF.",
  OBS_CORR_SUPINF + " 2 un por fundação (1 sup. + 1 inf.); 50,80 m de desenvolvimento por barra."),
 (6, 12.5, 24, "CORR", None, 1142.40, "N6", "Corrida face externa", "CORTE A-A / FACE EXTERNA",
  "6 N6 c/20 na face externa (5 N6 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel. Nesta fundação as barras das faces são Ø12,5."),
 (7, 12.5, 24, "CORR", None, 1101.60, "N7", "Corrida face interna", "CORTE A-A / FACE INTERNA",
  "6 N7 c/20 na face interna (5 N7 c/20 no trecho do rebaixo, CORTE B-B); barra corrida ao longo "
  "do desenvolvimento do anel. Nesta fundação as barras das faces são Ø12,5."),
 (8, 8, 836, "390", 390, 3260.40, "N8", "Estribo", "PLANTA / CORTE A-A",
  "209 N8 c/20 por fundação; estribo fechado 30 × 140 cm, C=390 cm (dimensões internas ao "
  "cobrimento de 5 cm da seção de 40 × 150 cm)."),
 (9, 8, 20, "411", 411, 82.20, "N9", "Estribo no rebaixo", "VISTA C-C",
  "5 N9 c/20 por fundação; estribo na região do rebaixo para fixação da porta de limpeza, C=411 cm."),
 (10, 16, 16, "500", 500, 80.00, "N10", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N10-4 Ø16 C=500 cm; disposto 2x2 na região do rebaixo."),
 (11, 16, 32, "595", 595, 190.40, "N11", "Reforço superior do rebaixo", "VISTA C-C / CORTE B-B",
  "N11-4 Ø16 C=595 cm (SUP.), dobra Ri=4 e perna 121 cm; a VISTA C-C traz dois conjuntos de 4 un, "
  "totalizando 8 un por fundação. Ver Nota 5."),
 (12, 8, 16, "VAR", None, 67.36, "N12", "Estribo de comprimento variável", "VISTA C-C",
  "N12-2x2 Ø8 C=VAR; forma cotada com perna variável (113 a 133) cm."),
 (13, 16, 8, "455", 455, 36.40, "N13", "Reforço do rebaixo", "VISTA C-C / CORTE B-B",
  "N13-2 Ø16 C=455 cm na região do rebaixo; 2 un por fundação, coerente com a chamada do detalhe."),
]

RESUMO_DES = {8: (3409.96, 1347), 12.5: (2244.00, 2161), 16: (2313.20, 3650)}
TOTAL_DES = 7158
MASSA_LISTA = sum(b[CA.TOT] * CA.KGM[b[CA.BIT]] for b in BARRAS)

SPEC = {
 "nt": NT,
 "barras": BARRAS,
 "resumo_des": RESUMO_DES,
 "total_des": TOTAL_DES,
 "fonte": FONTE,
 "elemento": "Fundação anelar — armadura",
 "tanques": ["TQ-6310815A", "TQ-6310815B", "TQ-6310815C", "TQ-6310815D"],
 "grupos": [
   ("Barras corridas — faces superior e inferior", [1, 2, 3, 4, 5]),
   ("Barras corridas — faces externa e interna", [6, 7]),
   ("Estribos", [8, 9, 12]),
   ("Reforços da região do rebaixo", [10, 11, 13]),
 ],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - ARMADURAS DAS FUNDAÇÕES DOS TQ-6310815 A/B/C/D",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6310815 A/B/C/D (4x)  |  "
                      "U-6310 - Refino Boaventura  |  Escopo: armadura passiva CA-50" % DOC),
 "cards": cards_padrao,
 "nota_lista": ("Quadro LISTA DE BARRAS (4x) transcrito posição a posição. As colunas QUANT. e TOTAL "
                "do desenho referem-se ao conjunto das 4 fundações; as colunas por fundação são "
                "derivadas por divisão por 4."),
 "nota_unitario": ("A prancha atende 4 fundações idênticas (indicação '4x' na planta e na lista de "
                   "barras). O quantitativo unitário é obtido dividindo os totais por 4."),
 "msg_desvio_compr": {},
 "notas_bitola": [
  "As três bitolas fecham exatamente entre a LISTA DE BARRAS e o quadro RESUMO GERAL.",
  "TOTAL (kg) impresso na prancha = 7.158 kg. O somatório não arredondado é 7.158,14 kg. A "
  "diferença é apenas de arredondamento.",
  "Esta é a única prancha da série que emprega Ø12,5: as barras corridas das faces (N6 e N7) são "
  "Ø12,5, e não Ø16 ou Ø20 como nas fundações maiores. O Ø16 aparece nas barras de topo e fundo "
  "(N1 a N5) e nos reforços do rebaixo (N10, N11 e N13).",
  "A coluna 'Barras de 12 m' é um equivalente de suprimentos (comprimento / 12 m, arredondado para "
  "cima). Não considera perdas de corte, dobra e emendas.",
 ],
 "geometria": [
  ["Vista", "PLANTA - ARMADURA - TQ-6310815 A/B/C/D (4x)", "1:75", None, "PRANCHA",
   "Planta de armadura do anel de fundação; indicação 209 N8 c.20 e 5 N9 c.20. A planta mostra um "
   "único rebaixo por fundação."],
  ["Vista", "CORTE A-A", "1:20", None, "PRANCHA",
   "Seção corrente do anel, com 6 N6 c/20 na face externa e 6 N7 c/20 na face interna."],
  ["Vista", "CORTE B-B (2x)", "1:20", None, "PRANCHA",
   "Seção na região do rebaixo, com 5 N6 / 5 N7 c/20, N10, N11, N8 e 2 N13. A indicação (2x) "
   "corresponde às duas posições de corte que delimitam o rebaixo único, e não a dois rebaixos — "
   "ver aba Validações."],
  ["Vista", "VISTA C-C", "1:25", None, "PRANCHA",
   "Detalhe do rebaixo para fixação da porta de limpeza: N9, N10, N11, N12 e N13."],
  ["Vista", "FACE EXTERNA - ELEVAÇÃO", "S/ESC.", DEV_EXT, "PRANCHA",
   "Desenvolvimento cotado de 4278,2 cm; malha de N5 e N6 com trechos de 120 e 160 cm e "
   "traspasses de 40 cm."],
  ["Vista", "FACE INTERNA - ELEVAÇÃO", "S/ESC.", DEV_INT, "PRANCHA",
   "Desenvolvimento cotado de 4109,8 cm; malha de N1 e N7."],
  ["Vista", "FACE SUPERIOR E INFERIOR - PLANTA", "S/ESC.", DEV_SI, "PRANCHA",
   "Desenvolvimento cotado de 4194 cm; malha de N1 a N5. Corresponde ao eixo do anel."],
  ["Derivado", "Raio do eixo do anel (m)", "-", round(R_EIXO, 3), "DERIVADO",
   "Desenvolvimento do eixo (41,940 m) dividido por 2π."],
  ["Derivado", "Raio interno do anel (m)", "-", round(R_EIXO - SEC_B / 2, 3), "DERIVADO",
   "Raio do eixo menos meia largura da seção."],
  ["Derivado", "Raio externo do anel (m)", "-", round(R_EIXO + SEC_B / 2, 3), "DERIVADO",
   "Raio do eixo mais meia largura da seção."],
  ["Seção", "Largura radial da seção (m)", "-", SEC_B, "DERIVADO",
   "O estribo N8 mede 30 × 140 cm; somado o cobrimento de 5 cm em cada face, a seção de concreto é "
   "de 40 × 150 cm. A prancha de formas deste conjunto (DE-5400.00-6310-120-TX3-056) não foi "
   "fornecida. Confirmação independente: a diferença entre os desenvolvimentos das faces externa e "
   "interna corresponde a 26,8 cm de afastamento radial entre as camadas de armadura, que somados "
   "aos 2 × 6,6 cm de cobrimento e meia bitola resultam nos mesmos 40 cm."],
  ["Seção", "Altura da seção (m)", "-", SEC_H, "DERIVADO",
   "Estribo de 140 cm mais 5 cm de cobrimento em cada face. Mesma altura das demais fundações "
   "da série, que têm 150 cm."],
  ["Espaçamento", "Estribos N8 na seção corrente (m)", "-", 0.20, "PRANCHA",
   "209 N8 c/20 por fundação; 209 × 0,20 = 41,80 m, coerente com o desenvolvimento do eixo (41,94 m)."],
  ["Espaçamento", "Barras horizontais N6 / N7 (m)", "-", 0.20, "PRANCHA",
   "6 N6 c/20 e 6 N7 c/20 no CORTE A-A; 5 + 5 c/20 no CORTE B-B (trecho do rebaixo)."],
  ["Traspasse", "Traspasse típico das barras corridas (m)", "-", 0.40, "PRANCHA",
   "Cotas 40 (TÍP.), 120 e 160 repetidas nas elevações das faces."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO",
   "0,40 m × 1,50 m. É a menor seção da série: as fundações dos TQ-6310816/817, 6310818 e 6312824 "
   "têm 0,65 × 1,50 m."],
  ["Derivado", "Volume de concreto por fundação (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "ESTIMATIVA: área da seção × desenvolvimento do eixo. O mesmo cálculo aplicado ao TQ-6310818 "
   "resulta em 52,59 m³ contra os 52,50 m³ declarados na prancha de formas TX3-059 — diferença de "
   "0,17%, o que valida o método. O valor oficial deve sair da prancha de formas TX3-056."],
  ["Derivado", "Volume de concreto — 4 fundações (m³)", "-", round(VOL_ANEL * NT, 2), "DERIVADO",
   "ESTIMATIVA — mesma ressalva da linha anterior."],
  ["Derivado", "Taxa de armadura (kg/m³)", "-", round((MASSA_LISTA / NT) / VOL_ANEL, 1), "DERIVADO",
   "Massa de aço por fundação dividida pelo volume estimado. Fica acima das demais fundações da "
   "série (65 a 67 kg/m³), o que é coerente com uma seção mais estreita para um anel de porte menor."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título",
     "Desenho de fundação - tanques de lubrificação TQ-6310815 A/B/C/D - ARMADURAS"],
    ["Identificação", "Área", "Parque de tanques de produtos acabados (lubrificantes) - U-6310"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6310-120-TX3-001 - Memória de cálculo de fundação - tanques de lubrificação (U-6310)."],
    ["Documento de referência", "Planta de arranjo",
     "DE-5400.00-6310-942-TX3-001 - Planta de arranjo - U-6310 parque de tanques de produtos acabados."],
    ["Documento de referência", "Geotecnia",
     "RL-5400.00-6310-115-TX3-001 - Relatório geotécnico interpretativo."],
    ["Documento complementar", "Formas",
     "DE-5400.00-6310-120-TX3-056 - Desenho de fundação - tanques de lubrificação "
     "TQ-6310815A/B/C/D - FORMAS. Não fornecida nesta análise."],
    ["Pendência P1", "Arranjo geral", "CI-6310-001 - Arranjo geral de equipamentos."],
    ["Pendência P2", "Cargas", "CI-6310-004 - Cargas finais de vento e chumbador."]]
 ),
 "validacoes": [
  ["Lista de barras", "TOTAL = QUANT. × UNIT. (N8, N9, N10, N11, N13)", 5, 5, 0,
   "As cinco posições de comprimento fixo fecham exatamente: N8 836 × 3,90 = 3.260,40 m; "
   "N9 20 × 4,11 = 82,20 m; N10 16 × 5,00 = 80,00 m; N11 32 × 5,95 = 190,40 m; "
   "N13 8 × 4,55 = 36,40 m."],
  ["Multiplicidade 4x", "N8 - quantidade total vs. cota da planta", 836, 209 * NT, 0,
   "A planta indica 209 N8 c.20 por fundação. 209 × 4 = 836, confirmando que a coluna QUANT. da "
   "lista já corresponde ao conjunto das 4 fundações."],
  ["Multiplicidade 4x", "N9 / N10 / N12 / N13 - quantidade vs. cotas dos detalhes", 4, 4, 0,
   "N9 = 5/fundação (20/4); N10 = 4 (16/4); N12 = 2x2 = 4 (16/4); N13 = 2 (8/4). Todas coerentes "
   "com as chamadas da VISTA C-C e do CORTE B-B."],
  ["Multiplicidade 4x", "N11 - quantidade por fundação (un)", 8, 8, 0,
   "32/4 = 8 un por fundação, coerente com os dois conjuntos 'N11-4 Ø16-595 (SUP.)' desenhados na "
   "VISTA C-C."],
  ["Coerência de vistas", "CORTE B-B (2x) - número de rebaixos", 1, 1, 0,
   "O título traz '(2x)', mas a planta de armadura mostra um único rebaixo por fundação, com as "
   "marcações B-B nas duas bordas dele. A indicação corresponde às duas posições de corte, não a "
   "dois rebaixos - leitura confirmada pelas quantidades da lista (N9 = 5, N10 = 4, N11 = 8, "
   "N12 = 4 e N13 = 2 por fundação, todas de um único rebaixo)."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(67.36 / 16, 2), 1.23,
   round(67.36 / 16 - 1.23, 2),
   "A coluna UNIT. traz 'VAR' e a forma está cotada com perna variável (113 a 133) cm. Contudo, "
   "TOTAL 67,36 m para 16 un implica comprimento médio de 421 cm por barra - próximo dos estribos "
   "N8 (390) e N9 (411) e não da faixa cotada. O mesmo padrão aparece nas outras pranchas de "
   "armadura da série. CONFIRMAR COM O PROJETISTA."],
  ["Coerência geométrica", "Estribos N8 × desenvolvimento do eixo (m)", round(209 * 0.20, 2),
   DEV_SI, round(209 * 0.20 - DEV_SI, 2),
   "209 estribos a cada 20 cm cobrem 41,80 m, contra 41,94 m de desenvolvimento do eixo. "
   "Distribuição coerente."],
  ["Coerência geométrica", "Desenvolvimento do eixo vs. média das faces (m)", DEV_SI,
   round((DEV_EXT + DEV_INT) / 2, 3), round(DEV_SI - (DEV_EXT + DEV_INT) / 2, 3),
   "(42,782 + 41,098)/2 = 41,940 m, exatamente a cota da FACE SUPERIOR E INFERIOR. As três "
   "elevações são internamente consistentes."],
  ["Coerência geométrica", "Seção deduzida do estribo N8 (cm)", 390, 390, 0,
   "Para um estribo de b × h com dois ganchos de 10 cm, o comprimento é 3b + 2h + 20. Com "
   "b = 30 e h = 140: 3×30 + 2×140 + 20 = 390 cm, exatamente o C=390 impresso. A mesma fórmula "
   "reproduz o C=465 das fundações de seção 65 cm (b = 55, h = 140), o que confirma a leitura de "
   "que o retângulo cotado no corte é o ESTRIBO, e a seção de concreto é 40 × 150 cm."],
  ["Materiais", "Massas lineares adotadas (kg/m)", 3, 3, 0,
   "Ø8 = 0,395; Ø12,5 = 0,963; Ø16 = 1,578. Coincidem com os valores nominais da NBR 7480 para "
   "aço CA-50."],
  ["Escopo", "Perdas de corte, dobra e emendas", 0, 0, 0,
   "Os quantitativos são os do desenho (comprimentos de projeto). Não há acréscimo de perdas."],
  ["Escopo", "Concreto, formas e terraplenagem", 0, 0, 0,
   "Esta prancha é exclusivamente de ARMADURAS. O volume de concreto informado na aba Geometria é "
   "ESTIMATIVA: a prancha de formas deste conjunto (DE-5400.00-6310-120-TX3-056) não foi fornecida."],
 ],
 "destaques": [
  ["Comprimento", "Somatório da lista vs. RESUMO GERAL (m)", 7967.16, 7967.16, 0.0,
   "As três bitolas fecham exatamente com o quadro impresso na prancha."],
  ["Massa", "Massa total de aço (kg)", round(MASSA_LISTA, 2), TOTAL_DES,
   round(MASSA_LISTA - TOTAL_DES, 2), "Diferença apenas de arredondamento do TOTAL (kg) impresso."],
  ["Multiplicidade 4x", "N8 - 209 c/20 por fundação × 4", 836, 836, 0,
   "Confirma que as colunas QUANT. e TOTAL da lista já são o conjunto das 4 fundações."],
  ["Coerência de vistas", "CORTE B-B (2x) - número de rebaixos", 1, 1, 0,
   "A planta mostra um único rebaixo; o (2x) são as duas posições de corte que o delimitam. As "
   "quantidades da lista confirmam."],
  ["DIVERGÊNCIA", "N12 - comprimento unitário implícito (m)", round(67.36 / 16, 2), 1.23,
   round(67.36 / 16 - 1.23, 2),
   "Forma cotada como (113 a 133) cm, mas o TOTAL de 67,36 m para 16 un implica 421 cm por barra. Confirmar."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar, de forma rastreável, todo o quantitativo de armadura da prancha %s (fundações "
   "anelares dos tanques de lubrificação TQ-6310815 A/B/C/D), com painel gerencial e abas de "
   "auditoria." % DOC],
  ["Fonte primária",
   "Quadros LISTA DE BARRAS (4x) e RESUMO GERAL da própria prancha, complementados pelas cotas das "
   "vistas: planta de armadura, cortes A-A e B-B, vista C-C e elevações das faces."],
  ["Multiplicidade",
   "A prancha atende 4 fundações idênticas - indicação '4x' no título da planta e da lista de "
   "barras. As colunas QUANT. e TOTAL do desenho já são o somatório das 4 fundações; os valores "
   "unitários são derivados por divisão por 4. A leitura foi confirmada pela cota '209 N8 c.20' da "
   "planta (209 × 4 = 836, exatamente a quantidade da lista)."],
  ["A menor fundação da série",
   "Este é o anel mais leve do conjunto: seção de 40 × 150 cm (contra 65 × 150 cm das demais), "
   "desenvolvimento de eixo de 41,94 m e barras de face em Ø12,5. Em consequência, o estribo N8 "
   "tem C=390 cm, e não os 465 cm das fundações maiores."],
  ["Seção do anel",
   "A seção de concreto é de 40 × 150 cm. O 30 × 140 cm que aparece no CORTE A-A é a dimensão do "
   "ESTRIBO N8, medida dentro do cobrimento de 5 cm. A leitura foi confirmada por duas vias "
   "independentes: a fórmula do comprimento do estribo (3b + 2h + 20 = 390 cm) e o afastamento "
   "radial entre as camadas de armadura, deduzido das três elevações."],
  ["Volume de concreto",
   "A prancha de formas deste conjunto (DE-5400.00-6310-120-TX3-056) não foi fornecida, de modo que "
   "o volume de concreto na aba Geometria e Seções é ESTIMATIVA. O método foi validado no "
   "TQ-6310818: seção × desenvolvimento do eixo resulta em 52,59 m³ contra os 52,50 m³ declarados "
   "na prancha de formas TX3-059 (0,17% de diferença)."],
  ["Controle crítico",
   "Uma única divergência do desenho está destacada na aba Validações: N12 tem a forma cotada em "
   "(113 a 133) cm, mas o total de 67,36 m para 16 un implica 421 cm por barra. O mesmo padrão "
   "aparece nas demais pranchas de armadura da série. Fora isso, esta é a prancha mais consistente "
   "do conjunto: todas as bitolas, todos os produtos QUANT. × UNIT. e todas as multiplicidades "
   "fecham exatamente."],
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
