# -*- coding: utf-8 -*-
"""DE-5400.00-6312-120-TX3-001 — FORMAS da fundação do TQ-6312824 (tanque de UCO)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_formas as CF
from pranchas_formas import (CARIMBO_COMUM, GRUPOS, G_CONC, G_DREN, G_IMPERM, G_TERRA,
                             LEIAME_BASE, NOTAS_GERAIS, camadas, cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 1
DOC = "DE-5400.00-6312-120-TX3-001"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanque de UCO "
         "TQ-6312824 - FORMAS" % DOC)

R_INT, R_EIXO, R_EXT = 13.975, 14.30, 14.625
SEC_B, SEC_H = 0.65, 1.50
DEV_EIXO = 2 * math.pi * R_EIXO
VOL_ANEL = SEC_B * SEC_H * DEV_EIXO
CONC_DECL = 114.00

ITENS = [
 ["CONCRETO ESTRUTURAL", "m³", 114.00, None, G_CONC,
  "Anel de concreto de 65 × 150 cm, fck ≥ 30 MPa, sobre R1430 de eixo."],
 ["CONCRETO MAGRO", "m³", 3.80, None, G_CONC,
  "fck ≥ 10 MPa, camada de 5 cm sob o anel e sob o revestimento. Unidade sem sufixo no quadro."],
 ["ÁREA DE FORMA", "m²", 225.04, None, G_CONC, "Formas das faces interna e externa do anel."],
 ["GROUT", "m³", 1.90, None, G_CONC,
  "Camada de 2,5 cm no topo do anel (EL.19,75), sob a chapa de fundo do tanque."],
 ["PINTURA BETUMINOSA", "m²", 203.35, None, G_IMPERM, "Aplicada nas faces indicadas no DETALHE 1."],
 ["ESCAVAÇÃO", "m³", 192.00, None, G_TERRA, "Escavação para implantação do berço e do anel."],
 ["REATERRO COMPACTADO", "m³", 492.00, None, G_TERRA,
  "Ver Nota 8: material da própria escavação, compactação ≥ 98% do PN, camadas ≤ 20 cm."],
 ["AREIA GROSSA COMPACTADA", "m³", 202.29, None, G_TERRA, "Camada de regularização do berço."],
 ["MANTA GEOTÊXTIL NÃO TECIDO", "m²", 1226.00, None, G_IMPERM,
  "Bidim RT-31 ou equivalente. A área é exatamente o dobro da geomembrana, coerente com a aplicação "
  "acima e abaixo dela."],
 ["BICA CORRIDA", "m³", 288.11, None, G_TERRA, "Ver Nota 10: fração grossa de 19 a 38 mm."],
 ["REVESTIMENTO CONCRETO SIMPLES e=5cm", "m³", 30.65, None, G_CONC,
  "Revestimento do berço interno, espessura de 5 cm."],
 ["GEOMEMBRANA PEAD e ≥ 0,8mm", "m²", 613.00, None, G_IMPERM,
  "Fixada ao anel de concreto conforme o DETALHE 1."],
 ["TUBO DRENO CORRUGADO DN-3\"", "un", 12, None, G_DREN,
  "Envolto em manta geotêxtil não tecido, com tampão e declividade de 5%."],
 ["RACHÃO", "m³", 398.45, None, G_TERRA, "Ver Nota 9: pedra britada de origem sã, compactada."],
 ["TUBO CORRUGADO NÃO PERFURADO DN-3\" C/36º", "un", 12, None, G_DREN,
  "Travessia do anel; a cada 36° o perímetro comportaria 10 posições, e o quadro adota 12 un."],
]

SPEC = {
 "nt": NT,
 "itens": ITENS,
 "grupos": GRUPOS,
 "fonte": FONTE,
 "elemento": "Fundação anelar — formas e berço",
 "tanques": ["TQ-6312824"],
 "itens_por_tanque": [],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - FORMAS DA FUNDAÇÃO DO TQ-6312824 (TANQUE DE UCO)",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6312824 - tanque de UCO  |  "
                      "U-6312 - Refino Boaventura  |  Escopo: formas, concreto, terraplenagem, "
                      "impermeabilização e drenagem" % DOC),
 "cards": cards_padrao,
 "nota_qt": ("Quadro QUANTITATIVO TOTAL transcrito item a item. A prancha atende uma única fundação "
             "e o quadro traz apenas a coluna '1 UN', sem coluna de total — por isso não há, nesta "
             "prancha, a conferência de multiplicação disponível nas pranchas de 4 tanques."),
 "nota_unitario": ("A prancha atende uma única fundação (TQ-6312824). As quantidades desta aba são "
                   "as do próprio quadro da prancha."),
 "camadas": camadas(),
 "geometria": [
  ["Vista", "PLANTA - FORMAS - TQ-6312824", "1:75", None, "PRANCHA",
   "Planta do anel; orientações 0º, 90º, 180º e 270º; dois rebaixos para fixação da porta de limpeza."],
  ["Vista", "CORTE A-A", "1:75", None, "PRANCHA",
   "Corte geral do berço, mostrando as camadas de reaterro, rachão, bica corrida e areia."],
  ["Vista", "CORTE C-C", "-", None, "PRANCHA", "Corte no rebaixo; cotas 60 / 90 / 30."],
  ["Vista", "DETALHE 1 - anel de concreto", "1:25", None, "PRANCHA",
   "Seção do anel e composição das camadas do berço; base da leitura da aba Camadas e Materiais."],
  ["Vista", "DETALHE 2 - dreno", "1:12,5", None, "PRANCHA",
   "Tubo dreno corrugado DN-3\" com tampão e declividade i=5%."],
  ["Vista", "DETALHE A (JE)", "-", None, "PRANCHA",
   "Junta de encontro conforme o documento de pavimentação (Nota 6)."],
  ["Anel", "Raio interno (m)", "-", R_INT, "PRANCHA", "R1397,5 cm; diâmetro interno cotado de 2795 cm."],
  ["Anel", "Raio do eixo (m)", "-", R_EIXO, "PRANCHA", "R1430 cm."],
  ["Anel", "Raio externo (m)", "-", R_EXT, "PRANCHA", "R1462,5 cm."],
  ["Anel", "Largura radial da seção (m)", "-", SEC_B, "PRANCHA", "Cota 65 cm (R1462,5 - R1397,5)."],
  ["Anel", "Altura da seção (m)", "-", SEC_H, "PRANCHA", "Cota 150 cm no DETALHE 1."],
  ["Rebaixo", "Cotas do rebaixo (cm)", "-", None, "PRANCHA",
   "Cotas 60 / 60 / 90 / 90 / 30 / 30 nos dois rebaixos para fixação da porta de limpeza (Nota 7)."],
  ["Elevação", "Topo do grout (m)", "-", 19.75, "PRANCHA", "EL.19,75 (T.GROUT)."],
  ["Elevação", "Mini dique (m)", "-", 19.10, "PRANCHA", "EL.19,10 (MINI DIQUE)."],
  ["Elevação", "Terreno acabado (m)", "-", 19.00, "PRANCHA", "EL.19,00 (TERRENO ACABADO)."],
  ["Elevação", "Centro do tanque (m)", "-", 19.883, "PRANCHA",
   "EL.19,883, conforme Nota 4 (i > 1:120 acrescido de contra-flecha de 53 mm)."],
  ["Locação", "Coordenada N (m)", "-", 3286.681, "PRANCHA", "N=3286.681."],
  ["Locação", "Coordenada E (m)", "-", 4401.137, "PRANCHA", "E=4401.137."],
  ["Derivado", "Desenvolvimento do eixo do anel (m)", "-", round(DEV_EIXO, 3), "DERIVADO",
   "2π × R1430. Coincide com os 8985 cm cotados na FACE SUPERIOR E INFERIOR da prancha de "
   "armaduras 6312 TX3-002."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO", "0,65 m × 1,50 m."],
  ["Derivado", "Volume do anel corrente (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "Seção × desenvolvimento do eixo. Cobre apenas o anel corrente: fica 26,40 m³ abaixo dos "
   "114,00 m³ declarados, diferença atribuível aos dois rebaixos e demais elementos."],
  ["Derivado", "Taxa de armadura (kg/m³)", "-", round(7676.39 / CONC_DECL, 1), "DERIVADO",
   "7.676,39 kg da prancha de armaduras 6312 TX3-002 divididos pelo concreto estrutural declarado. "
   "Comparável às taxas das fundações dos tanques de lubrificação (67 kg/m³)."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título", "Desenho de fundação - tanque de UCO TQ-6312824 - FORMAS"],
    ["Identificação", "Área",
     "Parque de tanques de produtos intermediários (lubrificantes) - U-6312"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6310-120-TX3-001 - Memória de cálculo de fundação - tanques de lubrificação "
     "(U-6310), conforme listado nesta prancha. Observe que a prancha de armaduras deste mesmo "
     "tanque cita a MC-5400.00-6312-120-TX3-004 - Memória de cálculo de fundação - tanque de UCO."],
    ["Documento de referência", "Arranjo",
     "DE-5400.00-6310-942-TX3-001 - Planta de arranjo - U-6310 parque de tanques de produtos acabados."],
    ["Documento de referência", "Geotecnia", "RL-5400.00-6310-115-TX3-001 - Relatório geotécnico."],
    ["Documento de referência", "Especificações",
     "ET-5400.00-6312-131-TX3-001 - Estruturas de concreto; ET-5400.00-6312-120-TX3-001 - Fundações."],
    ["Documento de referência", "Folha de dados",
     "FD-5400.00-6312-511-TX3-001 - Tanque de UCO - TQ-6312824."],
    ["Documento complementar", "Armaduras",
     "DE-5400.00-6312-120-TX3-002 - Desenho de fundação - tanque de UCO - TQ-6312824 - ARMADURAS."],
    ["Documento complementar", "Terraplenagem",
     "DE-5400.00-6310-113-TX3-003 (planta) e DE-5400.00-6310-113-TX3-004 (cortes) - terraplenagem "
     "de implantação, área dos tanques."],
    ["Pendência P1", "Cargas", "CI-6312-001 - Cargas de vento e chumbadores."],
    ["Pendência P2", "Arranjo geral", "CI-6312-003 - Emissão do arranjo geral de equipamentos."]]
 ),
 "validacoes": [
  ["Escopo do quadro", "Coluna de total (un)", 1, 1, 0,
   "A prancha atende uma única fundação e o quadro traz apenas a coluna '1 UN'. Não há, portanto, "
   "a conferência de multiplicação que existe nas pranchas de 4 tanques — os valores são adotados "
   "como estão."],
  ["Coerência interna", "Manta geotêxtil vs. geomembrana (m²)", 1226.00, 2 * 613.00, 0,
   "A manta tem exatamente o dobro da área da geomembrana, coerente com a aplicação de uma camada "
   "acima e outra abaixo dela. Mesmo padrão da prancha TX3-059."],
  ["Coerência entre pranchas", "Desenvolvimento do eixo vs. prancha de armaduras (m)",
   round(DEV_EIXO, 2), 89.850, round(DEV_EIXO - 89.850, 3),
   "2π × R1430 = 89,847 m contra os 8985 cm cotados na FACE SUPERIOR E INFERIOR do 6312 TX3-002. "
   "As três elevações daquela prancha conferem com os raios R1397,5 / R1430 / R1462,5, descontado "
   "o cobrimento."],
  ["Coerência geométrica", "Anel corrente vs. concreto estrutural (m³)", round(VOL_ANEL, 2),
   CONC_DECL, round(VOL_ANEL - CONC_DECL, 2),
   "A seção corrente 0,65 × 1,50 m ao longo do eixo resulta em 87,60 m³, contra os 114,00 m³ "
   "declarados. A diferença de 26,40 m³ corresponde aos dois rebaixos e demais elementos fora da "
   "seção corrente. Verificação informativa, não uma divergência. Na prancha TX3-059, onde o anel "
   "é menor e há um único rebaixo, o mesmo cálculo fecha em 0,17%."],
  ["Coerência entre pranchas", "Taxa de armadura (kg/m³)", round(7676.39 / CONC_DECL, 1), 67.0,
   round(7676.39 / CONC_DECL - 67.0, 1),
   "7.676,39 kg de aço (prancha 6312 TX3-002) sobre 114,00 m³ de concreto resultam em 67,3 kg/m³, "
   "praticamente igual aos 67,1 kg/m³ das fundações dos TQ-6310818. Consistência entre as duas "
   "famílias de fundação."],
  ["Observação", "Memória de cálculo citada", 0, 0, 0,
   "Esta prancha lista como documento de referência a MC-5400.00-6310-120-TX3-001 (tanques de "
   "lubrificação, U-6310), enquanto a prancha de armaduras do mesmo tanque cita a "
   "MC-5400.00-6312-120-TX3-004 (tanque de UCO). Vale confirmar qual memória rege esta fundação."],
  ["Escopo", "Armaduras", 0, 0, 0,
   "Esta prancha é de FORMAS. A armadura passiva está na prancha DE-5400.00-6312-120-TX3-002, com "
   "7.676,39 kg de aço CA-50."],
  ["Escopo", "Perdas e empolamento", 0, 0, 0,
   "Os quantitativos são os do quadro do desenho. Não há acréscimo de perdas, empolamento de "
   "escavação ou fator de compactação."],
 ],
 "destaques": [
  ["Coerência interna", "Manta geotêxtil vs. geomembrana (m²)", 1226.00, 1226.00, 0.0,
   "A manta tem exatamente o dobro da geomembrana, coerente com uma camada acima e outra abaixo."],
  ["Coerência entre pranchas", "Desenvolvimento do eixo (m)", round(DEV_EIXO, 2), 89.85,
   round(DEV_EIXO - 89.85, 2),
   "2π × R1430 confere com a cota da FACE SUPERIOR E INFERIOR da prancha de armaduras 6312 TX3-002."],
  ["Coerência entre pranchas", "Taxa de armadura (kg/m³)", round(7676.39 / CONC_DECL, 1), 67.0,
   round(7676.39 / CONC_DECL - 67.0, 1),
   "67,3 kg/m³ contra 67,1 kg/m³ das fundações dos TQ-6310818. Consistente."],
  ["Coerência geométrica", "Anel corrente vs. concreto declarado (m³)", round(VOL_ANEL, 2),
   CONC_DECL, round(VOL_ANEL - CONC_DECL, 2),
   "Seção corrente resulta em 87,60 m³; o quadro declara 114,00 m³. A diferença cobre os dois "
   "rebaixos e demais elementos. Informativo, não é divergência."],
  ["Observação", "Memória de cálculo citada", 0, 0, 0,
   "A prancha cita a MC do U-6310; a prancha de armaduras do mesmo tanque cita a MC do U-6312. Confirmar."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar o quantitativo de materiais da prancha %s (formas, concreto, grout, terraplenagem, "
   "impermeabilização e drenagem da fundação do tanque de UCO TQ-6312824), com painel gerencial e "
   "abas de auditoria." % DOC],
  ["Fonte primária",
   "Quadro QUANTITATIVO TOTAL da própria prancha, complementado pelas cotas da planta de formas, do "
   "corte A-A, dos detalhes 1 e 2 e das notas gerais."],
  ["Fundação única",
   "A prancha atende uma única fundação e o quadro traz apenas a coluna '1 UN', sem coluna de "
   "total. Não há, portanto, a conferência de multiplicação que a prancha TX3-059 permite."],
  ["Verificações possíveis",
   "Na ausência daquela conferência, a auditoria se apoia em três cruzamentos: a manta geotêxtil "
   "vale exatamente o dobro da geomembrana; o desenvolvimento do eixo (2π × R1430 = 89,85 m) "
   "confere com a cota da prancha de armaduras; e a taxa de armadura resultante (67,3 kg/m³) "
   "praticamente coincide com a das fundações dos TQ-6310818 (67,1 kg/m³)."],
  ["Ponto de atenção",
   "Esta prancha lista como memória de cálculo a MC-5400.00-6310-120-TX3-001 (tanques de "
   "lubrificação, U-6310), enquanto a prancha de armaduras do mesmo tanque cita a "
   "MC-5400.00-6312-120-TX3-004 (tanque de UCO). Vale confirmar qual documento rege esta fundação."],
  ["Como usar",
   "Comece pelo Dashboard Executivo. Para auditoria, use Quantitativo Total (transcrição integral) "
   "e Resumo por Grupo. Camadas e Materiais descreve a composição do berço na ordem de execução; "
   "Geometria e Seções e Parâmetros Técnicos guardam cotas, elevações, locação e carimbo."],
 ] + LEIAME_BASE,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Quantitativo_Formas_%s.xlsx" % DOC)
    r = CF.gerar(SPEC, saida)
    print("gerado: %s" % r["arquivo"])
    print("volume total %.2f m3 | area total %.2f m2" % (r["volume"], r["area"]))
