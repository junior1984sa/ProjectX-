# Encaixes prontos, esperando pagamento

**Data:** 23 de agosto de 2026
**Autor:** engenheiro-dados
**Para que serve este arquivo:** decidir **o que pagar primeiro**. Cada item está construído, testado e desligado. Ligar é definir uma variável de ambiente — não sobra construção.

**Regra de arquitetura cumprida em todos os itens:** a ausência da chave nunca quebra o fluxo. Ela só reduz a taxa de acerto. O sistema roda hoje, inteiro, com custo zero, e reporta em cada registro qual implementação o atendeu.

---

## Resumo para decisão

| # | O que é | Custo | Variável | Ganho esperado | Prioridade |
|---|---|---|---|---|---|
| 1 | **SerpApi** — descoberta de site por busca | US$ 10/mil (Production, US$ 150/mês por 15 mil) | `SERPAPI_KEY` | **é o único item que mexe na taxa final**; a medir, hipótese de 11% → 25-35% | **1ª** |
| 2 | **Verificador de e-mail** (SMTP com IP limpo) | ~US$ 8/mil | `VERIFICADOR_EMAIL_URL` + `VERIFICADOR_EMAIL_KEY` | sobe o nível de `mx_presente` para `verificado`; não muda a quantidade, muda a promessa | 2ª |
| 3 | **API do Companies House** | **grátis** (só cadastro) | `COMPANIES_HOUSE_API_KEY` | atualização diária em vez de mensal | 3ª (gratuita, fazer já) |
| 4 | Índice reverso do Common Crawl por número de registro | grátis em licença, caro em computação | — | desconhecido, precisa medir | 4ª |

**Custo total para ligar 1 e 2, no volume de um assinante (133 registros/mês):** ver seção 5.

---

## 1. SerpApi — descoberta de site por motor de busca

**Estado:** implementado em `pipeline/src/descoberta/serpapi.ts`, desligado por falta de chave.
**Para ligar:** `SERPAPI_KEY=...` e mais nada.

### O que ele resolve

A medição de 23/08/2026 mostrou onde o funil vaza agora:

| Etapa | Resultado |
|---|---|
| Empresas na amostra | 100 |
| Candidatos de domínio avaliados | 383 |
| Sites que passaram na trava de identidade | **11** |
| Precisão | **81,8%** (era 25,7%) |
| Com contato entregável | **10%** |

A trava de identidade consertou a **precisão**. Ela não conserta a **cobertura** — e não tinha como. Se a empresa não tem domínio adivinhável pelo nome, nenhuma regra de validação a encontra. **89 das 100 empresas terminaram sem site**, e a maior parte delas simplesmente não foi encontrada.

O SerpApi ataca exatamente essa perda: ele encontra o site que existe mas cujo domínio não sai do nome.

### Quanto sobe — o que sei e o que não sei

**Não medido.** Na avaliação de 16/08 foram testadas 7 empresas que a heurística tinha perdido, e o motor de busca achou site próprio para 2. **2 de 7 é anedota, não medida** — o intervalo de confiança dessa proporção vai de 4% a 71%, o que não serve para planejar.

O que dá para afirmar: em ambos os casos o site existia e a heurística não o alcançava (`pkshutterservices.co.uk` e `www.monarchshelving.co.uk`), e nos 5 restantes o motor de busca também não achou site — porque não havia site.

**Hipótese de trabalho, a confirmar:** 11% → algo entre 25% e 35% de sites aceitos.

### O teste que precisa ser feito antes de assinar

O plano gratuito do SerpApi dá **250 consultas por mês**. A amostra tem 100 empresas. **O teste cabe no plano gratuito e não custa nada:**

```
SERPAPI_KEY=<chave do plano gratuito> node pipeline/src/cli/medir.ts
```

O comando compara automaticamente com a linha de base e imprime, na linha `QUEM ENTREGOU CADA SITE`, quantos sites vieram da heurística e quantos vieram do SerpApi. **Fazer esse teste antes de pagar qualquer coisa.**

### Licença — por que este e não os concorrentes mais baratos

