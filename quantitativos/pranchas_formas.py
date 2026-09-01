# -*- coding: utf-8 -*-
"""Elementos comuns às pranchas de FORMAS das fundações de tanques."""
from estilo import ACO, AZUL, LARANJA, N_2, N_INT, VERDE

G_CONC = "Concreto, formas e grout"
G_TERRA = "Movimento de terra"
G_IMPERM = "Impermeabilização"
G_DREN = "Drenagem"
GRUPOS = [G_CONC, G_TERRA, G_IMPERM, G_DREN]

NOTAS_GERAIS = [
 ["Nota geral 1", "Unidades",
  "Dimensões em centímetro, elevações e coordenadas em metro, exceto onde indicado."],
 ["Nota geral 2", "Materiais",
  "Concreto estrutural fck ≥ 30 MPa; fator água/cimento ≤ 0,55; concreto magro fck ≥ 10 MPa. "
  "O cobrimento é de 5 cm. A dimensão máxima do agregado graúdo deve ser menor que 6 cm (1,2 × 5 cm)."],
 ["Nota geral 3", "Tensão no teste de estanqueidade",
  "Tensão do tanque no teste de estanqueidade sobre o solo: 150 kN/m², de acordo com o "
  "RL-5400.00-6310-115-TX3-001 - Relatório geotécnico."],
 ["Nota geral 4", "Elevação do centro dos tanques",
  "Conforme orientações das respectivas folhas de dados (i > 1:120), acrescido da contra-flecha de "
  "53 mm; ver item 3 do documento de referência."],
 ["Nota geral 5", "Quantidades", "Volume de concreto estrutural: ver tabela."],
 ["Nota geral 6", "Junta de encontro (JE)", "Conforme o documento de pavimentação."],
 ["Nota geral 7", "Rebaixo da porta de limpeza",
  "O rebaixo no anel para fixação da porta de limpeza foi detalhado conforme as normas N-270 "
  "(pág. 31 / item 15 / pág. 48, tabela A.6), STD 650 (pág. 107, figura 5.13) e folha de dados."],
 ["Nota geral 8", "Reaterro compactado",
  "Reaterro compactado com materiais da própria escavação, descontando o material escavado da "
  "superficial (h ≈ 0,5 m), com compactação ≥ 98% PN, em camadas de no máximo 20 cm."],
 ["Nota geral 9", "Rachão",
  "Pedra britada de origem sã, limpa, isenta de materiais orgânicos, argila ou partículas friáveis; "
  "espalhado de maneira uniforme, evitando segregação; compactado por sucessivas passadas de rolo "
  "vibratório até camada estável, sem deslocamentos, afundamentos, bombeamento de finos ou "
  "deformações permanentes sob ação do equipamento."],
 ["Nota geral 10", "Bica corrida",
  "Proveniente de britagem de rocha, isenta de materiais orgânicos, torrões de argila ou "
  "contaminantes, com fração grossa de 19 mm a 38 mm e fração miúda de pó de pedra e pedrisco. "
  "Compactação com rolo vibratório até camada estável, com superfície firme."],
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

# camadas do berço do tanque, do topo para o fundo (DETALHE 1)
def camadas(rev_esp="e=5 cm"):
    return [
     [1, "Anel de concreto estrutural", "65 × 150 cm", "CONCRETO ESTRUTURAL",
      "fck ≥ 30 MPa, fator água/cimento ≤ 0,55, cobrimento 5 cm. Topo do grout na EL.19,75."],
     [2, "Grout de assentamento", "2,5 cm", "GROUT",
      "Camada de 2,5 cm sob a chapa de fundo do tanque, no topo do anel (EL.19,75)."],
     [3, "Mini dique", "EL.19,10", "CONCRETO ESTRUTURAL",
      "Mini dique perimetral na EL.19,10, junto à face externa do anel."],
     [4, "Concreto magro", "5 cm", "CONCRETO MAGRO",
      "fck ≥ 10 MPa, sob o anel de concreto e sob o revestimento."],
     [5, "Revestimento de concreto simples", rev_esp, "REVESTIMENTO CONCRETO SIMPLES e=5cm",
      "Revestimento do berço interno do tanque."],
     [6, "Pintura betuminosa", "-", "PINTURA BETUMINOSA",
      "Aplicada nas faces indicadas do anel e do berço."],
     [7, "Geomembrana PEAD", "e ≥ 0,8 mm", "GEOMEMBRANA PEAD e ≥ 0,8mm",
      "Fixação da manta de PEAD no anel de concreto conforme o DETALHE 1."],
     [8, "Manta geotêxtil não tecido", "-", "MANTA GEOTÊXTIL NÃO TECIDO",
      "Bidim RT-31 ou equivalente, acima e abaixo da geomembrana (daí a área ser o dobro da "
      "geomembrana)."],
     [9, "Areia grossa compactada", "-", "AREIA GROSSA COMPACTADA",
      "Camada de regularização sobre a bica corrida."],
     [10, "Bica corrida compactada", "-", "BICA CORRIDA",
      "Ver Nota 10: fração grossa de 19 a 38 mm; compactação com rolo vibratório."],
     [11, "Rachão", "-", "RACHÃO",
      "Ver Nota 9: pedra britada de origem sã, compactada até camada estável."],
     [12, "Reaterro compactado", "camadas ≤ 20 cm", "REATERRO COMPACTADO",
      "Ver Nota 8: material da própria escavação, compactação ≥ 98% do PN."],
     [13, "Tubo dreno corrugado DN-3\"", "i = 5%", "TUBO DRENO CORRUGADO DN-3\"",
      "Envolto em manta geotêxtil não tecido, com tampão; declividade de 5%."],
     [14, "Tubo corrugado não perfurado DN-3\"", "c/36°", "TUBO CORRUGADO NÃO PERFURADO DN-3\" C/36º",
      "Travessia do anel a cada 36°, totalizando 10 posições por tanque no perímetro."],
    ]


def cards_padrao(achar, vol_total, area_total, nt, nitens):
    plural = "tanques" if nt > 1 else "tanque"
    return [
     (1, 4, "CONCRETO ESTRUTURAL", achar("CONCRETO ESTRUTURAL"),
      "m³ de concreto do anel (%d %s)" % (nt, plural), AZUL, N_2),
     (4, 4, "ÁREA DE FORMA", achar("ÁREA DE FORMA"), "m² de forma", LARANJA, N_2),
     (7, 4, "MOVIMENTO DE TERRA", round(vol_total - achar("CONCRETO ESTRUTURAL") -
                                        achar("CONCRETO MAGRO") - achar("GROUT") -
                                        achar("REVESTIMENTO CONCRETO SIMPLES e=5cm"), 2),
      "m³ de escavação, reaterro e camadas", ACO, N_2),
     (10, 4, "TANQUES ATENDIDOS", nt, "fundações cobertas pela prancha", VERDE, N_INT),
     (1, 9, "ESCAVAÇÃO", achar("ESCAVAÇÃO"), "m³ de escavação", VERDE, N_2),
     (4, 9, "GROUT", achar("GROUT"), "m³ de grout de assentamento", ACO, N_2),
     (7, 9, "ÁREA TOTAL DE SERVIÇOS", round(area_total, 2),
      "m² somando formas, mantas e pinturas", LARANJA, N_2),
     (10, 9, "ITENS DO QUADRO", nitens, "linhas do QUANTITATIVO TOTAL", AZUL, N_INT),
    ]


LEIAME_BASE = [
 ["Unidades", "m = metro; m² = metro quadrado; m³ = metro cúbico; un = unidade; cm = centímetro; "
  "EL. = elevação em metro."],
 ["Agregação",
  "Volumes (m³), áreas (m²) e unidades (un) são somados separadamente nas abas de resumo, pois não "
  "se agregam entre si. O cartão 'ÁREA TOTAL DE SERVIÇOS' soma apenas as linhas em m²."],
 ["Perdas",
  "Os números são os do quadro do desenho. Nenhuma taxa de perda, empolamento ou fator de "
  "compactação foi acrescida."],
 ["Limite de uso",
  "Levantamento para planejamento, orçamento e controle. Qualquer uso para execução ou compra deve "
  "ser submetido à validação do responsável técnico do projeto."],
]
