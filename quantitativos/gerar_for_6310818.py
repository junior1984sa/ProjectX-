# -*- coding: utf-8 -*-
"""DE-5400.00-6310-120-TX3-059 — FORMAS das fundações dos TQ-6310818 A/B/C/D (4x)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_formas as CF
from pranchas_formas import (CARIMBO_COMUM, GRUPOS, G_CONC, G_DREN, G_IMPERM, G_TERRA,
                             LEIAME_BASE, NOTAS_GERAIS, camadas, cards_padrao)

AQUI = os.path.dirname(os.path.abspath(__file__))
NT = 4
DOC = "DE-5400.00-6310-120-TX3-059"
FONTE = ("Fonte: prancha %s, Rev. 0 (07/08/2026) - Desenho de fundação, tanques de lubrificação "
         "TQ-6310818 A/B/C/D - FORMAS" % DOC)

R_INT, R_EIXO, R_EXT = 8.26, 8.585, 8.91
SEC_B, SEC_H = 0.65, 1.50
DEV_EIXO = 2 * math.pi * R_EIXO
VOL_ANEL = SEC_B * SEC_H * DEV_EIXO

# item, unidade, quantidade unitária, total impresso, grupo, observação
ITENS = [
 ["CONCRETO ESTRUTURAL", "m³", 52.50, 210.00, G_CONC,
  "Anel de concreto de 65 × 150 cm, fck ≥ 30 MPa. Confere com a seção × desenvolvimento do eixo."],
 ["CONCRETO MAGRO", "m³", 2.30, 9.20, G_CONC,
  "fck ≥ 10 MPa, camada de 5 cm sob o anel e sob o revestimento. Unidade sem sufixo no quadro."],
 ["ÁREA DE FORMA", "m²", 180.00, 720.00, G_CONC, "Formas das faces interna e externa do anel."],
 ["GROUT", "m³", 0.88, 3.50, G_CONC,
  "Camada de 2,5 cm no topo do anel (EL.19,75), sob a chapa de fundo do tanque."],
 ["PINTURA BETUMINOSA", "m²", 256.38, 1025.53, G_IMPERM, "Aplicada nas faces indicadas no DETALHE 1."],
 ["ESCAVAÇÃO", "m³", 121.55, 496.40, G_TERRA, "Escavação para implantação do berço e do anel."],
 ["REATERRO COMPACTADO", "m³", 128.40, 640.80, G_TERRA,
  "Ver Nota 8: material da própria escavação, compactação ≥ 98% do PN, camadas ≤ 20 cm."],
 ["AREIA GROSSA COMPACTADA", "m³", 70.62, 352.44, G_TERRA, "Camada de regularização do berço."],
 ["MANTA GEOTÊXTIL NÃO TECIDO", "m²", 428.00, 1712.00, G_IMPERM,
  "Bidim RT-31 ou equivalente. A área é exatamente o dobro da geomembrana, coerente com a aplicação "
  "acima e abaixo dela."],
 ["BICA CORRIDA", "m³", 100.58, 501.96, G_TERRA, "Ver Nota 10: fração grossa de 19 a 38 mm."],
 ["REVESTIMENTO CONCRETO SIMPLES e=5cm", "m³", 10.70, 53.40, G_CONC,
  "Revestimento do berço interno, espessura de 5 cm."],
 ["GEOMEMBRANA PEAD e ≥ 0,8mm", "m²", 214.00, 856.00, G_IMPERM,
  "Fixada ao anel de concreto conforme o DETALHE 1."],
 ["TUBO DRENO CORRUGADO DN-3\"", "un", 12, 48, G_DREN,
  "Envolto em manta geotêxtil não tecido, com tampão e declividade de 5%."],
 ["TUBO CORRUGADO NÃO PERFURADO DN-3\" C/36º", "un", 12, 48, G_DREN,
  "Travessia do anel; a cada 36° o perímetro comportaria 10 posições, e o quadro adota 12 un."],
 ["RACHÃO", "m³", 139.10, 556.40, G_TERRA, "Ver Nota 9: pedra britada de origem sã, compactada."],
]

FATOR = {i[0]: (i[3] / i[2]) for i in ITENS}
DIVERGENTES = [i for i in ITENS if abs(i[3] - i[2] * NT) > 0.05]
EXCESSO = sum(i[3] - i[2] * NT for i in ITENS if i[1] == "m³" and abs(i[3] - i[2] * NT) > 0.05)

SPEC = {
 "nt": NT,
 "itens": ITENS,
 "grupos": GRUPOS,
 "fonte": FONTE,
 "elemento": "Fundação anelar — formas e berço",
 "tanques": ["TQ-6310818A", "TQ-6310818B", "TQ-6310818C", "TQ-6310818D"],
 "itens_por_tanque": ["CONCRETO ESTRUTURAL", "ÁREA DE FORMA", "GROUT", "ESCAVAÇÃO",
                      "REATERRO COMPACTADO"],
 "titulo_painel": "PAINEL DE QUANTITATIVOS - FORMAS DAS FUNDAÇÕES DOS TQ-6310818 A/B/C/D",
 "subtitulo_painel": ("Prancha %s Rev. 0 (07/08/2026)  |  TQ-6310818 A/B/C/D (4x)  |  "
                      "U-6310 - Refino Boaventura  |  Escopo: formas, concreto, terraplenagem, "
                      "impermeabilização e drenagem" % DOC),
 "cards": cards_padrao,
 "nota_qt": ("Quadro QUANTITATIVO TOTAL transcrito item a item. A coluna '1 UN' do desenho é a "
             "quantidade por tanque e a coluna 'TOTAL' é o valor impresso para o conjunto. A coluna "
             "'Total calculado' aplica unitário × 4 e a coluna 'Desvio' expõe as diferenças — as "
             "linhas destacadas em âmbar não fecham."),
 "nota_unitario": ("A prancha atende 4 fundações idênticas (indicação '4x' na planta de formas). "
                   "Os valores por tanque são os da coluna '1 UN' do próprio quadro."),
 "camadas": camadas(),
 "geometria": [
  ["Vista", "PLANTA - FORMAS - TQ-6310818 A/B/C/D (4x)", "1:50", None, "PRANCHA",
   "Planta do anel com os quatro tanques posicionados; orientações 0º, 90º, 180º e 270º."],
  ["Vista", "CORTE A-A", "1:50", None, "PRANCHA",
   "Corte geral do berço, mostrando as camadas de reaterro, rachão, bica corrida e areia."],
  ["Vista", "CORTE B-B", "1:20", None, "PRANCHA",
   "Corte no rebaixo para fixação da porta de limpeza; cotas 32,5 / 32,5 / 27,5 / 35."],
  ["Vista", "VISTA C-C", "1:25", None, "PRANCHA", "Vista do rebaixo; cotas 120 / 30 / 150."],
  ["Vista", "DETALHE 1 - anel de concreto", "1:25", None, "PRANCHA",
   "Seção do anel e composição das camadas do berço; base da leitura da aba Camadas e Materiais."],
  ["Vista", "DETALHE 2 - dreno", "1:12,5", None, "PRANCHA",
   "Tubo dreno corrugado DN-3\" com tampão e declividade i=5%."],
  ["Vista", "DETALHE A (JE)", "1:5", None, "PRANCHA",
   "Junta de encontro com selante Sikaflex T68 ou similar, isopor e delimitador de profundidade "
   "em polietileno (Tarucel ou similar)."],
  ["Anel", "Raio interno (m)", "-", R_INT, "PRANCHA", "R826 cm; diâmetro interno cotado de 1652 cm."],
  ["Anel", "Raio do eixo (m)", "-", R_EIXO, "PRANCHA", "R858,5 cm."],
  ["Anel", "Raio externo (m)", "-", R_EXT, "PRANCHA", "R891 cm."],
  ["Anel", "Largura radial da seção (m)", "-", SEC_B, "PRANCHA", "Cota 65 cm (R891 - R826)."],
  ["Anel", "Altura da seção (m)", "-", SEC_H, "PRANCHA", "Cota 150 cm no DETALHE 1."],
  ["Elevação", "Topo do grout (m)", "-", 19.75, "PRANCHA", "EL.19,75 (T.GROUT)."],
  ["Elevação", "Topo do concreto do anel (m)", "-", 19.725, "PRANCHA", "EL.19,725 (T.CONCRETO)."],
  ["Elevação", "Topo do concreto no rebaixo (m)", "-", 19.45, "PRANCHA", "EL.19,45 (T.CONCRETO)."],
  ["Elevação", "Mini dique (m)", "-", 19.10, "PRANCHA", "EL.19,10 (MINI DIQUE)."],
  ["Elevação", "Terreno acabado (m)", "-", 19.00, "PRANCHA", "EL.19,00 (TERRENO ACABADO)."],
  ["Elevação", "Centro do tanque (m)", "-", 19.883, "PRANCHA",
   "EL.19,883, conforme Nota 4 (i > 1:120 acrescido de contra-flecha de 53 mm)."],
  ["Locação", "Coordenada N dos tanques (m)", "-", 3239.281, "PRANCHA", "N=3239.281 para os quatro tanques."],
  ["Locação", "Coordenada E - TQ-6310818 A (m)", "-", 4292.772, "PRANCHA", "E=4292.772."],
  ["Locação", "Coordenada E - TQ-6310818 B (m)", "-", 4265.272, "PRANCHA", "E=4265.272."],
  ["Locação", "Coordenada E - TQ-6310818 C (m)", "-", 4237.772, "PRANCHA", "E=4237.772."],
  ["Locação", "Coordenada E - TQ-6310818 D (m)", "-", 4210.272, "PRANCHA", "E=4210.272."],
  ["Derivado", "Desenvolvimento do eixo do anel (m)", "-", round(DEV_EIXO, 3), "DERIVADO",
   "2π × R858,5. Coincide com os 5394,1 cm cotados na FACE SUPERIOR E INFERIOR da prancha de "
   "armaduras TX3-060."],
  ["Derivado", "Área da seção do anel (m²)", "-", round(SEC_B * SEC_H, 4), "DERIVADO", "0,65 m × 1,50 m."],
  ["Derivado", "Volume do anel por tanque (m³)", "-", round(VOL_ANEL, 2), "DERIVADO",
   "Seção × desenvolvimento do eixo. Confere com os 52,50 m³ de concreto estrutural do quadro "
   "(diferença de 0,17%), confirmando a geometria adotada."],
 ],
 "parametros": (
   [["Identificação", "Número do documento", DOC]] + CARIMBO_COMUM[:1] +
   [["Identificação", "Título",
     "Desenho de fundação - tanques de lubrificação TQ-6310818 A/B/C/D - FORMAS"],
    ["Identificação", "Área", "Parque de tanques de produtos acabados (lubrificantes) - U-6310"],
    ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"]] +
   CARIMBO_COMUM[1:] + NOTAS_GERAIS +
   [["Documento de referência", "Memória de cálculo",
     "MC-5400.00-6310-120-TX3-001 - Memória de cálculo de fundação - tanques de lubrificação (U-6310)."],
    ["Documento de referência", "Arranjo",
     "DE-5400.00-6310-942-TX3-001 - Planta de arranjo - U-6310 parque de tanques de produtos acabados."],
    ["Documento de referência", "Geotecnia", "RL-5400.00-6310-115-TX3-001 - Relatório geotécnico."],
    ["Documento de referência", "Especificações",
     "ET-5400.00-6310-131-TX3-001 - Estruturas de concreto; ET-5400.00-6310-120-TX3-001 - Fundações."],
    ["Documento de referência", "Folha de dados",
     "FD-5400.00-6310-511-TX3-004 - Tanque de óleo básico lubrificante 500N / 600N - TQ-6310818A/B/C/D."],
    ["Documento complementar", "Armaduras",
     "DE-5400.00-6310-120-TX3-060 - Desenho de fundação - tanques TQ-6310818A/B/C/D - ARMADURAS."],
    ["Documento complementar", "Terraplenagem",
     "DE-5400.00-6310-113-TX3-003 (planta) e DE-5400.00-6310-113-TX3-004 (cortes) - terraplenagem "
     "de implantação, área dos tanques."],
    ["Pendência P1", "Arranjo geral", "CI-6310-001 - Arranjo geral de equipamentos."],
    ["Pendência P2", "Cargas", "CI-6310-004 - Cargas finais de vento e chumbador."]]
 ),
 "validacoes": [
  ["Coerência geométrica", "Volume do anel vs. concreto estrutural (m³)", round(VOL_ANEL, 2),
   52.50, round(VOL_ANEL - 52.50, 2),
   "Seção 0,65 × 1,50 m × desenvolvimento do eixo (53,943 m) resulta em 52,59 m³, contra os "
   "52,50 m³ do quadro. Diferença de 0,17%, compatível com o desconto do rebaixo. Confirma a "
   "geometria do anel."],
  ["Coerência entre pranchas", "Desenvolvimento do eixo vs. prancha de armaduras (m)",
   round(DEV_EIXO, 2), 53.941, round(DEV_EIXO - 53.941, 3),
   "2π × R858,5 = 53,943 m contra os 5394,1 cm cotados na FACE SUPERIOR E INFERIOR do TX3-060."],
  ["Coerência interna", "Manta geotêxtil vs. geomembrana (m²)", 428.00, 2 * 214.00, 0,
   "A manta tem exatamente o dobro da área da geomembrana, coerente com a aplicação de uma camada "
   "acima e outra abaixo dela."],
  ["Escopo", "Armaduras", 0, 0, 0,
   "Esta prancha é de FORMAS. A armadura passiva está na prancha DE-5400.00-6310-120-TX3-060, com "
   "14.091,15 kg de aço CA-50 auditados para as 4 fundações (3.522,79 kg por tanque)."],
  ["Escopo", "Perdas e empolamento", 0, 0, 0,
   "Os quantitativos são os do quadro do desenho. Não há acréscimo de perdas, empolamento de "
   "escavação ou fator de compactação."],
 ],
 "destaques": [
  ["Multiplicação", "Itens que fecham com unitário × 4", 10, 10, 0,
   "Concreto estrutural, concreto magro, área de forma, grout, pintura betuminosa, manta geotêxtil, "
   "geomembrana, rachão e os dois tubos fecham exatamente (ou com arredondamento de 0,01 a 0,02)."],
  ["DIVERGÊNCIA", "Reaterro compactado (m³)", 513.60, 640.80, 127.20,
   "Total impresso equivale a 4,99 × o unitário, e não a 4. Excesso de 127,20 m³."],
  ["DIVERGÊNCIA", "Bica corrida (m³)", 402.32, 501.96, 99.64,
   "Total impresso equivale a 4,99 × o unitário, e não a 4. Excesso de 99,64 m³."],
  ["DIVERGÊNCIA", "Areia grossa compactada (m³)", 282.48, 352.44, 69.96,
   "Total impresso equivale a 4,99 × o unitário, e não a 4. Excesso de 69,96 m³."],
  ["DIVERGÊNCIA", "Revestimento e escavação (m³)", 529.00, 549.80, 20.80,
   "Revestimento: 42,80 calculado vs. 53,40 impresso (fator 4,99). Escavação: 486,20 vs. 496,40 "
   "(fator 4,08). Somadas às demais, as cinco linhas totalizam 317,60 m³ a mais. Confirmar."],
 ],
 "leiame": [
  ["Objetivo",
   "Consolidar o quantitativo de materiais da prancha %s (formas, concreto, grout, terraplenagem, "
   "impermeabilização e drenagem das fundações dos TQ-6310818 A/B/C/D), com painel gerencial e "
   "abas de auditoria." % DOC],
  ["Fonte primária",
   "Quadro QUANTITATIVO TOTAL da própria prancha, complementado pelas cotas da planta de formas, "
   "dos cortes A-A e B-B, da vista C-C e dos detalhes 1, 2 e A (JE), além das notas gerais."],
  ["Multiplicidade",
   "A prancha atende 4 fundações idênticas (indicação '4x'). A coluna '1 UN' do quadro é a "
   "quantidade por tanque e a coluna 'TOTAL', o valor impresso para o conjunto."],
  ["Controle crítico",
   "Cinco linhas do quadro não fecham com unitário × 4: reaterro compactado, bica corrida, areia "
   "grossa compactada e revestimento de concreto simples têm total equivalente a 4,99 × o unitário "
   "(como se fossem 5 tanques), e a escavação, a 4,08 ×. Somadas, são 317,60 m³ a mais do que a "
   "multiplicação por 4. As abas Quantitativo Total e Validações destacam cada caso; confirmar com "
   "o projetista antes de usar os totais para compra."],
  ["Como usar",
   "Comece pelo Dashboard Executivo. Para auditoria, use Quantitativo Total (transcrição integral, "
   "com o desvio linha a linha), Resumo por Grupo e Quantitativo por Tanque. Camadas e Materiais "
   "descreve a composição do berço na ordem de execução; Geometria e Seções e Parâmetros Técnicos "
   "guardam cotas, elevações, locação e carimbo."],
 ] + LEIAME_BASE,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Quantitativo_Formas_%s.xlsx" % DOC)
    r = CF.gerar(SPEC, saida)
    print("gerado: %s" % r["arquivo"])
    print("volume total %.2f m3 | area total %.2f m2 | linhas divergentes: %d | excesso %.2f m3"
          % (r["volume"], r["area"], len(DIVERGENTES), EXCESSO))
