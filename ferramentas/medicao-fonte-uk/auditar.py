# -*- coding: utf-8 -*-
"""Auditoria de PRECISAO: os 35 sites 'confirmados' pela heuristica sao mesmo
da empresa do registro? Recolhe sinais fortes e fracos para adjudicacao."""
import json, re, sys, time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse
import requests

BASE = r"C:\Users\carol\AppData\Local\Temp\claude\C--Users-carol-junior\8b539de1-e54c-48c6-acfb-ae512c927dce\scratchpad\ch"
UA = "ProspectXResearchBot/0.1 (avaliacao de fonte de dados; contato: antoniojunior.plan@gmail.com)"
HDRS = {"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"}
RE_TAG = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
RE_ANY = re.compile(r"<[^>]+>")

# codigos de area fixos de Grande Manchester e cinturao
AREAS_GM = ["0161", "01204", "01254", "01457", "01706", "01925", "01942",
            "01625", "01614", "01695", "01744", "01772", "01524", "01253"]


def texto(h):
    return re.sub(r"\s+", " ", RE_ANY.sub(" ", RE_TAG.sub(" ", h)))


def baixar(u):
    try:
        r = requests.get(u, headers=HDRS, timeout=15, allow_redirects=True)
        if r.status_code == 200 and "html" in r.headers.get("content-type", "").lower():
            return r
    except Exception:
        pass
    return None


def auditar(r):
    d = r["dominio"]
    out = {"nome": r["nome"], "numero": r["numero"], "cep": r["cep"],
           "cidade": r["cidade"], "dominio": d, "sinais": [], "contra": [],
           "url_final": None, "titulo": None, "tam_texto": 0}
    resp = baixar("https://" + d) or baixar("http://" + d)
    if not resp:
        out["contra"].append("site_fora_do_ar_na_reauditoria")
        return out
    paginas = [resp]
    base = f"{urlparse(resp.url).scheme}://{urlparse(resp.url).netloc}"
    for m in re.finditer(r'href=["\']([^"\']+)["\']', resp.text, re.I):
        h = m.group(1).lower()
        if any(k in h for k in ("contact", "about", "legal", "privacy", "terms", "impressum")):
            u = urljoin(base, m.group(1))
            if urlparse(u).netloc == urlparse(base).netloc:
                rr = baixar(u)
                if rr:
                    paginas.append(rr)
                time.sleep(0.3)
        if len(paginas) >= 4:
            break

    html = " ".join(p.text for p in paginas)
    txt = texto(html)
    tl = txt.lower()
    out["url_final"] = resp.url
    mt = re.search(r"<title[^>]*>(.*?)</title>", resp.text, re.S | re.I)
    out["titulo"] = re.sub(r"\s+", " ", mt.group(1)).strip()[:90] if mt else None
    out["tam_texto"] = len(texto(resp.text))

    cep_c = r["cep"].replace(" ", "").upper()
    fora = cep_c[:-3]
    tc = txt.upper().replace(" ", "")
    if cep_c in tc:
        out["sinais"].append("CEP_COMPLETO")
    elif fora and re.search(rf"\b{fora}\s?\d[A-Z]{{2}}\b", txt.upper()):
        out["sinais"].append("CEP_PARCIAL_MESMO_DISTRITO")
    if r["numero"] and re.search(rf"\b0?{int(r['numero']) if r['numero'].isdigit() else r['numero']}\b", txt.replace(" ", "")):
        out["sinais"].append("NUMERO_CH")
    if re.search(r"registered\s+(in\s+)?(england|england and wales|uk)", tl):
        out["sinais"].append("REGISTERED_IN_ENGLAND")
    if re.search(r"(company\s+(reg(istration)?\.?\s*(no|number))|companies house)", tl):
        out["sinais"].append("MENCIONA_COMPANIES_HOUSE")
    if r["cidade"] and r["cidade"].lower() in tl:
        out["sinais"].append("CIDADE_REGISTRADA")
    if "manchester" in tl:
        out["sinais"].append("MANCHESTER")
    tels = set(re.sub(r"[^0-9]", "", t) for t in re.findall(
        r"(?:\+44\s?|0)(?:\d[\s\-]?){9,10}", txt))
    tels = {("0" + t[2:]) if t.startswith("44") else t for t in tels}
    gm = [t for t in tels if any(t.startswith(a) for a in AREAS_GM)]
    if gm:
        out["sinais"].append("TEL_AREA_GM:" + ",".join(sorted(gm)[:3]))
    uk = [t for t in tels if t.startswith(("01", "02", "03", "07", "08")) and len(t) in (10, 11)]
    if uk and not gm:
        out["sinais"].append("TEL_UK_OUTRA_AREA:" + ",".join(sorted(uk)[:3]))
    if re.search(r"\+1\s?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}", txt):
        out["contra"].append("TEL_EUA")
    for p in ("£", "vat no", "vat number", "vat reg"):
        if p in tl:
            out["sinais"].append("MOEDA_OU_VAT_UK")
            break
    for p in ("domain is for sale", "buy this domain", "this domain", "web hosting",
              "domain name", "register your domain", "cheap domains", "you@company.com",
              "lorem ipsum", "your company name"):
        if p in tl[:4000]:
            out["contra"].append("SINAL_DE_PARKING/TEMPLATE:" + p)
            break
    if re.search(r"\b(inc\.|llc|corporation|corp\.)\b", tl) and "ltd" not in tl and "limited" not in tl:
        out["contra"].append("PARECE_EMPRESA_EUA")
    if out["tam_texto"] < 900:
        out["contra"].append("PAGINA_MUITO_CURTA")
    return out


if __name__ == "__main__":
    d = json.load(open(f"{BASE}\\descoberta.json", encoding="utf-8"))
    alvos = [r for r in d if r["dominio"]]
    with ThreadPoolExecutor(max_workers=8) as ex:
        res = list(ex.map(auditar, alvos))
    json.dump(res, open(f"{BASE}\\auditoria.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    for i, a in enumerate(res, 1):
        print(f"{i:2d}. {a['nome'][:38]:38s} {a['dominio'][:28]:28s}")
        print(f"    titulo: {a['titulo']}")
        print(f"    + {a['sinais']}")
        print(f"    - {a['contra']}")