| Fornecedor | Preço | Situação |
|---|---|---|
| **Brave Search API** | US$ 5/mil | **Descartado.** Os planos padrão não dão direito de armazenar o resultado: *"If you would like to store the API results in part or whole… you will need to subscribe to a plan that explicitly grants storage rights."* É o mesmo problema do Google Places, que já custou uma reescrita |
| **Google Custom Search** | US$ 5/mil | **Descartado.** Fechada para novos clientes; encerra em 01/01/2027 |
| **SerpApi** | US$ 10/mil (Production) | **Escolhido.** Declara "U.S. Legal Shield" de até US$ 2 milhões e modo ZeroTrace a partir do plano Production (US$ 150/mês) |

Os planos menores do SerpApi custam mais por consulta: Starter US$ 25/mil, Developer US$ 15/mil.

---

## 2. Verificador de e-mail com IP limpo

**Estado:** implementado em `pipeline/src/verificacao/pago.ts`, desligado por falta de chave.
**Para ligar:** `VERIFICADOR_EMAIL_URL` + `VERIFICADOR_EMAIL_KEY` + opcionalmente `VERIFICADOR_EMAIL_FORNECEDOR` (`zerobounce`, `neverbounce`, `bouncer` ou `generico`).

### Por que não dá para fazer de graça

Isto não é escolha de arquitetura, é resultado de medição. Em 16/08 foram sondados 28 endereços por SMTP a partir da nossa infraestrutura. **10 (36%) foram recusados por bloqueio contra o NOSSO endereço IP**, não por defeito do endereço:

```
550 5.7.1 Service unavailable, Client host [2804:14d:5c32:51d1::...] blocked
554 The IP address of the sender (186.205.22.231) was found in a [blocklist]
554 5.0.5 ip listed on rbl
```

Rodar SMTP daqui não mede a qualidade do e-mail. Mede a reputação do nosso IP. O resultado seria descartar endereços bons em massa e entregar ao assinante **menos** do que existe.

Por isso o verificador gratuito (`pipeline/src/verificacao/gratuito.ts`) tem teto declarado em `mx_presente` e **nunca devolve `verificado`**.

### O que muda quando ligar

**Não muda a quantidade de contatos. Muda o que se pode prometer sobre eles.**

Hoje os 12 endereços entregues na amostra saem todos como `provavel` / `mx_presente`: o domínio recebe e-mail e o endereço é de papel funcional. Com o verificador pago, cada um passa a ter veredito de caixa: `verificado`, `arriscado_catchall` ou inválido.

### Teto estrutural que nenhum fornecedor resolve

**13% dos domínios com MX medidos são catch-all** — aceitam qualquer destinatário. Neles, o SMTP não distingue endereço bom de inventado, nunca. Precisam sair como `arriscado_catchall`, não como `verificado`. O código já faz isso.

### Preços de referência

Colhidos em comparativos publicados, **não confirmados em página oficial de cada fornecedor** — a página da ZeroBounce não expõe a tabela. Confirmar antes de contratar.

| Fornecedor | Preço por mil |
|---|---|
| ZeroBounce | ~US$ 8 no pré-pago; ~US$ 4 a partir de 250 mil |
| NeverBounce | US$ 8 até 10 mil; US$ 3–4 acima de 100 mil |
| Bouncer | US$ 2–8; US$ 1.000 por 500 mil créditos sem validade |

---

## 3. API do Companies House — **grátis, fazer já**

**Estado:** o snapshot mensal funciona hoje e é a fonte principal. A API é complemento.
**Para ligar:** `COMPANIES_HOUSE_API_KEY` — **cadastro gratuito, sem pagamento**.

| | |
|---|---|
| Custo | **zero** |
| Limite | 600 requisições por 5 minutos (172.800/dia) |
| Ganho | atualização diária em vez de mensal; consulta pontual de empresa |
| Risco de não ter | baixo — o snapshot cobre tudo, com defasagem de até 30 dias |

Não é urgente, mas é gratuito. Não há razão para não ter.

---

## 4. Índice reverso do Common Crawl por número de registro

**Estado:** não implementado. Registrado como caminho conhecido.

