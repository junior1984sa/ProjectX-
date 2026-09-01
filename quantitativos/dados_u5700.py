# -*- coding: utf-8 -*-
"""Dados transcritos da prancha DE-5400.00-5700-190-TX3-102.

Lay-out da Unidade de Hidroisodesparafinação U-5700 (HIDW), Refino Boaventura.
A lista de equipamentos vem da legenda da prancha; as descrições em inglês são
as impressas no desenho, exceto onde a própria prancha usa português (assinalado
na coluna `idioma`), caso em que a versão inglesa é tradução nossa.
"""

# categorias, na ordem da legenda
CAT = ["REACTORS", "VESSELS", "TOWERS", "EXCH_ST", "EXCH_AC", "COMPRESSORS",
       "PUMPS", "FURNACES", "MISC"]

CAT_EN = {
 "REACTORS": "Reactors", "VESSELS": "Vessels", "TOWERS": "Towers",
 "EXCH_ST": "Exchangers (shell & tube)", "EXCH_AC": "Exchangers (air coolers)",
 "COMPRESSORS": "Compressors", "PUMPS": "Pumps", "FURNACES": "Furnaces",
 "MISC": "Miscellaneous",
}
CAT_PT = {
 "REACTORS": "Reatores", "VESSELS": "Vasos", "TOWERS": "Torres",
 "EXCH_ST": "Trocadores (casco e tubo)", "EXCH_AC": "Trocadores (resfriadores a ar)",
 "COMPRESSORS": "Compressores", "PUMPS": "Bombas", "FURNACES": "Fornos",
 "MISC": "Diversos",
}
# rótulo exato da legenda da prancha
CAT_PRANCHA = {
 "REACTORS": "REACTORS", "VESSELS": "VESSELS", "TOWERS": "TOWER",
 "EXCH_ST": "EXCHANGERS S&T", "EXCH_AC": "EXCHANGER AC", "COMPRESSORS": "COMPRESSORS",
 "PUMPS": "PUMPS", "FURNACES": "FURNACES", "MISC": "MISCELLANEOUS",
}

GRP_EN = {
 "G1": "Reaction and hydrogen circuit",
 "G2": "Fractionation and vacuum system",
 "G3": "Base oil products",
 "G4": "Diesel and light products",
 "G5": "Water and effluents",
 "G6": "Utilities and safety systems",
}
GRP_PT = {
 "G1": "Reação e circuito de hidrogênio",
 "G2": "Fracionamento e sistema de vácuo",
 "G3": "Produtos de óleo básico",
 "G4": "Diesel e produtos leves",
 "G5": "Água e efluentes",
 "G6": "Utilidades e sistemas de segurança",
}

