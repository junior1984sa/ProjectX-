import zipfile, io, csv, json, random, re, collections, sys

BASE = r"C:\Users\carol\AppData\Local\Temp\claude\C--Users-carol-junior\8b539de1-e54c-48c6-acfb-ae512c927dce\scratchpad\ch"

# Grande Manchester: areas postais totalmente/majoritariamente dentro do
# condado metropolitano. WA fica de fora por cair em parte em Cheshire.
AREAS = ("M", "BL", "OL", "SK", "WN")
RE_AREA = re.compile(r"^(M|BL|OL|SK|WN)\d")

SEGMENTOS = {
    "construcao": ["41201", "41202", "43999", "42110"],
    "transporte": ["49410", "52103", "52290"],
    "manufatura": ["25110", "25620", "25990"],
    "atacado":    ["46730", "46690", "46760"],
}
SIC_ALVO = {c: seg for seg, cs in SEGMENTOS.items() for c in cs}

def sics(row):
    out = []
    for k in ("SICCode.SicText_1", "SICCode.SicText_2", "SICCode.SicText_3", "SICCode.SicText_4"):
        v = (row.get(k) or "").strip()
        if v:
            out.append(v.split(" - ")[0].strip())
    return out

universo = []
addr_counter = collections.Counter()   # densidade de endereco em TODO o arquivo
total_linhas = 0
total_ativas = 0
total_area = 0

for parte in ("part1.zip", "part5.zip"):
    z = zipfile.ZipFile(f"{BASE}\\{parte}")
    nome = z.namelist()[0]
    with z.open(nome) as f:
        t = io.TextIOWrapper(f, encoding="utf-8", errors="replace", newline="")
        r = csv.DictReader(t)
        r.fieldnames = [c.strip() for c in r.fieldnames]
        for row in r:
            total_linhas += 1
            cep = (row.get("RegAddress.PostCode") or "").strip().upper()
            if not RE_AREA.match(cep.replace(" ", "")):
                continue
            total_area += 1
            chave_end = (cep.replace(" ", ""), (row.get("RegAddress.AddressLine1") or "").strip().upper())
            addr_counter[chave_end] += 1
            if (row.get("CompanyStatus") or "").strip() != "Active":
                continue
            total_ativas += 1
            cods = sics(row)
            seg = None
            for c in cods:
                if c in SIC_ALVO:
                    seg = SIC_ALVO[c]
                    break
            if not seg:
                continue
            universo.append({
                "nome": (row.get("CompanyName") or "").strip(),
                "numero": (row.get("CompanyNumber") or "").strip(),
                "segmento": seg,
                "sic": cods,
                "l1": (row.get("RegAddress.AddressLine1") or "").strip(),
                "l2": (row.get("RegAddress.AddressLine2") or "").strip(),
                "cidade": (row.get("RegAddress.PostTown") or "").strip(),
                "cep": cep,
                "categoria": (row.get("CompanyCategory") or "").strip(),
                "incorporacao": (row.get("IncorporationDate") or "").strip(),
                "contas_cat": (row.get("Accounts.AccountCategory") or "").strip(),
                "contas_ult": (row.get("Accounts.LastMadeUpDate") or "").strip(),
                "conf_ult": (row.get("ConfStmtLastMadeUpDate") or "").strip(),
            })
    print(parte, "lido; universo ate agora:", len(universo), file=sys.stderr)

for u in universo:
    u["coabitantes_endereco"] = addr_counter[(u["cep"].replace(" ", ""), u["l1"].upper())]

print("linhas lidas:", total_linhas)
print("com CEP de Grande Manchester (M/BL/OL/SK/WN):", total_area)
print("dessas, ativas:", total_ativas)
print("universo alvo (ativa + SIC B2B alvo):", len(universo))
por_seg = collections.Counter(u["segmento"] for u in universo)
print("por segmento:", dict(por_seg))

random.seed(20260816)
# amostra estratificada: 25 por segmento = 100
amostra = []
for seg in SEGMENTOS:
    pool = [u for u in universo if u["segmento"] == seg]
    amostra += random.sample(pool, min(25, len(pool)))
random.shuffle(amostra)
print("amostra:", len(amostra))

with open(f"{BASE}\\amostra.json", "w", encoding="utf-8") as f:
    json.dump(amostra, f, ensure_ascii=False, indent=1)
with open(f"{BASE}\\universo_stats.json", "w", encoding="utf-8") as f:
    json.dump({"linhas": total_linhas, "area": total_area, "ativas_area": total_ativas,
               "universo": len(universo), "por_segmento": dict(por_seg)}, f, indent=1)
