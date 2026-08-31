# Estaqueamento U-5700 — planilha de coordenadas e controle

Planilha de locação e controle de execução das estacas da **U-5700 — Unidade de
Hidroisodesparafinação** (Refino Boaventura / Consórcio TEM Boaventura), gerada a
partir das pranchas de estaqueamento em PDF.

**Arquivo:** `Estaqueamento_U-5700_Coordenadas.xlsx`

## Abas

| Aba | Estruturas | Tags | Estacas |
|---|---|---|---|
| Casa dos compressores | Casa dos Compressores (HIDW) | `ECC-001` … `ECC-064` | 64 |
| Fornos | F-5700001 / F-5700002 | `EF1-001`…`EF1-016`, `EF2-001`…`EF2-020` | 36 |
| Torre | T-5700002 (radier) | `E1-T-2` … `E96-T-2` | 96 |
| Reatores | Base R-5700001, Base R-5700002, Prédio | `E*-BR1`, `E*-BR2`, `E*-PRE` | 20 |
| | | **Total** | **216** |

Há ainda uma aba `Resumo` com o inventário, o datum, o avanço consolidado
(fórmulas que leem as 4 abas), a legenda de preenchimento e as notas.

## Colunas de cada aba

Coordenadas (dos desenhos, não editar): `PONTO (TAG)` · `ESTRUTURA` ·
`E/N (E3D/PDMS)` · `E/N (GLOBAL) SIRGAS 2000` · `CONF. DATUM` (fórmula de
conferência) · `Ø` · `COTA DE ARRAS.` · `COMPR.`

Controle de execução (preenchimento manual — células amarelas com texto azul),
com **STATUS + DATA** para cada etapa:
`TERRAPLANAGEM` · `ESTAQUEAMENTO` · `PIT` · `ARRASAMENTO`, mais `% CONCL.`
(fórmula) e `OBSERVAÇÕES`.

STATUS é lista suspensa: `NÃO INICIADO` · `EM ANDAMENTO` · `CONCLUÍDO` · `N/A`,
com formatação condicional por cor.

## Sistema de coordenadas

Sistema PDMS (E3D/NAVIS), com equivalência para o Sistema Geodésico Brasileiro,
datum horizontal **SIRGAS 2000**, conforme nota geral das pranchas:

```
E (PDMS) = 0 m  ->  E (GLOBAL) = 714.955,434 m
N (PDMS) = 0 m  ->  N (GLOBAL) = 7.488.954,390 m
Elevação 0,00 (PDMS) = EL. 26,14 (nível do mar) - marégrafo de Imbituba/SC
```

## Desenhos de origem

| Prancha | Documento | Rev. | Data |
|---|---|---|---|
| Casa de Compressores | `DE-5400.00-5700-121-TX3-001` | 0 | 15/05/2026 |
| Torre T-5700002 | `DE-5400.00-5700-121-TX3-003` | 0 | 12/08/2026 |
| Fornos | `DE-5400.00-5700-121-TX3-005` | 0 | 21/08/2026 |
| Prédio e Base dos Reatores | `DE-5400.00-5700-121-TX3-006` | 0 | 04/08/2026 |
| Pipe-rack (não utilizado) | `DE-5400.00-5700-121-TX3-009` | 0 | 06/07/2026 |

O PDF de origem não é versionado aqui — é documento de propriedade da Petrobras.

## Observações importantes

1. **PCE não entra** — as estacas do PCE serão definidas pela Engenharia.
2. **Torre T-5700002** — a prancha `-003` **não traz TABELA DE COORDENADAS**. As
   coordenadas das 96 estacas foram calculadas a partir da malha do desenho
   (passo de 150 cm, esc. 1:75), ancorada nas duas chamadas de coordenada da
   planta. A segunda chamada (`E=5.014,154 / N=3.186,430`) é usada como
   verificação independente da âncora — o script falha se não conferir.
   Ainda assim, **confirmar com a Projetista antes da locação em campo**.
3. **Reatores** — as coordenadas globais tabeladas na prancha `-006` divergem em
   até 9 mm de `PDMS + datum`, por arredondamento do próprio desenho (que usa
   `714.955,43 / 7.488.954,39`). Foram mantidos os valores originais do desenho.
4. O **pipe-rack** (`EPR-001`…`EPR-224` e `PT1`…`PT5`, prancha `-009`) existe no
   PDF mas não foi solicitado, e por isso não está na planilha.

## Regerar a planilha

```bash
pip install pymupdf openpyxl
python3 extrair_coordenadas.py caminho/para/pranchas.pdf dados.json
python3 gerar_planilha.py dados.json Estaqueamento_U-5700_Coordenadas.xlsx
```

O extrator confere a quantidade de estacas de cada grupo contra a LEGENDA das
pranchas e aborta se algum grupo vier incompleto ou com tag duplicada.
