# -*- coding: utf-8 -*-
"""DE-5400.00-5700-190-TX3-102 — Lay-out da Unidade U-5700 HIDW. Edição em português."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_layout as CL
import dados_u5700 as D

AQUI = os.path.dirname(os.path.abspath(__file__))
DOC = "DE-5400.00-5700-190-TX3-102"
FONTE = ("Fonte: prancha %s, Rev. 0 (03/08/2026) - LAY-OUT, UNIDADE U-5700 HIDW - ÁREAS. "
         "Unidade de Hidroisodesparafinação, Refino Boaventura. Escala 1/250, folha A0 "
         "(1189 × 841 mm)." % DOC)

L = {
 "ABA_DASH": "Painel Executivo", "ABA_LISTA": "Lista de Equipamentos",
 "ABA_CAT": "Resumo por Categoria", "ABA_GRP": "Grupos de Processo", "ABA_EL": "Elevações",
 "ABA_AREA": "Áreas e Coordenadas", "ABA_SITE": "Entorno e Vias", "ABA_DWG": "Dados da Prancha",
 "ABA_VAL": "Validações", "ABA_LER": "Leia-me",
 "T_LISTA": "LISTA DE EQUIPAMENTOS - TRANSCRIÇÃO INTEGRAL DA LEGENDA DA PRANCHA",
 "N_LISTA": ("Todas as tags impressas na legenda da prancha, na ordem em que aparecem. 'Unidades' é "
             "o número de equipamentos físicos que a tag representa (A/B = 2, A/B/C = 3). A coluna "
             "'Idioma na prancha' assinala as oito entradas que a legenda traz em português; as "
             "demais descrições em português são tradução nossa do original em inglês."),
 "T_CAT": "RESUMO POR CATEGORIA DE EQUIPAMENTO",
 "N_CAT": "Contagem de tags e de unidades por categoria, usando os títulos da legenda da prancha.",
 "T_GRP": "GRUPOS DE PROCESSO",
 "N_GRP": ("Agrupamento por serviço de processo. Esta classificação é uma leitura NOSSA das "
           "descrições dos equipamentos - a prancha não agrupa os equipamentos dessa forma. É um "
           "apoio ao planejamento, não uma transcrição."),
 "T_EL": "ELEVAÇÕES COTADAS NA PRANCHA",
 "N_EL": ("Os 38 rótulos de elevação encontrados na prancha, reduzidos a 28 valores distintos. A "
          "prancha desenha os rótulos de equipamento em planta como arte vetorial, e não como "
          "texto, de modo que cada elevação NÃO pode ser associada automaticamente a uma tag - os "
          "valores são catalogados como níveis, sem atribuição a equipamento. A Nota 2 estabelece "
          "EL. 0,00 (PDMS) = EL. 26,140 acima do nível do mar (marégrafo de Imbituba, SC)."),
 "T_AREA": "ÁREAS, DIMENSÕES E COORDENADAS",
 "N_AREA": ("Valores lidos do QUADRO DE ÁREAS, das linhas de cota e dos rótulos de coordenada. As "
            "linhas marcadas como DERIVADO são cálculo próprio, apresentado como conferência."),
 "T_SITE": "ENTORNO - VIAS, TUBOVIAS E ÁREAS RESERVADAS",
 "N_SITE": "Ruas, avenidas, tubovias e áreas reservadas nomeadas na prancha.",
 "T_DWG": "DADOS DA PRANCHA, CARIMBO E NOTAS GERAIS",
 "N_DWG": "Carimbo, notas gerais e documentos vinculados, transcritos da prancha.",
 "T_VAL": "CONTROLES DE CONSISTÊNCIA",
 "N_VAL": ("Conferências entre o quadro de áreas, as linhas de cota e os rótulos de coordenada, "
           "além de observações editoriais sobre a legenda. Toda divergência está sinalizada."),
 "T_LER": "LEIA-ME - ANÁLISE DO LAY-OUT DA U-5700 HIDW",
 "H_ITEM": "Nº", "H_TAG": "Tag", "H_TAGBASE": "Tag base", "H_SUF": "Sufixo", "H_UN": "Unidades",
 "H_CAT": "Categoria", "H_DESC": "Descrição do serviço", "H_GRP": "Grupo de processo",
 "H_IDI": "Idioma na prancha", "H_CATPR": "Título na legenda", "H_TAGS": "Tags",
 "H_PCTUN": "% das unidades", "H_PCTTAG": "% das tags", "H_TAGSLIST": "Tags do conjunto",
 "H_ORD": "Nº", "H_ELPDMS": "Elevação\n(m, PDMS)", "H_ELMAR": "Elevação\n(m, nível do mar)",
 "H_OCOR": "Rótulos na\nprancha", "H_ACIMA": "Acima do nível\nmais baixo (m)",
 "H_GRUPO": "Grupo", "H_ITEMD": "Item", "H_VALOR": "Valor", "H_UNID": "Unidade", "H_ORIG": "Origem",
 "H_TIPO": "Tipo", "H_IDENT": "Identificação", "H_OBS": "Observação",
 "H_PARAM": "Campo", "H_CONT": "Conteúdo transcrito da prancha",
 "H_IND": "Indicador", "H_CALC": "Calculado", "H_REF": "Referência", "H_DESV": "Desvio",
 "H_CRIT": "Critério / observação", "H_TOPICO": "Tópico",
 "TOTAL": "TOTAL", "W_CATS": "categorias", "W_GRPS": "grupos", "W_DIV": "DIVERGÊNCIA",
 "IDI_EN": "Inglês", "IDI_PT": "Português (como impresso)",
 "C_TAGS": "TAGS DE EQUIPAMENTO", "C_TAGS_L": "tags listadas na legenda",
 "C_UN": "UNIDADES FÍSICAS", "C_UN_L": "itens contando os sufixos A/B e A/B/C",
 "C_AREA": "ÁREA TOTAL CONSTRUÍDA", "C_AREA_L": "m² conforme o quadro de áreas",
 "C_CAT": "CATEGORIAS", "C_CAT_L": "categorias de equipamento na legenda",
 "C_PUMP": "UNIDADES DE BOMBA", "C_PUMP_L": "maior família: 17 tags em pares A/B",
 "C_ENV": "ENVELOPE VERTICAL", "C_ENV_L": "m entre a menor e a maior elevação",
 "C_TOP": "MAIOR ELEVAÇÃO", "C_TOP_L": "m (PDMS) - 110,730 m acima do nível do mar",
 "C_GRP": "GRUPOS DE PROCESSO", "C_GRP_L": "grupos na nossa classificação",
 "S_CAT": "EQUIPAMENTOS POR CATEGORIA", "S_GRP": "TAGS POR GRUPO DE PROCESSO",
 "S_EL": "ELEVAÇÕES COTADAS NA PRANCHA - FONTE: ABA ELEVAÇÕES",
 "S_DEST": "CONTROLE DE VALIDAÇÃO - DESTAQUES",
 "G_UN": "Unidades físicas por categoria", "G_UN_Y": "unidades", "G_UN_X": "Categoria",
 "G_GRP": "Tags por grupo de processo",
 "G_EL": "Rótulos de elevação na prancha", "G_EL_Y": "rótulos", "G_EL_X": "Elevação (m, PDMS)",
}

AREAS = [
 ["Quadro de áreas", "Área total construída", D.AREA_TOTAL, "m²", "PRANCHA - quadro de áreas"],
 ["Quadro de áreas", "Casa de compressores", D.AREA_CASA_COMPRESSORES, "m²",
  "PRANCHA - área construída por edificação"],
 ["Quadro de áreas", "Arranjo de equipamentos - hidroisodesparafinação", D.AREA_ARRANJO, "m²",
  "PRANCHA - área construída por edificação"],
 ["Cota", "Comprimento do lote (leste-oeste)", D.DIM_LOTE_X, "m", "PRANCHA - linha de cota"],
 ["Cota", "Largura do lote (norte-sul)", D.DIM_LOTE_Y, "m", "PRANCHA - linha de cota"],
 ["Cota", "Comprimento da casa de compressores", D.DIM_CASA_X, "m", "PRANCHA - linha de cota"],
 ["Cota", "Largura da casa de compressores", D.DIM_CASA_Y, "m", "PRANCHA - linha de cota"],
 ["Coordenadas (PDMS)", "Limite do lote - oeste (E)", D.LOTE_E[0], "mm", "PRANCHA - rótulo de coordenada"],
 ["Coordenadas (PDMS)", "Limite do lote - leste (E)", D.LOTE_E[1], "mm", "PRANCHA - rótulo de coordenada"],
 ["Coordenadas (PDMS)", "Limite do lote - sul (N)", D.LOTE_N[0], "mm", "PRANCHA - rótulo de coordenada"],
 ["Coordenadas (PDMS)", "Limite do lote - norte (N)", D.LOTE_N[1], "mm", "PRANCHA - rótulo de coordenada"],
 ["Coordenadas (PDMS)", "Limite do sítio - oeste (E)", 4918040, "mm",
  "PRANCHA - E=4918040 / E=719873474 (SIRGAS)"],
 ["Coordenadas (PDMS)", "Avenida T - sul (N)", 3139290, "mm",
  "PRANCHA - N=3139290 / N=752034729 (SIRGAS)"],
 ["Coordenadas (PDMS)", "Avenida S - norte (N)", 3249290, "mm",
  "PRANCHA - N=3249290 / N=752144729 (SIRGAS)"],
 ["Referencial (Nota 2)", "E (PDMS) = 0 m corresponde a E (global)", 714955.434, "m", "PRANCHA - Nota 2"],
 ["Referencial (Nota 2)", "N (PDMS) = 0 m corresponde a N (global)", 7488954.390, "m", "PRANCHA - Nota 2"],
 ["Referencial (Nota 2)", "Elevação 0,00 (PDMS) acima do nível do mar", D.CONV_NIVEL_MAR, "m",
  "PRANCHA - Nota 2, marégrafo de Imbituba, SC"],
 ["DERIVADO", "Área do lote pelas linhas de cota", round(D.DIM_LOTE_X * D.DIM_LOTE_Y, 2), "m²",
  "DERIVADO - 148,60 × 72,60; confere com os 10.788 m² do quadro de áreas"],
 ["DERIVADO", "Área da casa de compressores pelas cotas", round(D.DIM_CASA_X * D.DIM_CASA_Y, 2), "m²",
  "DERIVADO - 74,93 × 18,27; confere com os 1.369 m² do quadro de áreas"],
 ["DERIVADO", "Comprimento do lote pelas coordenadas", (D.LOTE_E[1] - D.LOTE_E[0]) / 1000.0, "m",
  "DERIVADO - (5076440 - 4927840) mm; confere com a cota de 148,60 m"],
 ["DERIVADO", "Largura do lote pelas coordenadas", (D.LOTE_N[1] - D.LOTE_N[0]) / 1000.0, "m",
  "DERIVADO - (3237500 - 3164900) mm; confere com a cota de 72,60 m"],
 ["DERIVADO", "Área do arranjo (lote menos casa de compressores)",
  D.AREA_TOTAL - D.AREA_CASA_COMPRESSORES, "m²",
  "DERIVADO - 10.788 - 1.369; confere com os 9.419 m² do quadro de áreas"],
 ["DERIVADO", "Densidade construída", round(D.AREA_TOTAL / 94.0, 1), "m²/unidade",
  "DERIVADO - área total construída dividida pelas 94 unidades físicas"],
]

ENTORNO = [
 ["Avenida", "Avenida S", "Limite norte do lote; carrega N=3249290 / N=752144729 (SIRGAS)."],
 ["Avenida", "Avenida T", "Limite sul do lote; carrega N=3139290 / N=752034729 (SIRGAS)."],
 ["Avenida", "Avenida R", "Nomeada na planta chave."],
 ["Avenida", "Avenida Q1", "Nomeada na planta chave, em quatro trechos distintos."],
 ["Avenida", "Avenida O", "Nomeada na planta chave."],
 ["Rua", "Rua 9A", "Corre pelo lado oeste do lote, junto à casa de compressores."],
 ["Rua", "Rua 03 / Rua 04A / Rua 07 / Rua 09 / Rua 09A", "Nomeadas na planta chave."],
 ["Rua", "Rua 21A / Rua 21B / Rua 23 / Rua 23A / Rua 23 - eixo 400", "Nomeadas na planta chave."],
 ["Tubovia", "Tubovia NS01 / NS02 / NS04 / NS05", "Tubovias norte-sul nomeadas na planta chave."],
 ["Tubovia", "Tubovia WE01", "Tubovia leste-oeste, em vários trechos na planta chave."],
 ["Subestação", "SE-5156 / SE-6311", "Subestações nomeadas na planta chave."],
 ["Área reservada", "Área para o skid de gás do F-001",
  "Área prevista para o skid de gás do forno de carga do reator."],
 ["Área reservada", "Área para o skid de gás do F-002",
  "Área prevista para o skid de gás do forno de carga da coluna de vácuo."],
 ["Área reservada", "Caixa de escada para manutenção da ponte rolante",
  "Área prevista para a caixa de escada que atende a manutenção da ponte rolante."],
 ["Área reservada", "Área de laydown dos condensadores",
  "Área de laydown destinada aos condensadores."],
 ["Edificação", "Casa de compressores", "1.369 m², 74,93 × 18,27 m, na extremidade oeste do lote."],
 ["Edificação", "Arranjo de equipamentos - hidroisodesparafinação",
  "9.419 m², a área de processo a céu aberto que ocupa o restante do lote."],
 ["Nível de referência", "+15,50 e +19,15", "Níveis anotados na planta chave."],
 ["Outros", "ULF / PLAT.", "Anotações junto às bombas de carga do reator B-001A/B."],
 ["Outros", "B06 / Canteiro (Área 2)", "Áreas de canteiro nomeadas na planta chave."],
]

PRANCHA = [
 ["Identificação", "Número do documento", DOC],
 ["Identificação", "Revisão", "0 - EMISSÃO ORIGINAL - PARA INFORMAÇÃO, 03/08/2026"],
 ["Identificação", "Título", "LAY-OUT - UNIDADE U-5700 - HIDW / ÁREAS"],
 ["Identificação", "Área", "Unidade de Hidroisodesparafinação U-5700"],
 ["Identificação", "Programa / Cliente", "Refino Boaventura / TR - Boaventura"],
 ["Identificação", "Proprietário do documento", "Petrobras - SRGE/SI-III (classificação INTERNA)"],
 ["Identificação", "Razão social", "Consórcio TEM Boaventura"],
 ["Identificação", "Número do contrato", "ICJ 5900.0131990.25.2"],
 ["Identificação", "Responsável técnico", "Antenor de Castro - CREA 17974D-MG"],
 ["Identificação", "Executou / Verificou / Aprovou", "Luciana Melo / Thiago Oliveira / Francisco Riggio"],
 ["Identificação", "Folha, formato e escala", "01 de 01 - A0 (1189 × 841 mm) - escala 1/250"],
 ["Nota 1", "Unidades", "Coordenadas em milímetros; dimensões e elevações em metros."],
 ["Nota 2", "Sistema de coordenadas",
  "Sistema PDMS, com a seguinte equivalência ao sistema geodésico brasileiro, datum horizontal "
  "SIRGAS 2000: E (PDMS) = 0 m corresponde a E (global) = 714.955,434 m; N (PDMS) = 0 m "
  "corresponde a N (global) = 7.488.954,390 m. Elevação 0,00 (PDMS) = EL. 26,140 acima do nível "
  "do mar - marégrafo de Imbituba, SC."],
 ["Documento de referência", "Arranjo de equipamentos",
  "DE-5400.00-5700-942-TX3-002 - Planta de arranjo de equipamentos - U-5700 - HIDW."],
 ["Elementos gráficos", "Escala gráfica", "Escala gráfica em metros, de -10 a 50 m."],
 ["Elementos gráficos", "Planta chave", "Planta chave com as áreas de intervenção destacadas."],
 ["Elementos gráficos", "Rosa dos ventos", "Indicações NV, VP1, VP2, NE, NP e E."],
 ["Escopo", "Natureza da prancha",
  "Trata-se de um lay-out / plot plan. Fixa posições, elevações e áreas. Não traz quantitativos de "
  "material, dimensões de equipamento nem listas de materiais."],
]

VALIDACOES = [
 ["Áreas", "Área do lote pelas cotas (m²)", round(D.DIM_LOTE_X * D.DIM_LOTE_Y, 2), D.AREA_TOTAL,
  round(D.DIM_LOTE_X * D.DIM_LOTE_Y - D.AREA_TOTAL, 2),
  "148,60 × 72,60 = 10.788,36 m² contra os 10.788 m² impressos no quadro de áreas. Apenas arredondamento."],
 ["Áreas", "Área da casa de compressores pelas cotas (m²)", round(D.DIM_CASA_X * D.DIM_CASA_Y, 2),
  D.AREA_CASA_COMPRESSORES, round(D.DIM_CASA_X * D.DIM_CASA_Y - D.AREA_CASA_COMPRESSORES, 2),
  "74,93 × 18,27 = 1.368,97 m² contra os 1.369 m² impressos. Apenas arredondamento."],
 ["Áreas", "Soma das duas edificações (m²)", D.AREA_CASA_COMPRESSORES + D.AREA_ARRANJO,
  D.AREA_TOTAL, 0,
  "1.369 + 9.419 = 10.788 m², exatamente a área total construída. O quadro de áreas fecha em si mesmo."],
 ["Coordenadas", "Comprimento do lote pelas coordenadas (m)", (D.LOTE_E[1] - D.LOTE_E[0]) / 1000.0,
  D.DIM_LOTE_X, 0,
  "(5076440 - 4927840) mm = 148,60 m, exatamente a linha de cota. Coordenadas e cotas conferem."],
 ["Coordenadas", "Largura do lote pelas coordenadas (m)", (D.LOTE_N[1] - D.LOTE_N[0]) / 1000.0,
  D.DIM_LOTE_Y, 0, "(3237500 - 3164900) mm = 72,60 m, exatamente a linha de cota."],
 ["Coordenadas", "Conversão SIRGAS no eixo E (mm)", 4918040 + D.OFF_E, 719873474, 0,
  "E = 4918040 mm somado aos 714.955,434 m da Nota 2 resulta em 719873474 mm, exatamente o rótulo "
  "SIRGAS impresso na prancha. A conversão da coordenada leste está correta."],
 ["DIVERGÊNCIA", "Conversão SIRGAS no eixo N (mm)", 3139290 + D.OFF_N, 752034729,
  (3139290 + D.OFF_N) - 752034729,
  "A Nota 2 estabelece que N (PDMS) = 0 m corresponde a N (global) = 7.488.954,390 m, de modo que "
  "N = 3139290 mm deveria resultar em 7492093680 mm. A prancha imprime N = 752034729 mm, o que "
  "implica uma constante de 748.895,439 m - exatamente um décimo da que consta na Nota 2. O mesmo "
  "deslocamento aparece no rótulo da Avenida S. As coordenadas norte SIRGAS 2000 nesta região são "
  "da ordem de 7,49 milhões de metros, de forma que a Nota 2 é o valor consistente e os rótulos de "
  "N parecem ter perdido um dígito. CONFIRMAR COM O PROJETISTA."],
 ["Contagem", "Tags na legenda", 66, 66, 0,
  "66 tags distribuídas nos nove títulos da legenda: 2 reatores, 15 vasos, 5 torres, 13 trocadores "
  "casco e tubo, 7 resfriadores a ar, 2 compressores, 17 bombas, 2 fornos e 3 diversos."],
 ["Contagem", "Unidades físicas expandidas pelos sufixos", 94, 94, 0,
  "As 66 tags expandem para 94 unidades físicas: 34 bombas, 19 trocadores casco e tubo, 17 vasos, "
  "7 resfriadores a ar, 5 torres, 4 compressores, 4 diversos, 2 reatores e 2 fornos."],
 ["DIVERGÊNCIA", "Salto na sequência de tags das bombas", 17, 18, -1,
  "A lista de bombas vai de B-001 a B-003 e salta para B-005, seguindo até B-018. A tag B-004 não "
  "aparece em nenhum lugar da prancha. Ou foi excluída do projeto, ou está faltando nesta legenda. "
  "CONFIRMAR COM O PROJETISTA."],
 ["DIVERGÊNCIA", "V-013 e V-014 com a mesma descrição", 2, 1, 1,
  "As duas tags estão impressas como 'VASO DE BLOWDOWN DE CONDENSADO', sem nada que as distinga. "
  "Dois serviços idênticos são plausíveis, mas a redação não dá ao leitor como diferenciá-los. "
  "CONFIRMAR COM O PROJETISTA."],
 ["Redação da legenda", "Entradas impressas em português", 8, 8, 0,
  "A legenda está em inglês, exceto V-011 a V-015 e B-016 a B-018, impressas em português. Nesta "
  "edição em português, as demais descrições são tradução nossa; a coluna 'Idioma na prancha' da "
  "Lista de Equipamentos identifica quais são originais."],
 ["Redação da legenda", "Grafia na legenda", 2, 2, 0,
  "Duas entradas trazem erros de digitação: P-014 aparece como 'REACTOR EFLUENT AIR COOLER' (o "
  "correto seria EFFLUENT) e P-006 como 'VACCUM COLUMN BOTTOMS EXCHANGER' (o correto seria "
  "VACUUM). Ambas estão reproduzidas corretamente nesta planilha."],
 ["Elevações", "Rótulos de elevação", 38, 38, 0,
  "38 rótulos reduzem-se a 28 valores distintos, de EL. 19,250 a EL. 84,590 - um envelope vertical "
  "de 65,34 m. A EL. 36,450 aparece 6 vezes e a EL. 33,155, 4 vezes, o que indica níveis de "
  "plataforma compartilhados entre as estruturas."],
 ["Escopo", "Associação entre elevação e tag", 0, 0, 0,
  "Os rótulos de equipamento em planta são arte vetorial, e não texto selecionável, de modo que as "
  "elevações não podem ser associadas automaticamente a cada tag. Elas estão catalogadas como "
  "níveis. Amarrar cada elevação ao seu equipamento exige leitura visual da prancha ou o arquivo "
  "CAD nativo."],
 ["Escopo", "Natureza da prancha", 0, 0, 0,
  "Esta é uma prancha de lay-out: traz posições, elevações e áreas, não quantitativos de material. "
  "Dimensões, pesos e listas de materiais dos equipamentos devem vir das folhas de dados e da "
  "planta de arranjo DE-5400.00-5700-942-TX3-002."],
]

DESTAQUES = [
 ["Áreas", "O quadro de áreas fecha em si mesmo (m²)", D.AREA_CASA_COMPRESSORES + D.AREA_ARRANJO,
  D.AREA_TOTAL, 0,
  "1.369 + 9.419 = 10.788 m², e 148,60 × 72,60 = 10.788,36 m². Cotas, coordenadas e quadro de "
  "áreas concordam entre si."],
 ["Contagem", "Unidades físicas expandidas pelos sufixos", 94, 94, 0,
  "As 66 tags da legenda expandem para 94 unidades físicas pelos sufixos A/B e A/B/C; só as bombas "
  "respondem por 34 delas."],
 ["DIVERGÊNCIA", "Rótulos SIRGAS do eixo norte (mm)", 3139290 + D.OFF_N, 752034729,
  (3139290 + D.OFF_N) - 752034729,
  "Os rótulos de N implicam uma constante dez vezes menor que a da Nota 2. A Nota 2 é o valor "
  "consistente; os rótulos parecem ter perdido um dígito. Confirmar."],
 ["DIVERGÊNCIA", "Tag B-004 ausente da sequência de bombas", 17, 18, -1,
  "As bombas vão de B-001 a B-003 e depois de B-005 a B-018. A B-004 não aparece na prancha. Confirmar."],
 ["DIVERGÊNCIA", "V-013 e V-014 com a mesma descrição", 2, 1, 1,
  "Ambas trazem 'vaso de blowdown de condensado', sem nada que distinga as duas tags. Confirmar."],
]

LEIAME = [
 ["Objetivo",
  "Transformar a prancha %s (lay-out da unidade de hidroisodesparafinação U-5700) em um cadastro "
  "auditável de equipamentos com painel gerencial, cobrindo todas as tags da legenda e ainda as "
  "áreas, elevações, coordenadas e o entorno impressos na folha." % DOC],
 ["Fonte primária",
  "A legenda de equipamentos da prancha, seu quadro de áreas, as linhas de cota, os rótulos de "
  "coordenada, as notas gerais e o carimbo. Nada aqui vem de fora da folha."],
 ["O que uma prancha de lay-out traz e o que não traz",
  "Esta prancha fixa ONDE cada equipamento fica e em QUE elevação, e quanta área a unidade ocupa. "
  "Não traz dimensões de equipamento, pesos nem quantitativos de material. Para isso, recorra às "
  "folhas de dados e à planta de arranjo DE-5400.00-5700-942-TX3-002, listada como documento de "
  "referência."],
 ["Tags e unidades físicas",
  "Uma tag como B-001A/B representa duas bombas, e P-004A/B/C, três trocadores. A planilha reporta "
  "as duas contagens: 66 tags e 94 unidades físicas. Use tags para documentação e P&ID; use "
  "unidades para suprimentos, montagem e planejamento de manutenção."],
 ["Grupos de processo",
  "A aba 'Grupos de Processo' classifica os equipamentos em seis serviços - reação e circuito de "
  "hidrogênio, fracionamento e vácuo, produtos de óleo básico, diesel, água e efluentes, e "
  "utilidades. Esse agrupamento é uma leitura NOSSA das descrições; a prancha não agrupa os "
  "equipamentos dessa forma. É apoio ao planejamento, não transcrição."],
 ["Elevações",
  "Os 38 rótulos de elevação estão catalogados como níveis distintos na aba 'Elevações'. Eles NÃO "
  "são atribuídos a equipamentos: a prancha desenha os rótulos em planta como arte vetorial, e não "
  "como texto, de modo que uma associação automática seria adivinhação. A EL. 36,450 (6 rótulos) e "
  "a EL. 33,155 (4 rótulos) destacam-se como níveis de plataforma compartilhados."],
 ["Controle crítico",
  "Três pontos estão sinalizados em âmbar na aba Validações: os rótulos SIRGAS do eixo norte "
  "implicam uma constante dez vezes menor que a da Nota 2; a tag B-004 está ausente da sequência "
  "de bombas; e V-013 e V-014 trazem descrições idênticas. Nenhum deles altera a contagem de "
  "equipamentos, mas os três merecem confirmação com o projetista."],
 ["Idioma",
  "A legenda da prancha está em inglês, exceto oito entradas (V-011 a V-015 e B-016 a B-018), "
  "impressas em português. Esta é a edição em português: as descrições em inglês da prancha foram "
  "traduzidas, e a coluna 'Idioma na prancha' identifica quais entradas já eram originalmente em "
  "português. Uma edição em inglês desta mesma planilha é entregue em conjunto."],
 ["Unidades",
  "m = metro; m² = metro quadrado; mm = milímetro; EL. = elevação em metros. As coordenadas estão "
  "em milímetros, conforme a Nota 1. Elevações PDMS convertem-se para o nível do mar somando "
  "26,140 m."],
 ["Limite de uso",
  "Documento de planejamento, orçamento e controle. Qualquer uso para execução ou suprimentos deve "
  "ser validado pelo responsável técnico do projeto."],
]

SPEC = {
 "idioma": "PT", "L": L, "fonte": FONTE,
 "titulo_painel": "PAINEL DE EQUIPAMENTOS - LAY-OUT DA UNIDADE U-5700 DE HIDROISODESPARAFINAÇÃO",
 "subtitulo_painel": ("Prancha %s Rev. 0 (03/08/2026)  |  Refino Boaventura  |  Escala 1/250, "
                      "folha A0  |  Escopo: cadastro de equipamentos, áreas, elevações e entorno" % DOC),
 "areas": AREAS, "entorno": ENTORNO, "prancha": PRANCHA,
 "validacoes": VALIDACOES, "destaques": DESTAQUES, "leiame": LEIAME,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Analise_Layout_Equipamentos_%s_PT.xlsx" % DOC)
    r = CL.gerar(SPEC, saida)
    print("gerado: %s" % r["arquivo"])
    print("tags %d | unidades fisicas %d" % (r["tags"], r["unidades"]))