# tag, sufixo, categoria, descrição em inglês, descrição em português, grupo, idioma na prancha
EQUIP = [
 ("R-001", "",       "REACTORS", "Dewaxing reactor", "Reator de desparafinação", "G1", "EN"),
 ("R-002", "",       "REACTORS", "Hydrofinishing reactor", "Reator de hidroacabamento", "G1", "EN"),

 ("V-001", "",       "VESSELS", "Reactor feed surge drum", "Vaso pulmão de carga do reator", "G1", "EN"),
 ("V-002", "",       "VESSELS", "Cold high pressure separator", "Separador frio de alta pressão", "G1", "EN"),
 ("V-003", "",       "VESSELS", "Recycle gas compressor KO drum",
  "Vaso de knock-out do compressor de gás de reciclo", "G1", "EN"),
 ("V-004", "",       "VESSELS", "Injection water drum", "Vaso de água de injeção", "G5", "EN"),
 ("V-005", "",       "VESSELS", "Sour water degasser", "Desgaseificador de água ácida", "G5", "EN"),
 ("V-006", "",       "VESSELS", "Stripper overhead drum", "Vaso de topo da retificadora", "G2", "EN"),
 ("V-007", "",       "VESSELS", "Make-up hydrogen first stage suction drum",
  "Vaso de sucção do 1º estágio de hidrogênio de reposição", "G1", "EN"),
 ("V-008", "A/B",    "VESSELS", "Make-up hydrogen second stage suction drum",
  "Vaso de sucção do 2º estágio de hidrogênio de reposição", "G1", "EN"),
 ("V-009", "A/B",    "VESSELS", "Make-up hydrogen third stage suction drum",
  "Vaso de sucção do 3º estágio de hidrogênio de reposição", "G1", "EN"),
 ("V-010", "",       "VESSELS", "Vacuum column overhead drum (hotwell (Y-001))",
  "Vaso de topo da coluna de vácuo (hotwell (Y-001))", "G2", "EN"),
 ("V-011", "",       "VESSELS", "Blowdown drum", "Vaso de blowdown", "G6", "PT"),
 ("V-012", "",       "VESSELS", "Steam drum", "Vaso de vapor", "G6", "PT"),
 ("V-013", "",       "VESSELS", "Condensate blowdown drum", "Vaso de blowdown de condensado", "G6", "PT"),
 ("V-014", "",       "VESSELS", "Condensate blowdown drum", "Vaso de blowdown de condensado", "G6", "PT"),
 ("V-015", "",       "VESSELS", "Fuel gas knock-out drum", "Vaso de knock-out de gás combustível", "G6", "PT"),

 ("T-001", "",       "TOWERS", "Product stripper", "Retificadora de produto", "G2", "EN"),
 ("T-002", "",       "TOWERS", "Vacuum column", "Coluna de vácuo", "G2", "EN"),
 ("T-003", "",       "TOWERS", "XLN base oil sidecut stripper",
  "Retificadora lateral de óleo básico XLN", "G2", "EN"),
 ("T-004", "",       "TOWERS", "LN base oil sidecut stripper",
  "Retificadora lateral de óleo básico LN", "G2", "EN"),
 ("T-005", "",       "TOWERS", "MN base oil sidecut stripper",
  "Retificadora lateral de óleo básico MN", "G2", "EN"),

 ("P-001", "",       "EXCH_ST", "Feed / LN base oil product exchanger",
  "Trocador carga / produto de óleo básico LN", "G3", "EN"),
 ("P-002", "",       "EXCH_ST", "Feed / MN base oil product exchanger",
  "Trocador carga / produto de óleo básico MN", "G3", "EN"),
 ("P-003", "A/B",    "EXCH_ST", "Feed / LN base oil pumparound exchanger",
  "Trocador carga / refluxo circulante de óleo básico LN", "G3", "EN"),
 ("P-004", "A/B/C",  "EXCH_ST", "DW reactor feed / effluent exchangers",
  "Trocadores carga / efluente do reator de desparafinação", "G1", "EN"),
 ("P-005", "A/B",    "EXCH_ST", "Reactor effluent / CHPS liquid exchangers",
  "Trocadores efluente do reator / líquido do separador frio de alta pressão", "G1", "EN"),
 ("P-006", "",       "EXCH_ST", "Product stripper feed / vacuum column bottoms exchanger",
  "Trocador carga da retificadora / fundo da coluna de vácuo", "G2", "EN"),
 ("P-007", "",       "EXCH_ST", "Stripper overhead trim cooler",
  "Resfriador de acabamento do topo da retificadora", "G2", "EN"),
 ("P-008", "",       "EXCH_ST", "Diesel product trim cooler",
  "Resfriador de acabamento do produto diesel", "G4", "EN"),
 ("P-009", "",       "EXCH_ST", "LN base oil pumparound steam generator",
  "Gerador de vapor do refluxo circulante de óleo básico LN", "G3", "EN"),
 ("P-010", "",       "EXCH_ST", "Vacuum column bottoms steam generator",
  "Gerador de vapor do fundo da coluna de vácuo", "G2", "EN"),
 ("P-011", "A/B",    "EXCH_ST", "Make-up hydrogen first stage intercooler",
  "Interresfriador do 1º estágio de hidrogênio de reposição", "G1", "EN"),
 ("P-012", "A/B",    "EXCH_ST", "Make-up hydrogen second stage intercooler",
  "Interresfriador do 2º estágio de hidrogênio de reposição", "G1", "EN"),
 ("P-013", "",       "EXCH_ST", "Spillback cooler", "Resfriador de spillback (recirculação)", "G1", "EN"),

 ("P-014", "",       "EXCH_AC", "Reactor effluent air cooler",
  "Resfriador a ar do efluente do reator", "G1", "EN"),
 ("P-015", "",       "EXCH_AC", "Stripper overhead air cooler",
  "Resfriador a ar do topo da retificadora", "G2", "EN"),
 ("P-016", "",       "EXCH_AC", "Diesel product air cooler",
  "Resfriador a ar do produto diesel", "G4", "EN"),
 ("P-017", "",       "EXCH_AC", "XLN base oil product air cooler",
  "Resfriador a ar do produto óleo básico XLN", "G3", "EN"),
 ("P-018", "",       "EXCH_AC", "LN base oil product air cooler",
  "Resfriador a ar do produto óleo básico LN", "G3", "EN"),
 ("P-019", "",       "EXCH_AC", "MN base oil product air cooler",
  "Resfriador a ar do produto óleo básico MN", "G3", "EN"),
 ("P-020", "",       "EXCH_AC", "HN base oil product air cooler",
  "Resfriador a ar do produto óleo básico HN", "G3", "EN"),

 ("C-001", "A/B",    "COMPRESSORS", "Recycle gas compressors", "Compressores de gás de reciclo", "G1", "EN"),
 ("C-002", "A/B",    "COMPRESSORS", "Make-up hydrogen compressors",
  "Compressores de hidrogênio de reposição", "G1", "EN"),

 ("B-001", "A/B",    "PUMPS", "Reactor feed pumps", "Bombas de carga do reator", "G1", "EN"),
 ("B-002", "A/B",    "PUMPS", "Injection water pumps", "Bombas de água de injeção", "G5", "EN"),
 ("B-003", "A/B",    "PUMPS", "Sour water degasser pumps",
  "Bombas do desgaseificador de água ácida", "G5", "EN"),
 ("B-005", "A/B",    "PUMPS", "Stripper overhead liquid pumps",
  "Bombas de líquido do topo da retificadora", "G2", "EN"),
 ("B-006", "A/B",    "PUMPS", "Diesel pumps", "Bombas de diesel", "G4", "EN"),
 ("B-007", "A/B",    "PUMPS", "XLN base oil pumpback pumps",
  "Bombas de retorno de óleo básico XLN", "G3", "EN"),
 ("B-008", "A/B",    "PUMPS", "XLN base oil products pumps",
  "Bombas de produto de óleo básico XLN", "G3", "EN"),
 ("B-009", "A/B",    "PUMPS", "LN base oil pumparound pumps",
  "Bombas de refluxo circulante de óleo básico LN", "G3", "EN"),
 ("B-010", "A/B",    "PUMPS", "LN base oil products pumps",
  "Bombas de produto de óleo básico LN", "G3", "EN"),
 ("B-011", "A/B",    "PUMPS", "MN base oil pumpback pumps",
  "Bombas de retorno de óleo básico MN", "G3", "EN"),
 ("B-012", "A/B",    "PUMPS", "MN base oil products pumps",
  "Bombas de produto de óleo básico MN", "G3", "EN"),
 ("B-013", "A/B",    "PUMPS", "Vacuum column bottoms pumps",
  "Bombas de fundo da coluna de vácuo", "G2", "EN"),
 ("B-014", "A/B",    "PUMPS", "Vacuum column slop oil pumps (Y-001)",
  "Bombas de óleo residual da coluna de vácuo (Y-001)", "G2", "EN"),
 ("B-015", "A/B",    "PUMPS", "Vacuum column sour water pumps (Y-001)",
  "Bombas de água ácida da coluna de vácuo (Y-001)", "G2", "EN"),
 ("B-016", "A/B",    "PUMPS", "Blowdown drum pumps", "Bombas do vaso de blowdown", "G6", "PT"),
 ("B-017", "A/B",    "PUMPS", "Pump-out pumps", "Bombas de pump-out", "G6", "PT"),
 ("B-018", "A/B",    "PUMPS", "Condensate pumps", "Bombas de condensado", "G6", "PT"),

 ("F-001", "",       "FURNACES", "Reactor feed furnace", "Forno de carga do reator", "G1", "EN"),
 ("F-002", "",       "FURNACES", "Vacuum column feed furnace",
  "Forno de carga da coluna de vácuo", "G2", "EN"),

 ("FT-001", "A/B",   "MISC", "Feed filter", "Filtro de carga", "G1", "EN"),
 ("Y-001", "",       "MISC", "Vacuum system", "Sistema de vácuo", "G2", "EN"),
 ("Y-002", "",       "MISC", "Feed coalescer", "Coalescedor de carga", "G1", "EN"),
]

