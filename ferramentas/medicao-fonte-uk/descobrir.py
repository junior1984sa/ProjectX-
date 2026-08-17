# -*- coding: utf-8 -*-
"""
Etapa 2 e 3 da cadeia: descoberta de site por heuristica de nome + extracao
de contato publicado. Nenhuma consulta a motor de busca aqui (heuristica pura),
para medir o PISO da taxa de descoberta.
"""
import json, re, socket, sys, time, threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse
import urllib.robotparser as robotparser
import requests
import dns.resolver

BASE = r"C:\Users\carol\AppData\Local\Temp\claude\C--Users-carol-junior\8b539de1-e54c-48c6-acfb-ae512c927dce\scratchpad\ch"
UA = "ProspectXResearchBot/0.1 (avaliacao de fonte de dados; contato: antoniojunior.plan@gmail.com)"
HDRS = {"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"}

SUFIXOS = {"LTD", "LTD.", "LIMITED", "PLC", "LLP", "LP", "CIC", "UK", "U.K.",
           "COMPANY", "CO", "CO.", "THE", "AND", "&", "GROUP", "HOLDINGS"}
GENERICOS = {"SERVICES", "SERVICE", "SOLUTIONS", "GROUP", "UK", "LONDON",
             "MANCHESTER", "CONSTRUCTION", "TRANSPORT", "LOGISTICS", "TRADING",
             "ENGINEERING", "BUILDING", "BUILDERS", "CONTRACTORS", "SUPPLIES",
             "INTERNATIONAL", "NORTH", "WEST", "PROPERTIES", "DEVELOPMENTS"}
TLDS = [".co.uk", ".com", ".uk", ".ltd.uk", ".org.uk", ".net"]

RE_EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,10}")
RE_TEL = re.compile(r"(?:(?:\+44\s?|0)(?:1\d{3}|2\d|3\d{2}|7\d{3})[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4})")
RE_TAG = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
RE_ANY_TAG = re.compile(r"<[^>]+>")

PARKING = ["this domain is for sale", "buy this domain", "domain for sale",
           "domain parking", "parked domain", "is parked", "godaddy.com/domainsearch",
           "hugedomains", "sedoparking", "this site can", "website coming soon",
           "coming soon", "under construction", "default web site page",
           "namecheap", "future home of", "site not published", "domain name is available"]

LIXO_EMAIL = ("sentry.io", "wixpress.com", "example.com", "domain.com", "email.com",
              "yourdomain", "sentry-next", "@2x", ".png", ".jpg", ".gif", ".webp",
              "@w3.org", "@schema.org", "godaddy.com", "wordpress.org")

resolver = dns.resolver.Resolver()
resolver.lifetime = 5.0
resolver.timeout = 5.0
_lock = threading.Lock()


def tokens(nome):
    n = nome.upper().replace("&", " AND ")
    n = re.sub(r"[^A-Z0-9 ]", " ", n)
    ts = [t for t in n.split() if t and t not in SUFIXOS]
    return ts


def candidatos(nome):
    ts = tokens(nome)
    if not ts:
        return []
    bases = []
    def add(b):
        b = re.sub(r"[^a-z0-9\-]", "", b.lower())
        if 3 <= len(b) <= 40 and b not in bases:
            bases.append(b)
    add("".join(ts))
    add("-".join(ts))
    nucleo = [t for t in ts if t not in GENERICOS] or ts
    add("".join(nucleo))
    add("-".join(nucleo))
    if len(ts) > 1:
        add(ts[0])
    saida = []
    for b in bases[:5]:
        for tld in TLDS:
            saida.append(b + tld)
    return saida


def resolve(dominio):
    """Testa apex e www. Muitos sites britanicos de PME so respondem em www —
    medido: monarchshelving.co.uk nao resolve, www.monarchshelving.co.uk sim."""
    for host in (dominio, "www." + dominio):
        for tipo in ("A", "CNAME"):
            try:
                resolver.resolve(host, tipo)
                return host
            except Exception:
                continue
    return None


def robots_ok(base, caminho="/"):
    try:
        rp = robotparser.RobotFileParser()
        r = requests.get(urljoin(base, "/robots.txt"), headers=HDRS, timeout=8)
        if r.status_code >= 400:
            return True
        rp.parse(r.text.splitlines())
        return rp.can_fetch(UA, urljoin(base, caminho))
    except Exception:
        return True


def baixar(url):
    try:
        r = requests.get(url, headers=HDRS, timeout=14, allow_redirects=True)
        ct = r.headers.get("content-type", "")
        if r.status_code != 200 or "html" not in ct.lower():
            return None
        if len(r.text) < 300:
            return None
        return r
    except Exception:
        return None


def texto(html):
    h = RE_TAG.sub(" ", html)
    h = RE_ANY_TAG.sub(" ", h)
    return re.sub(r"\s+", " ", h)


def parece_parking(txt_low, html_low):
    if len(txt_low) < 500:
        for p in PARKING:
            if p in txt_low or p in html_low:
                return True
        return len(txt_low) < 180
    return any(p in txt_low[:2000] for p in PARKING[:9])


def confirma(emp, html, txt):
    """Evidencia positiva de que o site e DAQUELA empresa."""
    t = txt.upper()
    h = html.upper()
    provas = []
    cep = emp["cep"].replace(" ", "").upper()
    if cep and cep in t.replace(" ", ""):
        provas.append("cep")
    if emp["numero"] and emp["numero"] in h.replace(" ", ""):
        provas.append("numero_ch")
    ts = [x for x in tokens(emp["nome"]) if len(x) >= 4 and x not in GENERICOS]
    if ts:
        achou = sum(1 for x in ts if x in t)
        if achou >= max(1, min(2, len(ts))):
            provas.append(f"nome({achou}/{len(ts)})")
    l1 = re.sub(r"[^A-Z0-9 ]", " ", emp["l1"].upper())
    l1 = re.sub(r"\s+", " ", l1).strip()
    if len(l1) > 8 and l1 in re.sub(r"\s+", " ", t):
        provas.append("endereco")
    return provas


