# -*- coding: utf-8 -*-
"""
GERADOR DE CONTEÚDO DA PROSPECTX

Transforma o mapa de segmentos do próprio produto em posts prontos para
Instagram. Cada peça sai do dado real — não há texto genérico aqui.

POR QUE ISSO EXISTE
O gargalo do conteúdo nunca é a ferramenta de edição; é decidir o que
dizer. Com 1.187 pares "quem contrata quem", o ProspectX tem assunto
para anos — mas a informação está num arquivo TypeScript, não num
formato que dê para publicar. Este script faz a ponte.

COMO USAR
    python ferramentas/gerar_conteudo.py            → 12 posts
    python ferramentas/gerar_conteudo.py 30         → 30 posts
    python ferramentas/gerar_conteudo.py 30 alta    → só ramos de maior alcance

O resultado sai em ferramentas/conteudo/posts.md, pronto para copiar.

HONESTIDADE
Nenhum texto gerado aqui afirma número de clientes, resultado de
cliente ou prova social. O produto tem zero assinantes, e conteúdo que
finge o contrário custa mais caro que não postar.
"""
import io
import json
import os
import random
import re
import sys
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTE = os.path.join(RAIZ, "src", "types", "prestador.ts")
SAIDA_DIR = os.path.join(RAIZ, "ferramentas", "conteudo")


# ═══════════════════════════════════════════════════════════
# LEITURA DO MAPA
# ═══════════════════════════════════════════════════════════

def carregar_mapa():
    """Extrai o MAPA_SEGMENTOS_CLIENTES direto do código-fonte.

    Ler do TypeScript, e não de uma cópia, garante que o conteúdo nunca
    fica defasado em relação ao produto: se um ramo é adicionado, o
    próximo post já pode falar dele.
    """
    s = io.open(FONTE, encoding="utf-8").read()
    ini = s.index("const MAPA_SEGMENTOS_CLIENTES")
    fim = s.index("\n}\n", ini)
    bloco = s[ini:fim]

    mapa = {}
    for m in re.finditer(r'^\s*"([^"]+)":\s*\[([^\]]*)\]', bloco, re.M | re.S):
        clientes = re.findall(r'"([^"]+)"', m.group(2))
        if clientes:
            mapa[m.group(1)] = clientes
    return mapa


def compradores_ordenados(mapa):
    """Ramos-cliente ordenados por quantos serviços diferentes contratam."""
    c = Counter()
    for clientes in mapa.values():
        for cliente in clientes:
            c[cliente] += 1
    return c


# ═══════════════════════════════════════════════════════════
# FORMATOS DE POST
# ═══════════════════════════════════════════════════════════

def post_quem_contrata(ramo, clientes):
    """Formato A — o carro-chefe. Uma peça por ramo, 312 possíveis.

    O gancho contradiz uma crença que o dono do negócio tem sobre o
    próprio mercado. Quem lê não consegue sair antes de descobrir se
    está no grupo dos que erram o alvo.
    """
    lista = "\n".join("%d. %s" % (i + 1, c) for i, c in enumerate(clientes))
    return {
        "formato": "Quem contrata quem",
        "ramo": ramo,
        "gancho": "Se o seu negócio é %s e você espera o cliente aparecer, está caçando o comprador errado." % ramo,
        "corpo": (
            "Quem realmente contrata %s, em volume e com recorrência:\n\n%s\n\n"
            "Não é o consumidor final. É empresa comprando de empresa."
        ) % (ramo, lista),
        "legenda": (
            "%s — a lista de quem contrata.\n\n"
            "A maioria dos prestadores anuncia para quem passa na rua e ignora "
            "as empresas que assinam contrato. São públicos diferentes, com "
            "ticket diferente e ciclo diferente.\n\n"
            "Salva esse post se você trabalha com %s."
        ) % (ramo.capitalize(), ramo),
        "cta": "Qual desses você nunca abordou? Comenta aí.",
    }


def post_maior_comprador(cliente, quantidade, exemplos):
    """Formato B — o número que viaja além do nicho."""
    amostra = ", ".join(exemplos[:6])
    return {
        "formato": "O maior comprador",
        "ramo": cliente,
        "gancho": "Uma empresa do ramo de %s contrata %d tipos de serviço diferentes." % (cliente.lower(), quantidade),
        "corpo": (
            "Mapeamos %d serviços que %s contrata. Alguns deles:\n\n%s\n\n"
            "Se você presta um desses e não fala com %s, está deixando "
            "dinheiro na mesa."
        ) % (quantidade, cliente.lower(), amostra, cliente.lower()),
        "legenda": (
            "%d tipos de serviço. Esse é o tamanho da carteira de compras "
            "de uma única %s.\n\n"
            "O erro mais comum de quem presta serviço é tratar cada venda "
            "como um evento isolado, quando o mesmo comprador tem orçamento "
            "aberto para dezenas de categorias."
        ) % (quantidade, cliente.lower()),
        "cta": "Você presta algum desses? Comenta que eu digo quantas existem na sua cidade.",
    }


