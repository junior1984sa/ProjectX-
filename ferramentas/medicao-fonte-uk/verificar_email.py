# -*- coding: utf-8 -*-
"""Verificacao de entregabilidade em 3 camadas:
 1) sintaxe  2) MX no DNS  3) handshake SMTP RCPT TO com remetente nulo
Detecta catch-all sondando um endereco aleatorio no mesmo dominio.
Nao envia DATA — nenhuma mensagem chega a ninguem.
"""
import json, re, smtplib, socket, sys, time, random, string
import dns.resolver

BASE = r"C:\Users\carol\AppData\Local\Temp\claude\C--Users-carol-junior\8b539de1-e54c-48c6-acfb-ae512c927dce\scratchpad\ch"
HELO = "mail.prospectx-oficial.com"
FROM = ""  # remetente nulo (RFC 5321) — padrao para verificacao

res = dns.resolver.Resolver()
res.lifetime = 8.0
res.timeout = 8.0

RE_SINTAXE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,10}$")
cache_mx = {}


def mx(dom):
    if dom in cache_mx:
        return cache_mx[dom]
    try:
        r = sorted([(x.preference, str(x.exchange).rstrip(".")) for x in res.resolve(dom, "MX")])
        out = [h for _, h in r]
    except Exception:
        out = []
    cache_mx[dom] = out
    return out


def sonda(host, enderecos):
    """Abre UMA conexao e testa varios RCPT no mesmo dominio."""
    resultados = {}
    try:
        s = smtplib.SMTP(timeout=20)
        s.connect(host, 25)
        s.helo(HELO)
        s.docmd("MAIL FROM:", f"<{FROM}>")
        for e in enderecos:
            code, msg = s.docmd("RCPT TO:", f"<{e}>")
            resultados[e] = (code, msg.decode("utf-8", "replace")[:120])
            time.sleep(0.5)
        s.quit()
    except Exception as ex:
        for e in enderecos:
            resultados.setdefault(e, (-1, f"{type(ex).__name__}: {ex}"[:120]))
    return resultados


def verificar(dominio, enderecos):
    out = {"dominio": dominio, "mx": [], "catchall": None, "resultados": {}}
    hosts = mx(dominio)
    out["mx"] = hosts[:3]
    if not hosts:
        for e in enderecos:
            out["resultados"][e] = {"status": "SEM_MX", "code": None, "msg": "dominio nao aceita e-mail"}
        return out
    aleatorio = "".join(random.choices(string.ascii_lowercase, k=16)) + "@" + dominio
    r = sonda(hosts[0], list(enderecos) + [aleatorio])
    ca = r.get(aleatorio, (-1, ""))[0]
    out["catchall"] = (ca == 250)
    for e in enderecos:
        code, msg = r.get(e, (-1, "sem resposta"))
        if code == 250 and out["catchall"]:
            st = "CATCH_ALL_INCONCLUSIVO"
        elif code == 250:
            st = "ACEITO"
        elif code in (550, 551, 553, 554):
            st = "REJEITADO"
        elif code in (450, 451, 452, 421):
            st = "TEMPORARIO_OU_GREYLIST"
        else:
            st = "INCONCLUSIVO"
        out["resultados"][e] = {"status": st, "code": code, "msg": msg}
    return out


if __name__ == "__main__":
    entradas = json.load(open(sys.argv[1], encoding="utf-8"))
    por_dom = {}
    for e in entradas:
        e = e.strip().lower()
        if not RE_SINTAXE.match(e):
            print(f"SINTAXE_INVALIDA {e}")
            continue
        por_dom.setdefault(e.split("@")[1], set()).add(e)
    saida = []
    for dom, ends in por_dom.items():
        r = verificar(dom, sorted(ends))
        saida.append(r)
        for e, v in r["resultados"].items():
            print(f"{v['status']:24s} {e:45s} mx={len(r['mx'])} catchall={r['catchall']} code={v['code']} {v['msg'][:60]}")
        sys.stdout.flush()
    json.dump(saida, open(f"{BASE}\\verificacao_email.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