def links_contato(base, html):
    urls = []
    for m in re.finditer(r'href=["\']([^"\']+)["\']', html, re.I):
        h = m.group(1)
        hl = h.lower()
        if any(k in hl for k in ("contact", "contato", "about", "get-in-touch",
                                 "enquir", "reach-us", "find-us")):
            u = urljoin(base, h)
            if urlparse(u).netloc == urlparse(base).netloc and u not in urls:
                urls.append(u)
    return urls[:3]


def limpa_emails(brutos, dominio):
    out = []
    for e in brutos:
        el = e.lower().strip(".,;:")
        if any(x in el for x in LIXO_EMAIL):
            continue
        if len(el) > 70 or el.count("@") != 1:
            continue
        if re.match(r"^[0-9a-f]{16,}@", el):
            continue
        if el not in out:
            out.append(el)
    proprios = [e for e in out if e.split("@")[1].endswith(dominio.replace("www.", ""))
                or dominio.replace("www.", "").split(".")[0] in e.split("@")[1]]
    return out, proprios


def processar(emp):
    r = dict(emp)
    r["dominio"] = None
    r["provas"] = []
    r["emails"] = []
    r["emails_proprios"] = []
    r["telefones"] = []
    r["paginas"] = 0
    r["dns_hits"] = []

    cands = candidatos(emp["nome"])
    resolvidos = []
    for c in cands:
        h = resolve(c)
        if h and h not in resolvidos:
            resolvidos.append(h)
        if len(resolvidos) >= 5:
            break
    r["dns_hits"] = resolvidos

    hosts = []
    for d in resolvidos:
        for h in (d, "www." + d) if not d.startswith("www.") else (d, d[4:]):
            if h not in hosts:
                hosts.append(h)

    for d in hosts:
        for esquema in ("https://", "http://"):
            resp = baixar(esquema + d)
            if not resp:
                continue
            html = resp.text
            txt = texto(html)
            if parece_parking(txt.lower(), html.lower()):
                break
            provas = confirma(emp, html, txt)
            if not provas:
                break
            base = f"{urlparse(resp.url).scheme}://{urlparse(resp.url).netloc}"
            r["dominio"] = urlparse(resp.url).netloc
            r["provas"] = provas
            paginas = [(resp.url, html)]
            for u in links_contato(base, html):
                if not robots_ok(base, urlparse(u).path):
                    continue
                rr = baixar(u)
                if rr:
                    paginas.append((rr.url, rr.text))
                time.sleep(0.4)
            r["paginas"] = len(paginas)
            brutos, tels = [], []
            for _, h in paginas:
                t2 = texto(h)
                brutos += RE_EMAIL.findall(h)
                tels += RE_TEL.findall(t2)
                tels += RE_TEL.findall(h)
            # ── evidencia forte, para medir PRECISAO sem adjudicacao manual ──
            texto_todo = " ".join(texto(h) for _, h in paginas)
            tup = texto_todo.upper()
            ceps_site = sorted(set(
                f"{m.group(1)} {m.group(2)}"
                for m in re.finditer(r"\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s?(\d[A-Z]{2})\b", tup)))
            r["ceps_site"] = ceps_site[:8]
            dist = emp["cep"].split()[0] if " " in emp["cep"] else emp["cep"][:-3]
            r["cep_exato"] = emp["cep"].upper() in [c for c in ceps_site]
            r["cep_distrito"] = any(c.split()[0] == dist for c in ceps_site)
            r["cep_conflitante"] = bool(ceps_site) and not r["cep_distrito"]
            r["menciona_ch"] = bool(re.search(
                r"REGISTERED\s+(IN\s+)?ENGLAND|COMPANIES HOUSE|COMPANY\s+REG", tup))
            todos, proprios = limpa_emails(brutos, r["dominio"])
            r["emails"] = todos[:12]
            r["emails_proprios"] = proprios[:12]
            vistos = []
            for t in tels:
                n = re.sub(r"[^0-9+]", "", t)
                if n.startswith("+44"):
                    n = "0" + n[3:]
                if 10 <= len(n) <= 11 and n not in vistos:
                    vistos.append(n)
            r["telefones"] = vistos[:6]
            break
        if r["dominio"]:
            break
    with _lock:
        sys.stderr.write(".")
        sys.stderr.flush()
    return r


if __name__ == "__main__":
    amostra = json.load(open(f"{BASE}\\amostra.json", encoding="utf-8"))
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=10) as ex:
        res = list(ex.map(processar, amostra))
    print(f"\nconcluido em {time.time()-t0:.0f}s", file=sys.stderr)
    json.dump(res, open(f"{BASE}\\descoberta3.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    n = len(res)
    com_site = sum(1 for r in res if r["dominio"])
    com_mail = sum(1 for r in res if r["emails"])
    com_mail_prop = sum(1 for r in res if r["emails_proprios"])
    com_tel = sum(1 for r in res if r["telefones"])
    print(f"amostra: {n}")
    print(f"site confirmado por heuristica: {com_site} ({com_site/n:.0%})")
    print(f"com e-mail publicado: {com_mail} ({com_mail/n:.0%})")
    print(f"com e-mail do proprio dominio: {com_mail_prop} ({com_mail_prop/n:.0%})")
    print(f"com telefone publicado: {com_tel} ({com_tel/n:.0%})")
