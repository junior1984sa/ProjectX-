# -*- coding: utf-8 -*-
"""
Extrai as tabelas de coordenadas das estacas dos desenhos de estaqueamento
da U-5700 (Unidade de Hidroisodesparafinação — Refino Boaventura) e grava
em dados.json, no formato consumido por gerar_planilha.py.

Uso:  python3 extrair_coordenadas.py <arquivo.pdf> [saida.json]

Páginas do PDF de referência (greendocs, 5 pranchas):
  1  DE-...-121-TX3-001  Casa de Compressores    ECC-001..064
  2  DE-...-121-TX3-003  Torre T-5700002         E1-T-2..E96-T-2   (sem tabela: calculado)
  3  DE-...-121-TX3-005  Fornos                  EF1-001..016, EF2-001..020
  4  DE-...-121-TX3-006  Prédio e Base Reatores  E*-BR1, E*-BR2, E*-PRE
  5  DE-...-121-TX3-009  Pipe-rack               EPR-001..224      (não utilizado)
"""
import json
import math
import re
import sys

import pymupdf

DATUM_E = 714955.434   # E(PDMS) = 0 m  ->  E(GLOBAL) SIRGAS 2000
DATUM_N = 7488954.390  # N(PDMS) = 0 m  ->  N(GLOBAL) SIRGAS 2000

_NUM = re.compile(r'^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^-?\d+,\d+$|^-?\d+$')


def _isnum(s):
    return bool(_NUM.match(s.strip()))


def _val(s):
    return float(s.replace('.', '').replace(',', '.'))


def ler_tabelas(doc):
    """Varre o texto das pranchas atrás de blocos PONTO + 4 coordenadas.

    O layout das TABELAS DE COORDENADAS é sempre
    PONTO | E (E3D/PDMS) | N (E3D/PDMS) | E (GLOBAL) | N (GLOBAL),
    e o extrator de texto entrega uma célula por linha nessa mesma ordem.
    """
    linhas_por_pagina = [[l.strip() for l in p.get_text().split('\n')] for p in doc]
    achados = []
    for pg, linhas in enumerate(linhas_por_pagina, start=1):
        i = 0
        while i < len(linhas) - 4:
            tag = linhas[i]
            if tag and not _isnum(tag) and all(_isnum(linhas[i + k]) for k in (1, 2, 3, 4)):
                e, n, eg, ng = (linhas[i + k] for k in (1, 2, 3, 4))
                # âncora de sanidade: coordenada global do sítio (UTM SIRGAS 2000)
                if re.match(r'^7[12]\d{4},', eg) and re.match(r'^74\d{5},', ng):
                    achados.append(dict(pagina=pg, tag=tag, e=_val(e), n=_val(n),
                                        eg=_val(eg), ng=_val(ng)))
                    i += 5
                    continue
            i += 1
    return achados


def calcular_torre(doc):
    """Coordenadas das 96 estacas da Torre T-5700002 (prancha sem tabela).

    A prancha traz a malha de locação com passo de 150 cm em escala 1:75 e duas
    chamadas de coordenada. Reconstrói-se a malha a partir dos círculos Ø50
    desenhados e ancora-se nas chamadas; a segunda chamada é usada como
    verificação independente (assert abaixo).
    """
    p = doc[1]
    circulos = [((d['rect'].x0 + d['rect'].x1) / 2, (d['rect'].y0 + d['rect'].y1) / 2)
                for d in p.get_drawings()
                if 400 < d['rect'].x0 < 1150 and 1950 < d['rect'].y0 < 2700
                and 15 < d['rect'].width < 23 and 15 < d['rect'].height < 23]
    etiquetas = []
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                if re.fullmatch(r'E\d+-T-2', t):
                    etiquetas.append((t, (s['bbox'][0] + s['bbox'][2]) / 2,
                                         (s['bbox'][1] + s['bbox'][3]) / 2))
    assert len(circulos) == 96 and len(etiquetas) == 96, (len(circulos), len(etiquetas))

    par = {}
    for t, lx, ly in etiquetas:
        par[t] = min(circulos, key=lambda c: (c[0] - lx) ** 2 + (c[1] - ly) ** 2)
    assert len(set(par.values())) == 96, 'etiqueta sem estaca própria'

    PASSO_PT, PASSO_M = 56.6929, 1.5   # 150 cm a 1:75 = 20 mm = 56,6929 pt
    Y_ANC, E_ANC = 2628.1, 5006.654    # chamada "E=5.006,654" (a prancha está rotacionada:
    X_ANC, N_ANC = 506.34, 3193.930    # E varia com o Y do PDF e N varia com o X)

    def coord(c):
        return (E_ANC + round((Y_ANC - c[1]) / PASSO_PT) * PASSO_M,
                N_ANC - round((c[0] - X_ANC) / PASSO_PT) * PASSO_M)

    # verificação independente: a segunda chamada da prancha
    e2, n2 = coord((789.6, 2344.54))
    assert math.isclose(e2, 5014.154, abs_tol=1e-3) and math.isclose(n2, 3186.430, abs_tol=1e-3), \
        f'âncora não confere: {e2} / {n2} (prancha: 5014.154 / 3186.430)'

    saida = []
    for t, c in par.items():
        e, n = coord(c)
        saida.append(dict(tag=t, e=round(e, 3), n=round(n, 3),
                          eg=round(e + DATUM_E, 3), ng=round(n + DATUM_N, 3)))
    return sorted(saida, key=lambda r: int(r['tag'][1:].split('-')[0]))


