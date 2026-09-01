# -*- coding: utf-8 -*-
"""DE-5400.00-5700-190-TX3-102 — U-5700 HIDW unit lay-out. English edition."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construtor_layout as CL
import dados_u5700 as D

AQUI = os.path.dirname(os.path.abspath(__file__))
DOC = "DE-5400.00-5700-190-TX3-102"
FONTE = ("Source: drawing %s, Rev. 0 (03/08/2026) - LAY-OUT, UNIT U-5700 HIDW - AREAS. "
         "Hydroisodewaxing Unit, Boaventura Refinery. Scale 1/250, sheet A0 (1189 x 841 mm)." % DOC)

L = {
 "ABA_DASH": "Dashboard", "ABA_LISTA": "Equipment List", "ABA_CAT": "Summary by Category",
 "ABA_GRP": "Process Groups", "ABA_EL": "Elevations", "ABA_AREA": "Areas and Coordinates",
 "ABA_SITE": "Site Context", "ABA_DWG": "Drawing Data", "ABA_VAL": "Validations",
 "ABA_LER": "Read Me",
 "T_LISTA": "EQUIPMENT LIST - FULL TRANSCRIPTION OF THE DRAWING LEGEND",
 "N_LISTA": ("Every tag printed in the drawing legend, in the order it appears. 'Units' is the "
             "number of physical items the tag stands for (A/B = 2, A/B/C = 3). The 'Language on "
             "drawing' column flags the eight entries the legend prints in Portuguese; for those, "
             "the English description below is our translation."),
 "T_CAT": "SUMMARY BY EQUIPMENT CATEGORY",
 "N_CAT": "Tag and unit counts per category, using the legend headings of the drawing.",
 "T_GRP": "PROCESS GROUPS",
 "N_GRP": ("Grouping by process service. This classification is OUR reading of the equipment "
           "descriptions - the drawing does not group equipment this way. It is offered as a "
           "planning aid, not as a transcription."),
 "T_EL": "ELEVATIONS DIMENSIONED ON THE DRAWING",
 "N_EL": ("The 38 elevation labels found on the drawing, reduced to 28 distinct values. The drawing "
          "renders the in-plan equipment labels as vector artwork rather than text, so each "
          "elevation CANNOT be tied to a specific tag automatically - the values are catalogued as "
          "levels, not assigned to equipment. Note 2 sets EL. 0,00 (PDMS) = EL. 26,140 above sea "
          "level (Imbituba tide gauge, SC)."),
 "T_AREA": "AREAS, DIMENSIONS AND COORDINATES",
 "N_AREA": ("Values read from the AREAS TABLE, from the dimension lines and from the coordinate "
            "labels. Rows marked DERIVED are our own arithmetic, shown as cross-checks."),
 "T_SITE": "SITE CONTEXT - ROADS, PIPE RACKS AND RESERVED AREAS",
 "N_SITE": "Streets, avenues, pipe racks and reserved areas named on the drawing.",
 "T_DWG": "DRAWING DATA, TITLE BLOCK AND GENERAL NOTES",
 "N_DWG": "Title block, general notes and linked documents, transcribed from the drawing.",
 "T_VAL": "CONSISTENCY CHECKS",
 "N_VAL": ("Cross-checks between the areas table, the dimension lines and the coordinate labels, "
           "plus editorial observations on the legend. Every divergence is flagged explicitly."),
 "T_LER": "READ ME - U-5700 HIDW LAY-OUT ANALYSIS",
 "H_ITEM": "#", "H_TAG": "Tag", "H_TAGBASE": "Base tag", "H_SUF": "Suffix", "H_UN": "Units",
 "H_CAT": "Category", "H_DESC": "Service description", "H_GRP": "Process group",
 "H_IDI": "Language on drawing", "H_CATPR": "Legend heading", "H_TAGS": "Tags",
 "H_PCTUN": "% of units", "H_PCTTAG": "% of tags", "H_TAGSLIST": "Tags in this set",
 "H_ORD": "#", "H_ELPDMS": "Elevation\n(m, PDMS)", "H_ELMAR": "Elevation\n(m above sea level)",
 "H_OCOR": "Labels on\nthe drawing", "H_ACIMA": "Above lowest\nlevel (m)",
 "H_GRUPO": "Group", "H_ITEMD": "Item", "H_VALOR": "Value", "H_UNID": "Unit", "H_ORIG": "Source",
 "H_TIPO": "Type", "H_IDENT": "Identification", "H_OBS": "Note",
 "H_PARAM": "Field", "H_CONT": "Content transcribed from the drawing",
 "H_IND": "Indicator", "H_CALC": "Calculated", "H_REF": "Reference", "H_DESV": "Deviation",
 "H_CRIT": "Criterion / observation", "H_TOPICO": "Topic",
 "TOTAL": "TOTAL", "W_CATS": "categories", "W_GRPS": "groups", "W_DIV": "DIVERGENCE",
 "IDI_EN": "English", "IDI_PT": "Portuguese (as printed)",
 "C_TAGS": "EQUIPMENT TAGS", "C_TAGS_L": "tags listed in the legend",
 "C_UN": "PHYSICAL UNITS", "C_UN_L": "items counting A/B and A/B/C suffixes",
 "C_AREA": "TOTAL BUILT AREA", "C_AREA_L": "m² per the areas table",
 "C_CAT": "CATEGORIES", "C_CAT_L": "equipment categories in the legend",
 "C_PUMP": "PUMP UNITS", "C_PUMP_L": "largest family: 17 tags in A/B pairs",
 "C_ENV": "VERTICAL ENVELOPE", "C_ENV_L": "m between lowest and highest elevation",
 "C_TOP": "HIGHEST ELEVATION", "C_TOP_L": "m (PDMS) - 110,730 m above sea level",
 "C_GRP": "PROCESS GROUPS", "C_GRP_L": "groups in our classification",
 "S_CAT": "EQUIPMENT BY CATEGORY", "S_GRP": "TAGS BY PROCESS GROUP",
 "S_EL": "ELEVATIONS DIMENSIONED ON THE DRAWING - SOURCE: ELEVATIONS TAB",
 "S_DEST": "CONSISTENCY CHECKS - HIGHLIGHTS",
 "G_UN": "Physical units by category", "G_UN_Y": "units", "G_UN_X": "Category",
 "G_GRP": "Tags by process group",
 "G_EL": "Elevation labels on the drawing", "G_EL_Y": "labels", "G_EL_X": "Elevation (m, PDMS)",
}

AREAS = [
 ["Areas table", "Total built area", D.AREA_TOTAL, "m²", "DRAWING - areas table"],
 ["Areas table", "Compressor house", D.AREA_CASA_COMPRESSORES, "m²",
  "DRAWING - built area per building"],
 ["Areas table", "Equipment arrangement - hydroisodewaxing", D.AREA_ARRANJO, "m²",
  "DRAWING - built area per building"],
 ["Dimension", "Plot length (east-west)", D.DIM_LOTE_X, "m", "DRAWING - dimension line"],
 ["Dimension", "Plot width (north-south)", D.DIM_LOTE_Y, "m", "DRAWING - dimension line"],
 ["Dimension", "Compressor house length", D.DIM_CASA_X, "m", "DRAWING - dimension line"],
 ["Dimension", "Compressor house width", D.DIM_CASA_Y, "m", "DRAWING - dimension line"],
 ["Coordinates (PDMS)", "Plot limit - west (E)", D.LOTE_E[0], "mm", "DRAWING - coordinate label"],
 ["Coordinates (PDMS)", "Plot limit - east (E)", D.LOTE_E[1], "mm", "DRAWING - coordinate label"],
 ["Coordinates (PDMS)", "Plot limit - south (N)", D.LOTE_N[0], "mm", "DRAWING - coordinate label"],
 ["Coordinates (PDMS)", "Plot limit - north (N)", D.LOTE_N[1], "mm", "DRAWING - coordinate label"],
 ["Coordinates (PDMS)", "Site limit - west (E)", 4918040, "mm",
  "DRAWING - E=4918040 / E=719873474 (SIRGAS)"],
 ["Coordinates (PDMS)", "Avenida T - south (N)", 3139290, "mm",
  "DRAWING - N=3139290 / N=752034729 (SIRGAS)"],
 ["Coordinates (PDMS)", "Avenida S - north (N)", 3249290, "mm",
  "DRAWING - N=3249290 / N=752144729 (SIRGAS)"],
 ["Datum (Note 2)", "E (PDMS) = 0 m corresponds to E (global)", 714955.434, "m", "DRAWING - Note 2"],
 ["Datum (Note 2)", "N (PDMS) = 0 m corresponds to N (global)", 7488954.390, "m", "DRAWING - Note 2"],
 ["Datum (Note 2)", "Elevation 0,00 (PDMS) above sea level", D.CONV_NIVEL_MAR, "m",
  "DRAWING - Note 2, Imbituba tide gauge, SC"],
 ["DERIVED", "Plot area from the dimension lines", round(D.DIM_LOTE_X * D.DIM_LOTE_Y, 2), "m²",
  "DERIVED - 148,60 × 72,60; matches the 10.788 m² of the areas table"],
 ["DERIVED", "Compressor house area from the dimension lines",
  round(D.DIM_CASA_X * D.DIM_CASA_Y, 2), "m²",
  "DERIVED - 74,93 × 18,27; matches the 1.369 m² of the areas table"],
 ["DERIVED", "Plot length from the coordinates", (D.LOTE_E[1] - D.LOTE_E[0]) / 1000.0, "m",
  "DERIVED - (5076440 - 4927840) mm; matches the 148,60 m dimension"],
 ["DERIVED", "Plot width from the coordinates", (D.LOTE_N[1] - D.LOTE_N[0]) / 1000.0, "m",
  "DERIVED - (3237500 - 3164900) mm; matches the 72,60 m dimension"],
 ["DERIVED", "Equipment arrangement area (plot minus compressor house)",
  D.AREA_TOTAL - D.AREA_CASA_COMPRESSORES, "m²",
  "DERIVED - 10.788 - 1.369; matches the 9.419 m² of the areas table"],
 ["DERIVED", "Built density", round(D.AREA_TOTAL / 94.0, 1), "m²/unit",
  "DERIVED - total built area divided by the 94 physical units"],
]

ENTORNO = [
 ["Avenue", "Avenida S", "Northern boundary of the plot; carries N=3249290 / N=752144729 (SIRGAS)."],
 ["Avenue", "Avenida T", "Southern boundary of the plot; carries N=3139290 / N=752034729 (SIRGAS)."],
 ["Avenue", "Avenida R", "Named on the key plan."],
 ["Avenue", "Avenida Q1", "Named on the key plan, in four separate stretches."],
 ["Avenue", "Avenida O", "Named on the key plan."],
 ["Street", "Rua 9A", "Runs along the western side of the plot, next to the compressor house."],
 ["Street", "Rua 03 / Rua 04A / Rua 07 / Rua 09 / Rua 09A", "Named on the key plan."],
 ["Street", "Rua 21A / Rua 21B / Rua 23 / Rua 23A / Rua 23 - eixo 400", "Named on the key plan."],
 ["Pipe rack", "Tubovia NS01 / NS02 / NS04 / NS05", "North-south pipe racks named on the key plan."],
 ["Pipe rack", "Tubovia WE01", "East-west pipe rack, in several stretches on the key plan."],
 ["Substation", "SE-5156 / SE-6311", "Substations named on the key plan."],
 ["Reserved area", "Gas skid area for F-001",
  "Area reserved for the reactor feed furnace gas skid ('ÁREA PREVISTA PARA O SKID DE GÁS DO F-001')."],
 ["Reserved area", "Gas skid area for F-002",
  "Area reserved for the vacuum column feed furnace gas skid ('... DO F-002')."],
 ["Reserved area", "Stair box for crane maintenance",
  "Area reserved for the stair enclosure serving overhead crane maintenance "
  "('ÁREA PREVISTA PARA CAIXA DE ESCADA PARA MANUTENÇÃO DA PONTE ROLANTE')."],
 ["Reserved area", "Condenser laydown area",
  "Laydown area for the condensers ('ÁREA DE LAYDOWN DOS CONDENSADORES')."],
 ["Building", "Compressor house", "1.369 m², 74,93 × 18,27 m, at the western end of the plot."],
 ["Building", "Equipment arrangement - hydroisodewaxing",
  "9.419 m², the open process area covering the rest of the plot."],
 ["Reference level", "+15,50 and +19,15", "Levels annotated on the key plan."],
 ["Other", "ULF / PLAT.", "Annotations near the reactor feed pumps B-001A/B."],
 ["Other", "B06 / Canteiro (Área 2)", "Construction site areas named on the key plan."],
]

PRANCHA = [
 ["Identification", "Document number", DOC],
 ["Identification", "Revision", "0 - EMISSÃO ORIGINAL - PARA INFORMAÇÃO (original issue, for information), 03/08/2026"],
 ["Identification", "Title", "LAY-OUT - UNIDADE U-5700 - HIDW / ÁREAS"],
 ["Identification", "Area", "Unidade de Hidroisodesparafinação U-5700 (Hydroisodewaxing Unit)"],
 ["Identification", "Programme / Client", "Refino Boaventura / TR - Boaventura"],
 ["Identification", "Document owner", "Petrobras - SRGE/SI-III (classification INTERNA)"],
 ["Identification", "Company", "Consórcio TEM Boaventura"],
 ["Identification", "Contract number", "ICJ 5900.0131990.25.2"],
 ["Identification", "Technical manager", "Antenor de Castro - CREA 17974D-MG"],
 ["Identification", "Drawn / Checked / Approved", "Luciana Melo / Thiago Oliveira / Francisco Riggio"],
 ["Identification", "Sheet, format and scale", "01 of 01 - A0 (1189 × 841 mm) - scale 1/250"],
 ["Note 1", "Units", "Coordinates in millimetres; dimensions and elevations in metres."],
 ["Note 2", "Coordinate system",
  "PDMS coordinate system, with the following equivalence to the Brazilian geodetic system, "
  "horizontal datum SIRGAS 2000: E (PDMS) = 0 m corresponds to E (global) = 714.955,434 m; "
  "N (PDMS) = 0 m corresponds to N (global) = 7.488.954,390 m. Elevation 0,00 (PDMS) = "
  "EL. 26,140 above sea level - Imbituba tide gauge, SC."],
 ["Reference document", "Equipment arrangement",
  "DE-5400.00-5700-942-TX3-002 - Planta de arranjo de equipamentos - U-5700 - HIDW "
  "(equipment arrangement plan)."],
 ["Graphic elements", "Graphic scale", "Graphic scale in metres, from -10 to 50 m."],
 ["Graphic elements", "Key plan", "Key plan with the intervention areas highlighted."],
 ["Graphic elements", "North arrow", "North arrow with NV, VP1, VP2, NE, NP and E indications."],
 ["Scope", "Nature of the drawing",
  "This is a lay-out / plot plan. It fixes positions, elevations and areas. It carries no material "
  "quantities, no equipment sizes and no bills of material."],
]

VALIDACOES = [
 ["Areas", "Plot area from dimensions (m²)", round(D.DIM_LOTE_X * D.DIM_LOTE_Y, 2), D.AREA_TOTAL,
  round(D.DIM_LOTE_X * D.DIM_LOTE_Y - D.AREA_TOTAL, 2),
  "148,60 × 72,60 = 10.788,36 m² against the 10.788 m² printed in the areas table. Rounding only."],
 ["Areas", "Compressor house area from dimensions (m²)", round(D.DIM_CASA_X * D.DIM_CASA_Y, 2),
  D.AREA_CASA_COMPRESSORES, round(D.DIM_CASA_X * D.DIM_CASA_Y - D.AREA_CASA_COMPRESSORES, 2),
  "74,93 × 18,27 = 1.368,97 m² against the 1.369 m² printed. Rounding only."],
 ["Areas", "Sum of the two buildings (m²)", D.AREA_CASA_COMPRESSORES + D.AREA_ARRANJO,
  D.AREA_TOTAL, 0,
  "1.369 + 9.419 = 10.788 m², exactly the total built area. The areas table closes on itself."],
 ["Coordinates", "Plot length from the coordinates (m)", (D.LOTE_E[1] - D.LOTE_E[0]) / 1000.0,
  D.DIM_LOTE_X, 0,
  "(5076440 - 4927840) mm = 148,60 m, exactly the dimension line. Coordinates and dimensions agree."],
 ["Coordinates", "Plot width from the coordinates (m)", (D.LOTE_N[1] - D.LOTE_N[0]) / 1000.0,
  D.DIM_LOTE_Y, 0,
  "(3237500 - 3164900) mm = 72,60 m, exactly the dimension line."],
 ["Coordinates", "SIRGAS conversion on the E axis (mm)", 4918040 + D.OFF_E, 719873474, 0,
  "E = 4918040 mm plus the 714.955,434 m of Note 2 gives 719873474 mm, exactly the SIRGAS label "
  "printed on the drawing. The easting conversion is correct."],
 ["DIVERGENCE", "SIRGAS conversion on the N axis (mm)", 3139290 + D.OFF_N, 752034729,
  (3139290 + D.OFF_N) - 752034729,
  "Note 2 states N (PDMS) = 0 m corresponds to N (global) = 7.488.954,390 m, so N = 3139290 mm "
  "should read 7492093680 mm. The drawing prints N = 752034729 mm, which implies a constant of "
  "748.895,439 m - exactly one tenth of the one in Note 2. The same shift appears on the Avenida S "
  "label. SIRGAS 2000 northings in this region are around 7,49 million metres, so Note 2 is the "
  "consistent value and the N labels appear to have dropped a digit. TO BE CONFIRMED WITH THE DESIGNER."],
 ["Equipment count", "Tags in the legend", 66, 66, 0,
  "66 tags across the nine legend headings: 2 reactors, 15 vessels, 5 towers, 13 shell-and-tube "
  "exchangers, 7 air coolers, 2 compressors, 17 pumps, 2 furnaces and 3 miscellaneous."],
 ["Equipment count", "Physical units expanded from the tag suffixes", 94, 94, 0,
  "The 66 tags expand to 94 physical units: 34 pumps, 19 shell-and-tube exchangers, 17 vessels, "
  "7 air coolers, 5 towers, 4 compressors, 4 miscellaneous, 2 reactors and 2 furnaces."],
 ["DIVERGENCE", "Gap in the pump tag sequence", 17, 18, -1,
  "The pump list runs B-001, B-002, B-003, then jumps to B-005 and continues to B-018. Tag B-004 "
  "does not appear anywhere on the drawing. Either it was deleted from the design or it is missing "
  "from this legend. TO BE CONFIRMED WITH THE DESIGNER."],
 ["DIVERGENCE", "V-013 and V-014 carry the same description", 2, 1, 1,
  "Both tags are printed as 'VASO DE BLOWDOWN DE CONDENSADO' (condensate blowdown drum), with "
  "nothing distinguishing them. Two identical services are plausible, but the wording gives the "
  "reader no way to tell them apart. TO BE CONFIRMED WITH THE DESIGNER."],
 ["Legend wording", "Entries printed in Portuguese", 8, 8, 0,
  "The legend is in English except for V-011 to V-015 and B-016 to B-018, which are printed in "
  "Portuguese. In this English edition those eight descriptions are our translation; the "
  "'Language on drawing' column of the Equipment List identifies them."],
 ["Legend wording", "Spelling in the legend", 2, 2, 0,
  "Two entries carry typing slips: P-014 reads 'REACTOR EFLUENT AIR COOLER' (should be EFFLUENT) "
  "and P-006 reads 'VACCUM COLUMN BOTTOMS EXCHANGER' (should be VACUUM). Both are reproduced "
  "correctly in this workbook."],
 ["Elevations", "Elevation labels", 38, 38, 0,
  "38 labels reduce to 28 distinct values, from EL. 19,250 to EL. 84,590 - a 65,34 m vertical "
  "envelope. EL. 36,450 appears 6 times and EL. 33,155 4 times, which points to shared platform "
  "levels across the structures."],
 ["Scope", "Elevation to tag association", 0, 0, 0,
  "The in-plan equipment labels are vector artwork, not selectable text, so the elevations cannot "
  "be tied to individual tags automatically. They are catalogued as levels. Tying each elevation "
  "to its equipment requires reading the drawing visually or the native CAD file."],
 ["Scope", "Nature of the drawing", 0, 0, 0,
  "This is a lay-out drawing: it carries positions, elevations and areas, not material quantities. "
  "Equipment dimensions, weights and bills of material must come from the datasheets and from the "
  "equipment arrangement plan DE-5400.00-5700-942-TX3-002."],
]

DESTAQUES = [
 ["Areas", "Areas table closes on itself (m²)", D.AREA_CASA_COMPRESSORES + D.AREA_ARRANJO,
  D.AREA_TOTAL, 0,
  "1.369 + 9.419 = 10.788 m², and 148,60 × 72,60 = 10.788,36 m². Dimensions, coordinates and the "
  "areas table all agree."],
 ["Equipment count", "Physical units expanded from the tag suffixes", 94, 94, 0,
  "The 66 tags in the legend expand to 94 physical units through the A/B and A/B/C suffixes; "
  "pumps alone account for 34 of them."],
 ["DIVERGENCE", "SIRGAS northing labels (mm)", 3139290 + D.OFF_N, 752034729,
  (3139290 + D.OFF_N) - 752034729,
  "The N labels imply a constant ten times smaller than Note 2. Note 2 is the consistent value; "
  "the labels appear to have dropped a digit. Confirm."],
 ["DIVERGENCE", "Tag B-004 missing from the pump sequence", 17, 18, -1,
  "Pumps run B-001 to B-003 then B-005 to B-018. B-004 appears nowhere on the drawing. Confirm."],
 ["DIVERGENCE", "V-013 and V-014 share one description", 2, 1, 1,
  "Both read 'condensate blowdown drum', with nothing distinguishing the two tags. Confirm."],
]

LEIAME = [
 ["Purpose",
  "To turn drawing %s (lay-out of the U-5700 hydroisodewaxing unit) into an auditable equipment "
  "register with a management dashboard, covering every tag in the legend plus the areas, "
  "elevations, coordinates and site context printed on the sheet." % DOC],
 ["Primary source",
  "The equipment legend of the drawing, its areas table, its dimension lines, its coordinate "
  "labels, the general notes and the title block. Nothing here comes from outside the sheet."],
 ["What a lay-out drawing does and does not carry",
  "This drawing fixes WHERE equipment sits and at WHAT elevation, and how much area the unit "
  "occupies. It carries no equipment sizes, no weights and no material quantities. For those, go "
  "to the datasheets and to the equipment arrangement plan DE-5400.00-5700-942-TX3-002, listed as "
  "the reference document."],
 ["Tags versus physical units",
  "A tag such as B-001A/B stands for two pumps and P-004A/B/C for three exchangers. The workbook "
  "reports both counts: 66 tags and 94 physical units. Use tags for documentation and P&ID work, "
  "units for procurement, erection and maintenance planning."],
 ["Process groups",
  "The 'Process Groups' tab classifies the equipment into six services - reaction and hydrogen "
  "circuit, fractionation and vacuum, base oil products, diesel, water and effluents, and "
  "utilities. This grouping is OUR reading of the service descriptions; the drawing does not "
  "group equipment this way. It is a planning aid, not a transcription."],
 ["Elevations",
  "The 38 elevation labels are catalogued as distinct levels in the 'Elevations' tab. They are NOT "
  "assigned to individual equipment: the drawing renders its in-plan labels as vector artwork "
  "rather than text, so an automatic association would be guesswork. EL. 36,450 (6 labels) and "
  "EL. 33,155 (4 labels) stand out as shared platform levels."],
 ["Critical controls",
  "Three points are flagged in amber in the Validations tab: the SIRGAS northing labels imply a "
  "constant ten times smaller than the one in Note 2; tag B-004 is missing from the pump sequence; "
  "and V-013 and V-014 carry identical descriptions. None of them changes the equipment count, but "
  "all three should be confirmed with the designer."],
 ["Language",
  "The drawing legend is in English except for eight entries (V-011 to V-015 and B-016 to B-018), "
  "printed in Portuguese. This is the English edition: those eight descriptions are our "
  "translation, and the 'Language on drawing' column identifies them. A Portuguese edition of this "
  "same workbook is delivered alongside it."],
 ["Units",
  "m = metre; m² = square metre; mm = millimetre; EL. = elevation in metres. Coordinates are in "
  "millimetres per Note 1. PDMS elevations convert to sea level by adding 26,140 m."],
 ["Limits of use",
  "A planning, budgeting and control document. Any use for construction or procurement must be "
  "validated by the project's technical manager."],
]

SPEC = {
 "idioma": "EN", "L": L, "fonte": FONTE,
 "titulo_painel": "EQUIPMENT DASHBOARD - U-5700 HYDROISODEWAXING UNIT (HIDW) LAY-OUT",
 "subtitulo_painel": ("Drawing %s Rev. 0 (03/08/2026)  |  Boaventura Refinery  |  Scale 1/250, A0 "
                      "sheet  |  Scope: equipment register, areas, elevations and site context" % DOC),
 "areas": AREAS, "entorno": ENTORNO, "prancha": PRANCHA,
 "validacoes": VALIDACOES, "destaques": DESTAQUES, "leiame": LEIAME,
}

if __name__ == "__main__":
    saida = os.path.join(AQUI, "Equipment_Layout_Analysis_%s_EN.xlsx" % DOC)
    r = CL.gerar(SPEC, saida)
    print("generated: %s" % r["arquivo"])
    print("tags %d | physical units %d" % (r["tags"], r["unidades"]))
