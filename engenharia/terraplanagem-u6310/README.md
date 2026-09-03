# Memória de Cálculo — Terraplenagem de Implantação dos Tanques

**Área:** U-6310 (Parque de Tanques de Produtos Acabados / Lubrificantes) e U-6312 (UCO)
**Programa:** Refino Boaventura — Cliente TR/Boaventura (Petrobras)
**Executante:** Consórcio TEM Boaventura — Contrato 5900.0131990.25.2
**Disciplina:** Civil / Terraplenagem

---

## 1. Documentos correlacionados

| Documento | Conteúdo aproveitado |
|---|---|
| `DE-5400.00-6310-113-TX3-003` rev.0 (07/08/2026) | Planta da área dos tanques: raios de escavação, cotas, notas gerais e **tabela de quantitativos** (corte e reaterro por linha de tanques) |
| `DE-5400.00-6310-113-TX3-004` rev.0 (07/08/2026) | Cortes A-A a E-E: greide de projeto, terreno regularizado, talude 1:1, sobrelargura de 4,00 m, diques e mini-diques de contenção |
| `IMPORTAÇÃO_TERRAPLAN_TANQUE.xlsx` | Estrutura das 10 fichas de tarefa (FT-CV-2619 a FT-CV-2628), datas programadas, códigos Primavera e critério de partição por tanque |
| Correio de 11/08/2026 (Coord. Eng. Civil) | Reaterro das bases com substituição por rachão → o volume de "reaterro" do desenho é, na prática, bota-fora |

## 2. Modelo geométrico adotado

A escavação sob cada tanque é um **tronco de cone**, entre o terreno regularizado (EL. 19,00) e o
greide de projeto (EL. 17,50), gerado pelo talude de corte 1:1 ao longo de 1,50 m de profundidade:

```
R_fundo = R_costado + 4,00 m          (Nota 4 do desenho — sobrelargura de troca de solo)
R_topo  = R_fundo + 1,50 m            (projeção horizontal do talude 1:1 sobre h = 1,50 m)
V       = (π · h / 3) · (R_fundo² + R_fundo · R_topo + R_topo²)
```

### Verificação da Nota 4

O círculo tracejado "costado do tanque" do TQ-6312824 foi medido no arquivo vetorial da planta em
**R = 14,53 m**. O raio de fundo cotado é R18,53. A diferença é exatamente **4,00 m** — a
sobrelargura da Nota 4. A faixa hachurada em azul mede 1,50 m, igual à projeção do talude 1:1.

### Geometria por linha

| Linha | Tanques | Produto | Espaç. eixos | R fundo | R topo | R costado | Ø tanque | Fonte |
|---|---|---|---|---|---|---|---|---|
| 816 | 816A a D | OB 100N | 29,00 m | 13,71 m | 15,21 m | 9,71 m | 19,42 m | cotado |
| 817 | 817A a D | OB 220N | 29,00 m | 13,71 m | 15,21 m | 9,71 m | 19,42 m | cotado |
| 818 | 818A a D | OB 500/600N | 27,50 m | 12,78 m | 14,28 m | 8,78 m | 17,56 m | aferido |
| 815 | 815A a D | OB 80N | 24,00 m | 10,85 m | 12,35 m | 6,85 m | 13,70 m | cotado |
| 824 | TQ-6312824 | UCO | — | 18,53 m | 20,03 m | 14,53 m | 29,06 m | cotado |

> A linha 818 é a única sem cota de raio na planta. Adotou-se 12,78 m, medido no arquivo vetorial
> (12,77 m) e confirmado pelo volume do desenho com desvio de 0,03%.

## 3. Aferição contra a tabela do desenho

O modelo geométrico reproduz a coluna **REATERRO** da tabela de quantitativos:

| Linha | REATERRO do desenho | Calculado | Desvio |
|---|---:|---:|---:|
| 816 | 3.945,84 m³ | 3.944,82 m³ | −0,03% |
| 817 | 3.947,50 m³ | 3.944,82 m³ | −0,07% |
| 818 | 3.455,05 m³ | 3.454,15 m³ | −0,03% |
| 815 | 2.492,22 m³ | 2.539,93 m³ | +1,91% |
| 824 | 1.756,44 m³ | 1.752,57 m³ | −0,22% |
| **Total** | **15.597,05 m³** | **15.636,28 m³** | **+0,25%** |

A aderência confirma que o **REATERRO do desenho é exatamente o volume escavado sob os tanques**, e
autoriza desagregar o quantitativo por tanque — que é o que a produção precisa.

A linha 815 é o único desvio relevante: nos cortes D-D os espaçamentos são 24,11 / 23,89 / 24,00 m
(não uniformes) e os círculos de topo são truncados pelo limite da plataforma (cotas 11,85 e 11,15
nas extremidades). **Adota-se o valor do desenho**, a favor da segurança.

## 4. Decomposição do corte

| Linha | CORTE total | Troca de solo (tanques) | Plataforma/bacia | % tanques |
|---|---:|---:|---:|---:|
| 816 | 4.100,16 m³ | 3.945,84 m³ | 154,32 m³ | 96,2% |
| 817 | 4.130,06 m³ | 3.947,50 m³ | 182,56 m³ | 95,6% |
| 818 | 3.599,36 m³ | 3.455,05 m³ | 144,31 m³ | 96,0% |
| 815 | 2.649,19 m³ | 2.492,22 m³ | 156,97 m³ | 94,1% |
| 824 | 2.789,14 m³ | 1.756,44 m³ | 1.032,70 m³ | 63,0% |
| **Total** | **17.267,91 m³** | **15.597,05 m³** | **1.670,86 m³** | **90,3%** |