def post_problema_do_nome(ramo, variacoes):
    """Formato E — explica a necessidade do produto sem vender."""
    return {
        "formato": "O problema do nome",
        "ramo": ramo,
        "gancho": "%s. São a mesma empresa." % " · ".join(variacoes),
        "corpo": (
            "A mesma empresa se cadastra de jeitos diferentes em cada lugar.\n\n"
            "É por isso que buscar no mapa não encontra metade do mercado: "
            "você procura por um nome, e metade das empresas usou outro.\n\n"
            "Prospecção séria começa por resolver isso."
        ),
        "legenda": (
            "Quantas formas existem de escrever o mesmo ramo? No nosso "
            "mapeamento, %d termos apontam para o mesmo tipo de negócio — "
            "em três idiomas.\n\n"
            "Quem busca por um só termo perde o resto."
        ) % len(variacoes),
        "cta": "Como o SEU ramo aparece escrito por aí? Comenta as variações.",
    }


# ═══════════════════════════════════════════════════════════
# MONTAGEM DO LOTE
# ═══════════════════════════════════════════════════════════

def gerar(quantidade=12, prioridade=None, semente=None):
    mapa = carregar_mapa()
    compradores = compradores_ordenados(mapa)

    # Ramos com mais tipos de cliente rendem lista mais longa e post
    # mais útil. Com "alta", só eles entram.
    ramos = sorted(mapa.items(), key=lambda kv: -len(kv[1]))
    if prioridade == "alta":
        ramos = [r for r in ramos if len(r[1]) >= 4]

    rnd = random.Random(semente)
    posts = []

    # 1 em cada 5 peças é do formato B, que tem o maior potencial de
    # alcance frio. Mais que isso satura o mesmo número.
    top = compradores.most_common(12)
    for i in range(quantidade):
        if i % 5 == 4 and top:
            cliente, n = top[(i // 5) % len(top)]
            exemplos = [r for r, cs in mapa.items() if cliente in cs]
            rnd.shuffle(exemplos)
            posts.append(post_maior_comprador(cliente, n, exemplos))
        else:
            ramo, clientes = ramos[i % len(ramos)]
            posts.append(post_quem_contrata(ramo, clientes))

    return posts


def escrever_markdown(posts, caminho):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    linhas = [
        "# Lote de conteúdo — ProspectX",
        "",
        "Gerado a partir do mapa de segmentos do produto.",
        "Nenhum número de tração ou depoimento: o produto ainda não tem clientes.",
        "",
        "Cadência recomendada: **3 peças por semana**. Este lote cobre %d semanas." % max(1, len(posts) // 3),
        "",
        "---",
        "",
    ]
    for i, p in enumerate(posts, 1):
        linhas += [
            "## %02d · %s" % (i, p["formato"]),
            "",
            "**Ramo:** %s" % p["ramo"],
            "",
            "### Gancho (primeiros 2 segundos / primeira tela)",
            "> %s" % p["gancho"],
            "",
            "### Corpo (carrossel ou fala do reel)",
            "```",
            p["corpo"],
            "```",
            "",
            "### Legenda",
            p["legenda"],
            "",
            "### Chamada final",
            "%s" % p["cta"],
            "",
            "---",
            "",
        ]
    io.open(caminho, "w", encoding="utf-8").write("\n".join(linhas))


if __name__ == "__main__":
    qtd = int(sys.argv[1]) if len(sys.argv) > 1 else 12
    prio = sys.argv[2] if len(sys.argv) > 2 else None

    posts = gerar(qtd, prio, semente=42)
    destino = os.path.join(SAIDA_DIR, "posts.md")
    escrever_markdown(posts, destino)

    mapa = carregar_mapa()
    total_pares = sum(len(v) for v in mapa.values())
    print("%d posts gerados em %s" % (len(posts), destino))
    print("Base disponivel: %d ramos, %d pares 'quem contrata quem'." % (len(mapa), total_pares))
    print("A %d posts por semana, da para %d semanas sem repetir." % (3, total_pares // 3))