def montar(pdf):
    doc = pymupdf.open(pdf)
    tab = ler_tabelas(doc)
    ordem = lambda r: int(re.search(r'(\d+)', r['tag']).group(1))

    def grupo(pagina, padrao):
        sel = [dict(tag=r['tag'], e=r['e'], n=r['n'], eg=r['eg'], ng=r['ng'])
               for r in tab if r['pagina'] == pagina and re.fullmatch(padrao, r['tag'])]
        return sorted(sel, key=ordem)

    dados = {
        'Casa dos Compressores': dict(
            doc='DE-5400.00-5700-121-TX3-001', rev='0', data='15/05/2026',
            titulo='ESTAQUEAMENTO - CASA DE COMPRESSORES - PLANTA E DETALHES',
            fonte='TABELA DE COORDENADAS do desenho',
            grupos=[dict(estrutura='CASA DOS COMPRESSORES (HIDW)', faixa='ECC-001 A ECC-064',
                         diam='Ø 50', qtd=64, arras='EL. +17,20', ponta='EL. +4,00',
                         larm=11.90, lest=13.10, piles=grupo(1, r'ECC-\d+'))]),
        'Fornos': dict(
            doc='DE-5400.00-5700-121-TX3-005', rev='0', data='21/08/2026',
            titulo='ESTAQUEAMENTO - FORNOS F-5700001 & F-5700002',
            fonte='TABELA DE COORDENADAS do desenho (2 tabelas)',
            grupos=[dict(estrutura='FORNO F-5700001', faixa='EF1-001 A EF1-016', diam='Ø 40',
                         qtd=16, arras='EL. +16,95', ponta='EL. +9,25', larm=7.75, lest=8.75,
                         piles=grupo(3, r'EF1-\d+')),
                    dict(estrutura='FORNO F-5700002', faixa='EF2-001 A EF2-020', diam='Ø 50',
                         qtd=20, arras='EL. +16,95', ponta='EL. +9,25', larm=7.75, lest=8.75,
                         piles=grupo(3, r'EF2-\d+'))]),
        'Torre': dict(
            doc='DE-5400.00-5700-121-TX3-003', rev='0', data='12/08/2026',
            titulo='ESTAQUEAMENTO - T-5700002 - PLANTA E DETALHES',
            fonte='CALCULADO da malha do desenho (o desenho nao traz TABELA DE COORDENADAS)',
            grupos=[dict(estrutura='TORRE T-5700002 (radier)', faixa='E1-T-2 A E96-T-2',
                         diam='Ø 50', qtd=96, arras='EL. +16,60', ponta='EL. -0,40',
                         larm=11.90, lest=18.00, piles=calcular_torre(doc))]),
        'Reatores': dict(
            doc='DE-5400.00-5700-121-TX3-006', rev='0', data='04/08/2026',
            titulo='ESTAQUEAMENTO - PRÉDIO E BASE DOS REATORES R-5700001 & R-5700002',
            fonte='TABELA DE COORDENADAS do desenho',
            grupos=[dict(estrutura='BASE REATOR R-5700001', faixa='E1-BR1 A E6-BR1', diam='Ø 50',
                         qtd=6, arras='EL. +18,55', ponta='EL. +7,55', larm=11.90, lest=12.00,
                         piles=grupo(4, r'E\d+-BR1')),
                    dict(estrutura='BASE REATOR R-5700002', faixa='E1-BR2 A E6-BR2', diam='Ø 50',
                         qtd=6, arras='EL. +18,55', ponta='EL. +7,55', larm=11.90, lest=12.00,
                         piles=grupo(4, r'E\d+-BR2')),
                    dict(estrutura='PRÉDIO DOS REATORES', faixa='E1-PRE A E8-PRE', diam='Ø 50',
                         qtd=8, arras='EL. +17,30', ponta='EL. +6,30', larm=11.90, lest=12.00,
                         piles=grupo(4, r'E\d+-PRE'))]),
    }

    for aba, v in dados.items():
        for g in v['grupos']:
            assert len(g['piles']) == g['qtd'], \
                f"{aba} / {g['faixa']}: {len(g['piles'])} estacas lidas, {g['qtd']} esperadas"
            tags = [p['tag'] for p in g['piles']]
            assert len(set(tags)) == len(tags), f'{aba} / {g["faixa"]}: tag duplicada'
        total = sum(len(g['piles']) for g in v['grupos'])
        print(f'{aba:24s} {total:4d} estacas  ' +
              ' + '.join(f"{g['faixa']} ({len(g['piles'])})" for g in v['grupos']))
    return dados


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    saida = sys.argv[2] if len(sys.argv) > 2 else 'dados.json'
    json.dump(montar(sys.argv[1]), open(saida, 'w'), ensure_ascii=False, indent=1)
    print(f'\ngravado em {saida}')