O TQ-6312824 é o único com parcela expressiva de bacia, por ter plataforma bem maior e ponto baixo
em EL. 18,70 (contra 18,90 em U-6310).

## 5. Divergências apuradas na planilha de importação vigente

**5.1 — As bases não são rastreáveis aos desenhos.** Os valores 2.434,25 / 2.464,06 / 2.071,27 /
1.415,86 / 2.235,88 m³ não constam de nenhuma das duas plantas emitidas em 07/08/2026 e não se
obtêm por operação sobre as colunas CORTE ou REATERRO. Representam de 52% a 80% do corte da linha
correspondente, sem proporção constante. Origem provável: quantitativo preliminar, anterior à
emissão rev.0 — coerente com a observação registrada na própria planilha ("o ID usado sofrerá
alterações com a aprovação do Book B").

**5.2 — O fator 0,7 aplica uma segunda redução indevida.** A planilha rateia 70% para "área tanque"
e 30% para "área bacia". Pela geometria do projeto, a escavação sob os tanques responde por **94% a
96%** do corte nas linhas de U-6310, porque a bacia é apenas regularizada (EL. 19,00 → 18,90,
i ≥ 1,5%) enquanto o tanque é escavado 1,50 m. Só o TQ-6312824 se aproxima do rateio adotado
(63% / 37%).

**5.3 — Efeito somado.**

| | Valor |
|---|---:|
| Total lançado nas 10 FTs (planilha vigente) | 10.408,89 m³ |
| Total apurado nesta memória (corte empolado) | 24.175,07 m³ |
| Escopo faltante | 13.766,18 m³ |
| **Cobertura da planilha vigente** | **43,1%** |

## 6. Resumo dos quantitativos

| Item | Serviço | Quantidade |
|---|---|---:|
| 1 | Escavação — corte total (geométrico) | 17.267,91 m³ |
| 1.1 | ⤷ Escavação / troca de solo sob os tanques | 15.597,05 m³ |
| 1.2 | ⤷ Corte de regularização da plataforma e bacia | 1.670,86 m³ |
| 2 | Escavação — volume solto (fator 1,40) | 24.175,07 m³ |
| 2.1 | ⤷ Cenário alternativo (fator 1,30) | 22.448,28 m³ |
| 3 | Bota-fora (volume solto) | 24.175,07 m³ |
| 4 | Rachão para reaterro das bases (in situ) | 15.597,05 m³ |
| 5 | Reaterro e compactação com controle tecnológico | 15.597,05 m³ |

## 7. Ressalvas e pendências

- **Pendência P5 do desenho** (`RL-5400.00-6310-115-TX3-001`): a profundidade de substituição de solo
  será ajustada às condições reais do terreno, com acompanhamento de engenheiro geotécnico (Nota 4).
  Os volumes desta memória valem para a profundidade de projeto de 1,50 m.
- **Fator de empolamento (1,40)** não tem respaldo documental nos desenhos. Deve ser confirmado por
  ensaio ou pela `ET-5400.00-6310-113-TX3-001` antes da medição. O estudo preliminar da equipe usava 1,30.
- **Raio da linha 818** não está cotado na planta — ver item 2.
- **Diques e mini-diques de contenção** aparecem nos cortes A-A a E-E mas não estão discriminados na
  tabela do desenho. Se executados em aterro compactado, devem ser orçados à parte.
- **Não há coluna de aterro** na tabela do desenho. Se parte do corte for reaproveitada em outra
  frente, o bota-fora do item 3 reduz na mesma proporção.
- **Fator de conversão do rachão** (in situ → volume de fornecimento) a definir com o fornecedor.

## 8. Arquivos

| Arquivo | Conteúdo |
|---|---|
| `MC-TERRAPLANAGEM_U-6310_U-6312_Rev0.xlsx` | Memória de cálculo completa — 9 abas, todas as fórmulas abertas e parametrizadas |
| `IMPORTACAO_TERRAPLAN_TANQUE_Rev1-MC.xlsx` | Planilha de importação reemitida com os quantitativos corrigidos, mantendo as 25 colunas originais |
| `gerar_mc.py` / `gerar_import.py` | Scripts geradores — permitem reemitir os arquivos quando o projeto for revisado |

### Abas da memória de cálculo

| Aba | Conteúdo |
|---|---|
| CAPA | Identificação, documentos base, convenção de cores |
| PREMISSAS | Parâmetros de projeto — **alterou aqui, recalcula tudo** |
| GEOMETRIA | Raios e cotas por linha de tanques |
| MC-TANQUE | Volume de escavação tanque a tanque (17 linhas) |
| AFERIÇÃO | Confronto do modelo contra a tabela do desenho |
| QUANT-LINHA | Consolidação por linha: corte, troca de solo, plataforma/bacia |
| DISTRIB-FT | Distribuição pelas 10 fichas de tarefa |
| CONFRONTO-FT | Planilha vigente × memória de cálculo |
| RESUMO | Quantitativos finais e ressalvas |