As regras de divulgação comercial britânicas obrigam sociedades incorporadas a exibir o número de registro no próprio site. Um índice de páginas britânicas chaveado por esse número daria a ligação nome→domínio com precisão de prova — é o nível mais alto da trava de identidade, obtido para todo o Reino Unido de uma vez.

| | |
|---|---|
| Licença | corpus público, sem restrição comercial |
| Custo de operação | **zero** depois de construído |
| Custo de construção | processamento de arquivos WARC — dezenas a centenas de dólares de computação, e reprocessamento a cada rastreio |
| Cobertura | **desconhecida.** Depende de quantas empresas publicam o número e de quantas o Common Crawl rastreia |

O que já está implementado (`pipeline/src/descoberta/commonCrawl.ts`) é o índice **por URL**, que responde "este domínio existe e servia página?" — útil como filtro, inútil como descobridor. Na medição de 23/08 ele **não contribuiu com nenhum site**: todos os 11 vieram da heurística.

**Recomendação:** só investir aqui depois de medir o SerpApi. Se o SerpApi resolver por US$ 10/mil, construir índice próprio é engenharia sem retorno neste estágio.

---

## 5. A conta, no volume real

Assinante do plano britânico: **£ 77/mês por 133 registros** = **US$ 0,740 de receita por registro entregue**.

Para entregar 133 registros com contato, quantas empresas precisam ser processadas:

| Cenário | Taxa de contato | Empresas a processar | Custo de busca | Custo de verificação | **Custo por registro entregue** | % da receita |
|---|---|---|---|---|---|---|
| **Hoje (tudo grátis)** | 10% (medido) | 1.330 | US$ 0 | US$ 0 | **US$ 0,0007** (só banda) | **0,1%** |
| + SerpApi | 10% | 1.330 | US$ 13,30 | — | US$ 0,100 | 13,5% |
| + SerpApi (se subir a 30%) | 30% (hipótese) | 443 | US$ 4,43 | — | US$ 0,033 | 4,5% |
| + SerpApi + verificador | 30% (hipótese) | 443 | US$ 4,43 | US$ 1,06 | **US$ 0,041** | **5,5%** |

**A margem sobrevive em todos os cenários.** O pior caso testado consome 13,5% da receita por registro.

**O gasto mensal para ligar tudo, com um assinante:** US$ 150 (SerpApi Production) + ~US$ 10 (verificação) ≈ **US$ 160/mês** — que é mais que a receita de um assinante (£ 77 ≈ US$ 98). Com **dois** assinantes já se paga.

**Alternativa para começar:** o plano Starter do SerpApi (US$ 25/mês por 1.000 consultas) processa 1.000 empresas por mês — suficiente para **um** assinante a 13% de taxa. Custa mais por consulta mas cabe no bolso hoje.

---

## 6. O que NÃO está pendente de pagamento, e funciona agora

Para não haver dúvida sobre o que já existe:

| Peça | Arquivo | Estado |
|---|---|---|
| Ingestão do snapshot, idempotente | `pipeline/src/fonte/companiesHouseSnapshot.ts` | **funciona** — 3.896 empresas ingeridas, rodar duas vezes não duplica |
| Leitura de ZIP + CSV sem dependência | `pipeline/src/util/zipcsv.ts` | **funciona** |
| Trava de identidade | `pipeline/src/identidade/trava.ts` | **funciona** — precisão de 25,7% → 81,8% |
| Heurística de domínio | `pipeline/src/descoberta/heuristica.ts` | **funciona** — entregou os 11 sites da medição |
| Índice do Common Crawl | `pipeline/src/descoberta/commonCrawl.ts` | **funciona**, mas não contribuiu |
| Extração de contato, só genérico | `pipeline/src/contato/extrator.ts` | **funciona** |
| Verificação gratuita (sintaxe + MX + descartável) | `pipeline/src/verificacao/gratuito.ts` | **funciona** |
| Armazenamento idempotente | `pipeline/src/armazenamento/jsonl.ts` | **funciona** |
| Autoteste sem rede | `pipeline/src/cli/autoteste.ts` | **40/40 conferências passam** |

Nenhum desses itens precisa de dinheiro. Nenhum deles precisa ser reescrito quando as chaves chegarem.