# índices
TAG, SUF, CATG, DEN, DPT, GRP, IDI = range(7)


def unidades(suf):
    """Número de equipamentos físicos representados por uma tag (A/B = 2, A/B/C = 3)."""
    return len(suf.split("/")) if suf else 1


def tag_cheia(e):
    return e[TAG] + e[SUF]


# elevações cotadas na prancha (m, referencial PDMS) e quantas vezes cada uma aparece
ELEVACOES = [
 (19.250, 2), (20.300, 1), (20.928, 1), (21.650, 1), (21.850, 1), (22.400, 1),
 (23.830, 1), (24.650, 1), (24.750, 1), (25.350, 1), (25.915, 1), (29.065, 1),
 (29.470, 1), (29.920, 1), (30.410, 1), (30.510, 2), (30.910, 1), (31.890, 1),
 (33.155, 4), (35.590, 1), (36.450, 6), (37.310, 1), (37.790, 1), (38.150, 1),
 (39.090, 1), (44.850, 1), (82.732, 1), (84.590, 1),
]
CONV_NIVEL_MAR = 26.140   # EL. 0,00 (PDMS) = EL. 26,140 (nível do mar) — Nota 2

# quadro de áreas (m²)
AREA_TOTAL = 10788
AREA_CASA_COMPRESSORES = 1369
AREA_ARRANJO = 9419

# dimensões cotadas (m)
DIM_LOTE_X, DIM_LOTE_Y = 148.60, 72.60
DIM_CASA_X, DIM_CASA_Y = 74.93, 18.27

# limites do lote em coordenadas PDMS (mm)
LOTE_E = (4927840, 5076440)
LOTE_N = (3164900, 3237500)

# conversão PDMS -> SIRGAS 2000, conforme a Nota 2 (mm)
OFF_E = 714955434
OFF_N = 7488954390
# constante implícita nos rótulos de N da prancha
OFF_N_ROTULO = 748895439
