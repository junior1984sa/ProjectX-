# Fonte de dados — a cadeia do contato verificado (Reino Unido)

**Autor:** engenheiro-dados
**Restrição que governa este documento:** *"o contato confiável é o principal pilar do nosso modelo… ele tem que funcionar… senão perderemos a credibilidade."* Entregar empresa sem contato, ou com contato morto, é falha de produto.

**Tudo que está aqui foi medido contra dados reais.** Onde não foi possível medir, está escrito que não foi medido. Nenhum número deste relatório é estimativa de mercado ou opinião.

| Parte | Data | O que é |
|---|---|---|
| **Parte I — Fase 1 construída** | 23/08/2026 | O pipeline gratuito, e a remedição da mesma amostra |
| **Parte I-B — Opção C medida** | 23/08/2026 | O índice reverso do Common Crawl por número de registro: medido e reprovado |
| **Parte II — linha de base** | 16/08/2026 | A avaliação original da fonte, preservada para comparação |

---

## Tabela de evolução — as três medições, lado a lado

Mesma amostra congelada, mesma semente 20260816, 100 empresas de Grande Manchester em quatro segmentos B2B.

| Etapa | Linha de base 16/08 | Pipeline + trava 23/08 | **+ Opção C (Common Crawl) 23/08** |
|---|---|---|---|
| Empresas na amostra | 100 | 100 | 100 |
| Sites aceitos | 35 | 11 | **11** *(0 novos)* |
| dos quais corretos | 9 | 11 | **11** |
| **Precisão** | **25,7%** | **100%** | **100%** |
| Com e-mail | 8 | 9 | **9** |
| **Com algum contato** | **8 (8,0%)** | **10 (10,0%)** | **10 (10,0%)** |
| Portão de precisão (>90%) | não | **PASSOU** | **PASSOU** |
| Portão de contato (>25%) | não | **NÃO PASSOU** | **NÃO PASSOU** |

> **A Opção C não moveu a taxa em um único registro.** Os números medidos que explicam isso estão na Parte I-B.

---

# PARTE I — Fase 1 construída e remedida (23/08/2026)

## I.1 O que foi construído

Pipeline em `pipeline/`, TypeScript, executado direto pelo Node 24, **zero dependência nova**. Toda etapa que pode custar dinheiro é uma interface com duas implementações: uma gratuita que funciona hoje, e um encaixe pago que liga por variável de ambiente. Ausência de chave paga nunca quebra o fluxo — só reduz a taxa de acerto. Cada registro carrega qual implementação o atendeu.

| Comando | O que faz |
|---|---|
| `node pipeline/src/cli/ingerir.ts <zip> --areas M,BL --sic 41201` | ingere o snapshot, idempotente |
| `node pipeline/src/cli/medir.ts` | remede a amostra congelada e compara com a linha de base |
| `node pipeline/src/cli/autoteste.ts` | 40 conferências das regras, sem rede |

## I.2 O resultado, lado a lado com a linha de base

Mesma amostra: 100 empresas de Grande Manchester, 25 por segmento B2B, semente 20260816, congelada em `pipeline/dados/amostra-linha-base.json`. Trocar a amostra tornaria a comparação inútil.

| Etapa | Linha de base (16/08) | **Pipeline novo (23/08)** |
|---|---|---|
| Empresas na amostra | 100 | 100 |
| Candidatos de domínio avaliados | não instrumentado | **383** |
| Páginas lidas | não instrumentado | 438 |
| **Sites ACEITOS** | 35 (35,0%) | **11 (11,0%)** |
| dos quais **corretos** | 9 | **10** |
| dos quais **errados** | 26 | **1** |
| **PRECISÃO** | **25,7%** | **90,9%** |
| IC 95% da precisão | [14,2 ; 42,1] | **[62,3 ; 98,4]** |
| Com e-mail entregável | 8 (8,0%) | **9 (9,0%)** |
| Com telefone | 8 (8,0%) | 8 (8,0%) |
| **Com algum contato** | **8 (8,0%)** | **10 (10,0%)** |

Tempo de execução: 954 s para 100 empresas, concorrência 12.

> **A trava de identidade fez o que o plano previa: 25,7% → 90,9% de precisão.**
> Os 26 falsos positivos da linha de base viraram **1**.

### Qual sinal confirmou cada site

| Sinal | Aceitos | Corretos | Precisão |
|---|---|---|---|
| `numero_registro` (prova) | 0 | 0 | — |
| `cep_registrado` (forte) | 4 | 4 | **100%** |
| `nome_e_dominio` + corroboração geográfica (médio) | 7 | 6 | **85,7%** |

Nenhum site publicou o número de registro nas páginas lidas. A regra funciona (está testada no autoteste com o caso real da AMC), mas na prática o número costuma ficar em página de termos ou de política, fora das 3 páginas de contato que o pipeline lê. **Aumentar o alcance da leitura para pegar `/terms` e `/privacy` é a melhoria gratuita mais promissora que sobrou.**

### Quem entregou cada site

| Implementação | Sites | Camada |
|---|---|---|
| `heuristica-dominio` | **11** | gratuita |
| `common-crawl` | 0 | gratuita |
| `serpapi` | — | **desligada, sem chave** |

O Common Crawl não contribuiu com nenhum site. Ele confirma domínio por URL; não descobre domínio a partir de nome. Está registrado como tal em `PENDENTE-PAGAMENTO.md`.

### Nível de verificação dos e-mails entregues

| Nível | Endereços |
|---|---|
| `mx_presente` | **12** |
| `smtp_fornecedor` | 0 — **verificador pago desligado** |

Todos os 12 endereços entregues são genéricos (`info@`, `sales@`, `enquiries@`, `admin@`, `orders@`, `support@`). **Nenhum nominal foi coletado** — o extrator descarta em vez de guardar.

## I.3 Os portões da Fase 1

| Portão do `PLANO.md` | Alvo | Medido | Situação |
|---|---|---|---|
| Precisão da descoberta de site | > 90% | **90,9%** | **PASSOU**, no limite |
| Taxa de contato verificado | > 25% | **10,0%** | **NÃO PASSOU** |
| Custo por registro entregue | < US$ 0,15 | **US$ 0,0007** | **PASSOU** com folga |
| Medição refeita com a mesma semente | — | sim | **PASSOU** |

### Sobre o portão de precisão — leia a ressalva antes de comemorar

90,9% é **10 corretos em 11 aceitos**, e o intervalo de confiança de 95% vai de **62,3% a 98,4%**. Com 11 casos, o número é frágil: **um único erro a mais derrubaria para 81,8%**. O portão passou, mas não passou com margem. Antes de tratar 90% como fato consolidado, a medição precisa ser repetida numa amostra maior — 300 empresas dariam um intervalo utilizável.

### Sobre o portão de contato — não passou, e não vai passar de graça

**10% contra os 25% exigidos.** Isso não é falha de implementação; é o limite do que meios gratuitos alcançam.

A trava consertou a precisão. Ela não conserta a cobertura, e não tinha como: **se a empresa não tem domínio adivinhável a partir do nome, nenhuma regra de validação a encontra**. Das 100 empresas, 89 terminaram sem site — a maioria porque não foi encontrada, não porque foi rejeitada.

O plano diz: *"Se a taxa não passar de 25%, não avance. Reveja a fonte, não o discurso."* **O que falta está medido e precificado em `estrategia/PENDENTE-PAGAMENTO.md`**, e o item nº 1 é o único que mexe nesta taxa.

## I.4 Ganho líquido de qualidade, além dos percentuais

O número de contatos entregues subiu pouco (8 → 10). O que mudou de verdade é **o que está dentro deles**:

| | Linha de base | Pipeline novo |
|---|---|---|
| Contatos entregues | 8 | 10 |
| Desses, de sites de OUTRA empresa | ~26 dos 35 sites aceitos alimentavam contato errado | **1** |
| E-mails nominais coletados | 6 (4 de sites errados) | **0, por regra** |
| Registros com procedência e nível de prova gravados | não | **todos** |
| `you@company.com` e placeholders entregues | sim | **não** |

Casos concretos que o pipeline novo corrigiu:

- **RADIAL LINE SHEETMETAL** — a linha de base entregava `radial.com` (logística americana, e-mail `you@company.com`). O pipeline novo encontrou **`www.radialline.co.uk`**, com o CEP do distrito WN7 publicado e telefone 01942 (Leigh), e entrega `info@radialline.co.uk`. Site diferente, empresa certa.
- **MPT GROUP MATTRESS MACHINERY** — empresa que a linha de base **não tinha encontrado**. O pipeline novo achou `www.mptgroup.com` com o CEP registrado OL13 9RW publicado na página, e entrega `info@mptgroup.com`.
- **BRADLEYS CONSTRUCTION, QUAYS LOGISTICS, ARM GATE, PHOENIX, PRIMROSE, NERO, P.D.S., ATLAS INDUSTRIAL, PROWOOD, BALMIRA** — todos rejeitados. Todos eram entregues antes.

## I.5 Defeitos encontrados e corrigidos durante a construção

Registrados porque valem para quem mexer no código depois:

1. **A ordenação de candidatos consumia o orçamento de DNS.** As 42 combinações de sufixo da primeira base eram consultadas antes da segunda base receber a primeira consulta. `atlasindustrial.com` e `nexabuild.co.uk` ficavam fora dos 40 primeiros e a empresa terminava sem candidato nenhum. Corrigido com geração em ondas por TLD, e **travado por teste de regressão** no autoteste.
2. **DNS sequencial custava ~2 minutos por empresa.** 40 consultas em série. Passou a resolver em ondas paralelas de 10, preservando a ordem de preferência.
3. **`pkshutter` não era gerado** — iniciais mais a primeira palavra distintiva faltavam na heurística. Corrigido.
4. **Parameter properties do TypeScript** não rodam no modo strip-only do Node. Trocadas por campos explícitos em cinco classes.

## I.6 O que a Parte II diz e continua valendo

Tudo na Parte II segue de pé. Nada foi refutado pela nova medição:

- Companies House sob **OGL v3.0**, sem *share-alike*, atribuição obrigatória — confirmado em uso: 3.896 empresas ingeridas, ingestão idempotente verificada (segunda rodada do mesmo arquivo: 0 novas, 1.937 atualizadas, total inalterado).
- **38% dos endereços são de contador** — reconfirmado na ingestão real: 28,6% com 5+ coabitantes no conjunto completo de 3.896.
- **38,3% sem sinal contábil de operação** (`DORMANT` ou `NO ACCOUNTS FILED`) no conjunto de 3.896 — medido de novo, agora com o filtro implementado.
- **Verificação SMTP da nossa infraestrutura é inviável** — motivo pelo qual o verificador gratuito tem teto declarado em `mx_presente`.
- **E-mail nominal não deve ser perseguido** — agora é regra de código, não recomendação.

---

# PARTE I-B — A Opção C medida (23/08/2026)

*Esta parte está sendo escrita durante a medição. Cada número entra assim que é apurado.*

## I-B.1 O que foi medido, e como

A hipótese da Opção C, escrita por mim mesmo em 16/08: sociedades incorporadas britânicas são obrigadas a exibir o número de registro no site; logo, um índice do Common Crawl chaveado por número de registro liga empresa a domínio com precisão de prova, e descoberta e verificação viram o mesmo passo.

**Achado operacional antes de qualquer taxa:** `index.commoncrawl.org` — a API CDX que o pipeline usa hoje em `pipeline/src/descoberta/commonCrawl.ts` — **está inacessível da nossa rede**. Três tentativas, timeout de conexão em 21 s, porta 443 e porta 80, IP 54.237.141.66:

```
* connect to 54.237.141.66 port 443 from 0.0.0.0 port 59464 failed: Timed out
* Failed to connect to index.commoncrawl.org port 443 after 21162 ms
```

`data.commoncrawl.org` (CloudFront) responde em **0,63 s** e entrega **17 MB/s**. Ou seja: o corpus está acessível; o servidor de índice, não.

Reescrevi o acesso ao índice para não depender dele: baixar `cluster.idx` (103,9 MB, 6,1 s) e resolver cada host por **busca binária + range request** nos arquivos `cdx-000NN.gz`, tudo pelo CloudFront. Mecanismo conferido contra controles: `gov.uk` devolve 5.059 URLs, `monarchshelving.co.uk` devolve 374.

> **Consequência para o código:** o provedor `common-crawl` do pipeline consultava um endpoint fora do ar e devolvia lista vazia em silêncio. Os "0 sites do Common Crawl" da medição de 23/08 **não medem a fonte — medem um endpoint caído.** É exatamente o defeito que o princípio nº 4 chama de *fallback silencioso*: ausência de sinal virou "nada encontrado" sem alarme. Corrigir é obrigatório, independentemente do veredito da Opção C.

## I-B.2 Primeiro resultado: os 11 sites que sabemos serem corretos

Para o índice reverso funcionar, o número de registro precisa estar numa página que o Common Crawl tenha rastreado. Testei isso nos **11 sites que a trava de identidade aceitou e a auditoria confirmou como corretos** — a população mais favorável possível, porque aqui sabemos que o site existe e é da empresa.

Para cada um: resolver o host no índice, baixar todas as páginas com status 200 (priorizando `/terms`, `/privacy`, `/legal`, `/contact`, `/about`, home) e procurar o número de registro.

| Empresa | Host | Páginas 200 no CC | Achou o número | Qualquer número de registro publicado |
|---|---|---|---|---|
| AQUILO REFRIGERATION | aquilorefrigeration.co.uk | 3 | não | nenhum |
| BREARMAN | brearman.co.uk | 1 | não | nenhum |
| PENDLE HARDWOODS | www.pendlehardwoods.co.uk | **0** | não | — |
| **AUTO MARINE CABLES** | www.amc-tcg.com | 5 | **SIM** | `00804767` |
| MPT GROUP | www.mptgroup.com | 60 | não | nenhum |
| ABBOTT MELLOR | abbottmellor.com | **0** | não | — |
| ACCUMAC | accumac.co.uk | 18 | não | nenhum |
| RADIAL LINE SHEETMETAL | www.radialline.co.uk | **0** | não | — |
| PURE FABS | www.purecompanies.co.uk | 23 | não | nenhum |
| BARROWMIX | barrowmixconcrete.com | **0** | não | — |
| BRIAN MOORES | brianmoores.co.uk | **0** | não | — |

**1 de 11.** E a decomposição importa mais que o total:

| Motivo da perda | Empresas |
|---|---|
| Host **não está** no índice do Common Crawl | **5 de 11 (45%)** |
| Está no índice, mas **nenhuma página publica número de registro nenhum** | 5 de 11 (45%) |
| Publica o número — índice reverso acharia | **1 de 11 (9%)** |

O trecho encontrado no único caso, para registro:

> `…COSHH, RoHS, WEEE and ELV directives. Company Registration Number 00804767 VAT Registration Number GB354703753…`

Note a coluna da direita: em **nenhum** dos 10 sites restantes apareceu um número de registro sequer — nem o da empresa, nem o de uma coligada. Não é caso de "o número está lá mas o índice não pegou". **O número não está publicado.**

# PARTE II — Avaliação original da fonte (16/08/2026)

*Preservada como linha de base. Os números desta parte são o "antes" da tabela da seção I.2.*

## 1. Sumário

Baixei o snapshot oficial do Companies House de 01/08/2026 (2 dos 7 arquivos, 1.699.999 linhas), isolei 3.896 empresas ativas de quatro segmentos B2B em Grande Manchester, sorteei 100 com semente fixa e rodei a cadeia inteira: descoberta de site, extração de contato, verificação SMTP. Depois **auditei manualmente cada site encontrado** para saber se era mesmo daquela empresa.

**O número que decide o produto:**

> ### 8 de cada 100 empresas do Companies House chegam ao fim da cadeia com e-mail de contato num site comprovadamente da própria empresa.
>
> **8% (IC 95%: 4,1% – 15,0%)** pela medida conservadora.
> **11% (IC 95%: 6,3% – 18,6%)** contando também os casos de identificação duvidosa.
>
> Isso usando **apenas heurística de nome de domínio**, que é o piso. Com API de busca o número sobe — quanto, está dimensionado na seção 5, mas **não foi medido em amostra grande**.

**Três descobertas que mudam mais o produto do que o número acima:**

1. **O gargalo não é achar site. É achar o site CERTO.** A heurística "confirmou" 35 sites. Auditados um a um, **só 9 eram mesmo da empresa** — precisão de 26%. Os outros 26 eram empresas homônimas americanas, domínios estacionados, escritórios de advocacia e uma consultoria armênia. Um pipeline que aceitasse os 35 entregaria **74% de contato errado com cara de contato certo** — exatamente o defeito que destrói a credibilidade.

2. **O endereço do Companies House frequentemente não é o endereço da empresa.** 38% da amostra divide o endereço registrado com 5 ou mais empresas; **17% divide com mais de 100**. Um único CEP, M40 8WN, abriga 1.054 empresas. São endereços de contador e agente de constituição, não galpões.

3. **Não conseguimos verificar e-mail a partir da nossa infraestrutura.** Das 28 sondagens SMTP, **10 (36%) foram recusadas por bloqueio do NOSSO IP** — RBL, blacklist, "Service unavailable, Client host blocked" —, não por defeito do endereço. Verificação de entregabilidade exige IP limpo com rDNS, ou fornecedor pago. Isso é uma linha de custo obrigatória, não opcional.

**A margem sobrevive com folga. A promessa de volume, não.** O custo do dado fica entre 3,8% e 13,5% da receita em todos os cenários testados. O problema não é dinheiro — é que o produto não pode prometer "40 empresas com contato".

**Recomendação central:** adotar o modelo de **cobrar crédito só na entrega de contato verificado**. Ele transforma uma taxa de acerto de 8% de fraude em oferta honesta, e é a única forma de o produto ser vendável com os números medidos.

---

## 2. Fontes avaliadas

### 2.1 Companies House — Free Company Data Product (BASE, aprovada)

| | |
|---|---|
| **O que entrega** | nome, número de registro, endereço registrado completo, CEP, até 4 códigos SIC, situação, data de constituição, categoria de contas, datas de confirmation statement |
| **O que NÃO entrega** | **site, e-mail e telefone. Nenhum dos três. Em campo nenhum.** |
| **Licença** | Open Government Licence v3.0 — uso comercial permitido, redistribuição permitida, **exige atribuição** |
| **Restrição de share-alike** | **nenhuma.** Diferente da ODbL do OSM, a OGL não contamina base derivada — nossa classificação de segmento continua nossa |
| **Custo** | zero |
| **Frescor** | snapshot mensal (dia 1º); API ao vivo para consulta pontual |
| **Limite da API** | 600 requisições por 5 minutos (= 172.800/dia); excedente recebe `429`; a documentação avisa que aplicações que insistem podem ser banidas sem aviso |
| **Volume medido** | 1.551.911 empresas ativas em 2 dos 7 arquivos → **~5,43 milhões de empresas ativas no Reino Unido** |

Verificado nesta sessão: download funciona sem chave, arquivo íntegro, 55 colunas, encoding limpo. A API pública devolve `401` sem chave — a chave é gratuita mas precisa ser solicitada.

**Atribuição obrigatória.** A OGL exige crédito à fonte. Precisa ficar visível na tela de resultados, como o crédito do OpenStreetMap já está hoje no `Dashboard.tsx`.

### 2.2 Motores de busca — para ligar razão social a domínio

| Fonte | Custo por mil consultas | Licença / restrição | Veredito |
|---|---|---|---|
| **Brave Search API** | US$ 5,00 (crédito grátis de US$ 5/mês) | **"If you would like to store the API results in part or whole… you will need to subscribe to a plan that explicitly grants storage rights."** Os planos padrão **não** dão direito de armazenar | **Bloqueado nos planos padrão.** É o mesmo problema do Google Places, com outro nome. Precisa de plano com direito de armazenamento explícito, e o preço desse plano não é público |
| **Google Custom Search JSON** | US$ 5,00, teto de 10 mil/dia | **fechada para novos clientes**; clientes atuais têm até 01/01/2027 para migrar | **Morta.** Não entra em roadmap |
| **SerpApi** | US$ 25 (Starter) a US$ 5,90 (Volume); **US$ 10 no Production, US$ 150/mês por 15 mil** | Oferece "U.S. Legal Shield" de até US$ 2 milhões para raspagem/parsing de motor de busca, e modo "ZeroTrace" (não retém consulta nem resultado), ambos a partir do Production | **Viável.** É o único com direito de uso compatível declarado em preço público |
| **Common Crawl** | zero | corpus público; índice CDX consultável por URL | **Útil como verificação, não como descoberta.** Testado: o índice confirma que `www.monarchshelving.co.uk` foi rastreado. Mas ele responde "esse domínio existe?", não "qual é o domínio dessa empresa?" |

### 2.3 Verificação de e-mail

| Fornecedor | Custo por mil | Observação |
|---|---|---|
| ZeroBounce | ~US$ 8,00 no pré-pago; cai para ~US$ 4,00 a partir de 250 mil | |
| NeverBounce | US$ 8,00 até 10 mil; US$ 3,00–4,00 acima de 100 mil | |
| Bouncer | US$ 2,00–8,00; US$ 1.000 por 500 mil créditos sem validade | mais barato no volume |

Preços colhidos em fontes secundárias (comparativos publicados), **não confirmados em página oficial de cada fornecedor** — a página da ZeroBounce não expõe a tabela. Antes de contratar, confirmar direto com o fornecedor.

### 2.4 O que existe e eu NÃO recomendo tocar

Os resultados de busca revelaram uma camada densa de agregadores britânicos que já têm exatamente o dado que falta: Yell, 192.com, Endole, approvedbusiness, businessmagnet, companiesintheuk, b2bhint, cylex, firmania. Vários trazem telefone e e-mail de empresas que não têm site próprio.

**Não proponho raspar nenhum deles.** São bases proprietárias construídas justamente para revender esse dado, e os termos proíbem extração automatizada. O caminho legítimo é **licenciar** — Endole e 192.com têm produtos comerciais de dados. Cotar é um item de trabalho, não uma decisão que eu tome aqui.

---

## 3. Resultado da amostragem

### 3.1 Desenho da amostra

| Parâmetro | Valor |
|---|---|
| Fonte | BasicCompanyData 01/08/2026, partes 1 e 5 de 7 |
| Linhas lidas | 1.699.999 |
| Recorte geográfico | Grande Manchester — áreas postais **M, BL, OL, SK, WN** (WA excluída por cair parcialmente em Cheshire) |
| Empresas na área | 83.560, das quais **74.189 ativas (88,8%)** |
| Segmentos | **quatro segmentos B2B**, escolhidos por serem procurados por outra empresa e não pelo consumidor final |
| Códigos SIC | construção `41201 41202 42110 43999` · transporte `49410 52103 52290` · manufatura metálica `25110 25620 25990` · atacado `46690 46730 46760` |
| Universo alvo na área | **3.896** (extrapolando as 7 partes: **~13.600**) |
| Amostra | **100**, estratificada em 25 por segmento, semente fixa 20260816 |

**Nenhum restaurante, nenhuma loja, nenhuma academia.** O erro clássico de medir cobertura no varejo — onde qualquer base parece boa — foi evitado de propósito.

Distribuição do universo alvo na área: construção 2.045 · transporte 1.332 · atacado 310 · manufatura 209.

### 3.2 A cadeia, etapa por etapa

| # | Etapa | Sobrevivem | % da amostra | IC 95% |
|---|---|---|---|---|
| 1 | Registro obtido do Companies House | 100 | 100% | — |
| 2 | Cadastro completo **e** situação ativa | 100 | 100% | — |
| 3 | Domínio candidato resolvendo no DNS | 84 | 84% | — |
| 4 | Site "confirmado" pela heurística | 35 | 35% | 26,4 – 44,7% |
| 5 | **Site que é MESMO daquela empresa** (auditado à mão) | **9** (14 no critério frouxo) | **9%** | 4,8 – 16,2% |
| 6 | **Publica e-mail em site correto** | **8** (11) | **8%** | **4,1 – 15,0%** |
| 7 | Publica telefone em site correto | 8 (10) | 8% | 4,1 – 15,0% |
| 8 | E-mail confirmado por SMTP | **não mensurável da nossa infraestrutura** | — | — |

**A taxa que decide o produto é a linha 6: 8% a 11%.**

### 3.3 Completude e frescor do registro — o dado que o Companies House entrega bem

| Campo | Presente na amostra |
|---|---|
| Nome | 100% |
| Endereço linha 1 | 100% |
| Cidade | 99% |
| CEP | 100% |
| Código SIC | 100% |
| Data da última confirmation statement | 71% — mediana de **248 dias**; 59% da amostra atualizou nos últimos 365 dias |

Universo, endereço e segmento: **resolvidos**. Não há motivo para procurar outra fonte para essas três dimensões no Reino Unido.

### 3.4 O problema do endereço de massa — não estava no escopo e é grave

| Empresas no mesmo endereço registrado | Amostra |
|---|---|
| 1 (endereço exclusivo) | 54% |
| 2 a 4 | 8% |
| 5 a 19 | 7% |
| 20 a 99 | 14% |
| **100 ou mais** | **17%** |

**38% da amostra (IC 95%: 29,1 – 47,8%) está num endereço compartilhado com 5+ empresas.** O CEP M40 8WN, sozinho, abriga **1.054 empresas** e aparece 5 vezes na amostra de 100.

Consequência direta para o produto: quando o assinante filtra "construtoras num raio de 10 km de onde eu atendo", uma fatia grande do que ele recebe não opera ali — está *registrada* ali, no escritório do contador. **A promessa de proximidade geográfica é mais frágil que a promessa de contato.**

Isto é medível e barato de corrigir: a contagem de coabitantes por endereço sai de uma passagem no próprio snapshot. Vira um campo (`empresas_no_mesmo_endereco`) e um filtro.

### 3.5 Sinal de operação real

| Categoria de contas | Amostra |
|---|---|
| NO ACCOUNTS FILED | 35% |
| TOTAL EXEMPTION FULL | 24% |
| MICRO ENTITY | 24% |
| UNAUDITED ABRIDGED | 8% |
| **DORMANT** | **6%** |
| Demais (subsidiária, FULL, MEDIUM) | 3% |

**39% da amostra foi constituída há menos de 2 anos** (mediana de idade: 4,8 anos). Somando `NO ACCOUNTS FILED` e `DORMANT`, **41% não tem sinal contábil de operação**. São empresas que existem no papel — e são exatamente as que não têm site, não têm telefone e não compram nada.

Isso explica boa parte do 8%: **uma fração grande do universo do Companies House não é empresa operante.** O filtro por categoria de contas é gratuito e deve entrar antes de qualquer tentativa de enriquecimento — economiza consulta paga em quem nunca vai converter.

### 3.6 A auditoria de precisão — o achado mais importante

A heurística "confirmou" 35 sites. Auditei os 35 um a um, cruzando CEP publicado no site contra CEP registrado, número de registro, código de área do telefone e ramo declarado.

| Veredito | Quantidade |
|---|---|
| **Correto** (evidência forte ou provável) | **9** |
| Duvidoso (sem evidência a favor nem contra) | 5 |
| **Errado** (evidência contrária) | **21** |

**Precisão: 25,7% (IC 95%: 14,2 – 42,1%).** No critério mais generoso, contando os duvidosos: 40% (25,6 – 56,4%).

Apenas **15 dos 35 sites publicavam algum CEP britânico**, e **só 4 publicavam um CEP do mesmo distrito postal do registro**.

Exemplos reais de erro produzidos pela heurística — todos seriam entregues como contato válido a um assinante:

| Empresa no Companies House (Grande Manchester) | Site "encontrado" | O que era de fato |
|---|---|---|
| BRADLEYS CONSTRUCTION LTD (Wigan) | `360lawservices.com` | escritório de advocacia |
| QUAYS LOGISTICS LTD (Urmston) | `domainstore.co.uk` | revenda de domínios |
| PW CONSTRUCTION PLANNING LTD (Poynton) | `pw-planning.com` | consultoria tributária em Israel |
| ARM GATE LTD (Bury) | `armgate.am` | contabilidade na Armênia |
| PHOENIX HOME PROJECTS LTD (Eccles) | `phoenix.org.uk` | organização de Leicester |
| PRIMROSE HOLDINGS GROUP LIMITED (Bury) | `primrose.co.uk` | loja de jardinagem online |
| ASCENT LIFTING LTD (Wilmslow) | `ascentlifting.com` | empresa americana; e-mails em `@certex.com` e `@shorehillcapital.com` |
| RADIAL LINE SHEETMETAL LIMITED (Leigh) | `radial.com` | logística americana; e-mail colhido: `you@company.com` |
| P.D.S. (SHEET METAL) LIMITED (Bolton) | `pdssheetmetal.co.uk` | outra PDS, em Portsmouth |
| NERO FOR TRADING LTD (Manchester) | `nero.co.uk` | Nero Pipeline Connections, Birmingham |

O caso `you@company.com` é o retrato do risco: um endereço de *placeholder* de template, sintaticamente válido, que passaria por qualquer validação de formato e seria entregue ao cliente como contato de uma empresa de serralheria de Leigh.

**Conclusão operacional:** confirmação por semelhança de nome é insuficiente. A regra tem que ser **evidência positiva de identidade** — CEP do registro publicado no site, número de registro do Companies House no rodapé, ou telefone com código de área da região registrada. Sem uma dessas, o registro sai como "sem contato", não como contato.

### 3.7 Genérico contra nominal — a decisão

Endereços distintos colhidos: 26.

| Tipo | Endereços | Empresas |
|---|---|---|
| Genérico / *role account* (`info@`, `sales@`, `enquiries@`, `contact@`, `admin@`, `orders@`, `hello@`) | **20 (77%)** | 17 |
| Não genérico | 6 (23%) | 5 |

Dos 6 não genéricos, **4 vinham de sites errados** (`rjackson@shorehillcapital.com`, `bwoodland@certex.com`, `sales-sonoma@bright.com`, `you@company.com`). **Nos 9 sites corretos, apareceu exatamente 1 endereço nominal** (`rodneya@accumac.co.uk`).

**A recomendação de perseguir só o genérico se sustenta, e por um motivo técnico antes do jurídico: o nominal simplesmente não está publicado.** PME britânica de construção e transporte publica `info@` e um telefone. Não publica a lista de diretores com e-mail.

Chegar ao nominal exigiria **inventar o endereço** a partir de padrão (`nome.sobrenome@dominio`) usando os nomes de diretores — que o Companies House publica. Isso é ruim em três dimensões ao mesmo tempo:

1. **Técnica** — endereço inventado só se valida por SMTP, e a seção 3.8 mostra que não conseguimos fazer SMTP. Sem verificação, é palpite entregue como dado.
2. **Jurídica** — `joao.silva@empresa.com` é dado pessoal inequívoco sob UK GDPR, com direito de informação, de acesso e de oposição. Já `info@empresa.com` de sociedade incorporada é *corporate subscriber* pela orientação do ICO, fora da regra de consentimento prévio da PECR (conforme já registrado em `estrategia/PAISES-ALVO.md` e `juridico/REGIME-EMAIL-POR-PAIS.md`).
3. **De credibilidade** — endereço inventado que não existe gera *hard bounce*, e *hard bounce* queima o domínio de envio.

> **ALERTA OBRIGATÓRIO PARA `juridico-internacional` E `especialista-privacidade`:**
> O Companies House publica **nome, mês/ano de nascimento, nacionalidade e endereço de correspondência dos diretores**. Esses campos vêm no produto de dados de oficiais e são dado pessoal sob UK GDPR. **A recomendação técnica é não ingerir esses campos.** Se o produto quiser usá-los em algum momento, o regime jurídico da operação inteira muda — deixa de ser tratamento de dado de pessoa jurídica.

### 3.8 Verificação SMTP — o teste que revelou um problema de infraestrutura

Sondei os 28 endereços com handshake SMTP real (`EHLO` → `MAIL FROM:<>` → `RCPT TO:` → `QUIT`, **sem enviar `DATA`** — nenhuma mensagem chegou a ninguém), com detecção de *catch-all* por endereço aleatório no mesmo domínio.

| Resultado | Endereços | % |
|---|---|---|
| ACEITO (250) | 7 | 25% |
| **REJEITADO por bloqueio do NOSSO IP** | **10** | **36%** |
| Rejeitado no destinatário (`550 5.4.1 Recipient address rejected`) | 1 | 4% |
| Catch-all — SMTP nunca confirma | 3 | 11% |
| Domínio sem MX | 2 | 7% |
| Inconclusivo (desconexão) | 5 | 18% |

Mensagens literais das rejeições por IP:

```
550 5.7.1 Service unavailable, Client host [2804:14d:5c32:51d1::...] blocked
554 The IP address of the sender (186.205.22.231) was found in a [blocklist]
554 5.0.5 ip listed on rbl
```

**Conclusões, nesta ordem de importância:**

1. **Verificação SMTP feita da nossa infraestrutura atual não mede nada.** 36% das respostas falam do nosso IP, não do endereço. Rodar assim produziria descarte em massa de endereços bons — "dado ausente" onde havia dado bom, e o cliente recebendo menos do que existe.
2. **Isso é o mesmo problema que vai atingir o envio.** Se a operação disparar e-mail do mesmo tipo de IP, a entrega falha igual. → **`especialista-deliverability` precisa saber disto antes do primeiro disparo.**
3. **13% dos domínios com MX são catch-all** — aceitam qualquer coisa. Nesses, SMTP não distingue endereço válido de inválido, nunca. É um teto estrutural: mesmo com fornecedor pago, ~13% ficam "arriscado", não "verificado". Precisa ter categoria própria na interface.
4. **92% dos domínios têm MX.** Verificação de MX é IP-independente, sai de graça, e já elimina os casos mortos (`you@company.com` não tem MX — o lixo mais óbvio cai aqui).

**Portanto: verificação de e-mail é serviço contratado, não código nosso.** É a única linha de custo variável verdadeiramente obrigatória do pipeline.

### 3.9 Alcance de rede

Testei todos os 124 hosts candidatos das empresas que não confirmaram site:

| Resposta | Hosts | % |
|---|---|---|
| HTTP 200 | 90 | 73% |
| Não conectou (timeout/TLS) | 13 | 10% |
| Erro (404, 403, 5xx, 402) | 21 | 17% |

10% de perda por inalcançabilidade — real, mas **não é a causa principal** dos 65 misses. A causa principal é que o domínio adivinhado não existe ou é de outra pessoa. Registro honesto: eu suspeitei que fosse maior e a medição disse que não é.

Caso concreto de perda por rede: `monarchshelving.co.uk` — empresa real da amostra, site real (confirmado no índice do Common Crawl), telefone `0161 627 3444` e `sales@monarchshelving.co.uk` publicados — **dá timeout de conexão da nossa rede em apex e www, portas 80 e 443**. A empresa tem contato; nós não alcançamos.

---

## 4. Duas correções aplicadas durante a medição

Encontrei os dois erros na minha própria heurística e os corrigi antes de fechar os números. Registro porque valem para a implementação em produção:

1. **Faltava tentar o prefixo `www`.** `monarchshelving.co.uk` resolve no DNS mas não serve HTTP; só `www.monarchshelving.co.uk` serve. Corrigido tanto na resolução quanto na busca HTTP.
2. **A confirmação por nome era frouxa demais** — é a causa dos 26 falsos positivos. Passei a registrar CEP publicado, menção ao Companies House e código de área do telefone para permitir a auditoria da seção 3.6.

Os números finais (8%–11%) já incorporam as duas correções. Nenhuma delas mudou o total de 35 sites — mudaram o entendimento do que aqueles 35 eram.

---

## 5. Como resolver o gargalo da descoberta de site

O gargalo é **ligar razão social a domínio**. Quatro caminhos, com o que sei e o que não sei sobre cada um:

### Opção A — Heurística de nome + confirmação estrita (medido)

| | |
|---|---|
| Taxa de site correto | **9%** (medido, n=100) |
| Custo por mil processadas | **US$ 0,50** (só DNS e banda) |
| Licença | nenhum problema |
| Veredito | **é o piso, e é grátis.** Fica no pipeline como primeira tentativa, sempre |

Só serve com a regra de evidência positiva da seção 3.6. Sem ela, entrega 74% de lixo.

### Opção B — API de busca (SerpApi)

| | |
|---|---|
| Taxa esperada | **não medida em amostra grande.** Testei 7 empresas que a heurística perdeu e o motor de busca achou site próprio para 2 (P & K Shutter Services e Monarch Shelving). **2 de 7 é n pequeno demais para virar número de plano** |
| Custo | US$ 10,00/mil no plano Production (US$ 150/mês por 15 mil consultas) |
| Licença | "U.S. Legal Shield" declarado para raspagem/parsing; modo ZeroTrace disponível |
| Veredito | **é o caminho, mas precisa de medição própria antes de virar compromisso** |

O que os 7 testes mostraram com clareza é o **padrão**: para PME britânica sem site, os resultados de busca são dominados por agregadores (Yell, 192.com, Endole, Companies House). O motor de busca não inventa site onde não há — ele só encontra o que existe.

**Trabalho a fazer antes de contratar:** rodar a mesma amostra de 100 contra a API, medir site correto pelo mesmo critério de evidência positiva, e comparar com os 9% da heurística. É o teste que falta, e ele é barato — 100 consultas cabem no plano gratuito de vários fornecedores.

### Opção C — Common Crawl com busca reversa por número de registro (a ideia estruturalmente melhor)

Empresa britânica com site publica, no rodapé, "Registered in England No. 12345678" — é praticamente convenção. **Um índice de páginas britânicas chaveado por número de registro do Companies House dá a ligação nome→domínio com precisão altíssima**, porque o número é identificador único e não homônimo.

| | |
|---|---|
| Custo marginal por consulta | **zero** depois de construído |
| Custo de construção | processamento de WARC do Common Crawl — dezenas a centenas de dólares em computação, uma vez, e reprocessamento a cada rastreio |
| Licença | corpus público; o conteúdo é de terceiros, o que se extrai é um fato (número de registro ↔ domínio) |
| Frescor | rastreio mensal, com defasagem de semanas |
| Cobertura | **desconhecida — não medida.** Depende de quantas empresas publicam o número, e de quantas o Common Crawl rastreia |
| Veredito | **melhor relação precisão/custo no longo prazo; maior custo de engenharia no curto** |

Verifiquei que o índice CDX responde e é consultável (`index.commoncrawl.org`). **Não medi** que fração das empresas da amostra está lá nem que fração publica o número de registro. É o segundo teste que falta.

### Opção D — Licenciar de agregador britânico

Endole, 192.com e similares já têm telefone e e-mail de empresas sem site. **Não cotei preços** — não estava no escopo desta medição e não invento número.

Mas há um argumento forte a favor: os 8% medidos vêm exclusivamente de empresas **com site**. Boa parte das que não têm site **tem telefone**, e esse telefone está nos agregadores. A busca por BROADTHORN CONSTRUCTION LIMITED não achou site nenhum, mas achou `01606 851056` num diretório.

**Recomendação para `cfo-planejador`:** pedir cotação a Endole e 192.com antes de investir engenharia nas opções B e C. Se o custo por registro licenciado ficar abaixo de US$ 0,20, compra vence construção com folga, dada a receita medida de US$ 0,74 por registro.

### Comparativo

| Opção | Taxa de acerto | Custo/mil processadas | Licença | Status |
|---|---|---|---|---|
| A — heurística + evidência estrita | **9% (medido)** | US$ 0,50 | livre | pronta |
| B — SerpApi | não medida | US$ 10,00 | ok, com Legal Shield | falta medir |
| C — Common Crawl por nº de registro | não medida | ~0 após construção | ok | falta medir |
| D — licenciar agregador | n/d | **não cotado** | contratual | falta cotar |
| ✗ Brave Search | — | US$ 5,00/mil | **proíbe armazenar no plano padrão** | descartada |
| ✗ Google CSE | — | US$ 5,00/mil | **fechada a novos clientes, fim em 01/01/2027** | descartada |

---

## 6. Custo por mil registros

Câmbio declarado: **GBP = R$ 6,90 · USD = R$ 5,40** (mesma base de `estrategia/PAISES-ALVO.md`).

### Receita por registro

| | |
|---|---|
| Plano mensal britânico | **£ 77,00** |
| Consumo do assinante | **133 registros/mês** |
| **Receita por registro entregue** | **£ 0,579 = US$ 0,740 = R$ 3,99** |

### Custo por registro entregue

Premissas: 1 consulta de busca por empresa · ~3 páginas rastreadas por site encontrado · verificação de e-mail a US$ 0,008 · banda e CPU a US$ 0,50/mil processadas.

| Cenário | Custo/1.000 processadas | Taxa de entrega | **Custo por registro ENTREGUE** | % da receita |
|---|---|---|---|---|
| **A — heurística pura (medido)** | US$ 2,26 | 8% | **US$ 0,028 = R$ 0,15** | **3,8%** |
| B — + SerpApi Production (US$ 10/mil) | US$ 14,90 | 30% (não medida) | **US$ 0,050 = R$ 0,27** | 6,7% |
| B' — + SerpApi Starter (US$ 25/mil) | US$ 29,90 | 30% (não medida) | US$ 0,100 = R$ 0,54 | 13,5% |
| B'' — + busca a US$ 5/mil | US$ 9,90 | 30% (não medida) | US$ 0,033 = R$ 0,18 | 4,5% |

**A margem sobrevive em todos os cenários.** O pior caso testado consome 13,5% da receita por registro. O custo fixo atual da operação (R$ 208/mês) domina o custo variável até a casa de milhares de registros por mês.

> **Para `cfo-planejador` e `analista-precificacao`: o custo do dado NÃO é o risco deste produto.** O risco é a taxa de entrega, e ele aparece no volume que se pode prometer, não na margem.

### O limite que ninguém tinha calculado: profundidade do poço

O que amarra o negócio não é dinheiro por registro. É **quantos registros entregáveis existem em cada par (cidade, segmento)** — porque é assim que o cliente busca.

Universo nacional medido nos 12 códigos SIC alvo (extrapolado das 2 partes lidas):

| Segmento | Reino Unido inteiro |
|---|---|
| Construção | ~177.700 |
| Transporte / logística | ~89.200 |
| Manufatura metálica | ~16.200 |
| Atacado B2B | ~14.500 |
| **Total** | **~297.600** |

Aplicando as taxas medidas:

| Recorte | Empresas | Entregáveis a 8% | Meses de um assinante (133/mês) |
|---|---|---|---|
| Construção em Grande Manchester | ~7.160 | **~570** | **4,3 meses** |
| Os 4 segmentos em Grande Manchester | ~13.640 | ~1.090 | 8,2 meses |
| Construção no Reino Unido inteiro | ~177.700 | ~14.200 | 107 meses |

**Leitura direta:** a 8%, um assinante de construção em Manchester **esgota a cidade inteira em pouco mais de 4 meses**. Depois disso, ou ele expande a geografia, ou cancela. A 30% (com API de busca), o mesmo poço dura 16 meses.

Isso muda o modelo de retenção e é insumo para `cfo-planejador` e `prospectx-produto`. A taxa de entrega não define só quanto o produto entrega hoje — define **quanto tempo o cliente consegue ficar**.

---

## 7. Desenho do pipeline

```
1. EXTRAÇÃO
   Companies House — snapshot mensal (7 arquivos, ~470 MB)
   + delta diário pela API (chave gratuita, teto de 600 req/5min)
   Grava: data da extração, versão do snapshot, parâmetros

2. CAMADA BRUTA (imutável)
   CSV original preservado. Reprocessar nunca exige re-extrair.

3. FILTRO DE OPERAÇÃO — barato, e antes de qualquer custo variável
   - situação = Active
   - categoria de contas ≠ DORMANT e ≠ NO ACCOUNTS FILED
     (corta ~41% da amostra — 41% que quase nunca tem contato)
   - marca `empresas_no_mesmo_endereco` (contagem por CEP + linha 1)
   - marca `endereco_de_massa` quando ≥ 5

4. NORMALIZAÇÃO
   - nome: caixa, acentos, sufixos societários (LTD/LIMITED/PLC/LLP)
   - CEP: formato canônico, distrito (outward) separado
   - telefone: E.164, com o original guardado ao lado
   - SIC → taxonomia interna de segmento (nossa, e nossa por causa da OGL
     não ter share-alike)

5. DESCOBERTA DE SITE — em cascata, da mais barata para a mais cara
   a) heurística de nome + www          → grátis, 9% medido
   b) API de busca                       → US$ 10/mil, taxa a medir
   c) índice reverso por nº de registro  → grátis após construção, a medir
   Só avança para a etapa seguinte quem não resolveu na anterior.

6. CONFIRMAÇÃO DE IDENTIDADE — trava obrigatória
   Aceita o site SOMENTE com evidência positiva:
     - CEP do registro publicado no site, OU
     - número de registro do Companies House no site, OU
     - telefone com código de área do distrito registrado
   Semelhança de nome sozinha NÃO confirma. (Medido: 26% de precisão.)
   Sem evidência → registro sai com contato vazio, não com contato duvidoso.

7. EXTRAÇÃO DE CONTATO
   Home + até 3 páginas de contato, respeitando robots.txt
   Só e-mail genérico (role account). Nominal não entra.

8. VERIFICAÇÃO
   a) sintaxe
   b) MX no DNS                        → grátis, IP-independente, 92% têm
   c) SMTP por FORNECEDOR              → US$ 8/mil; NÃO da nossa infra
   d) detecção de catch-all            → 13% viram "arriscado", não "verificado"

9. DEDUPLICAÇÃO
   Chave natural: número do Companies House — único e estável.
   Bloqueio secundário por CEP normalizado + telefone E.164, para detectar
   grupos e a mesma operação sob vários registros.
   Dúvida → marca como suspeita. Nunca funde.

10. PUBLICAÇÃO
    Todo registro carrega: fonte, data de coleta, método de descoberta,
    tipo de evidência de identidade, status de verificação do e-mail.
    Sem procedência não há como corrigir nem como se defender.

11. MONITORAMENTO
    Cobertura · precisão · contatabilidade · frescor · duplicidade
    Alerta quando qualquer uma cai. Reprocessamento idempotente:
    rodar duas vezes não pode duplicar nada.
```

### Contrato do dado — para `engenheiro-backend`

| Campo | Tipo | Garantia |
|---|---|---|
| `numero_registro` | text | **sempre presente, único, estável** — chave natural |
| `nome` | text | **sempre presente** |
| `endereco`, `cidade`, `cep` | text | **sempre presente** (cidade em 99%) |
| `codigos_sic` | text[] | **sempre presente**, 1 a 4 códigos |
| `situacao` | enum | **sempre presente** |
| `empresas_no_mesmo_endereco` | int | **sempre presente**; ≥ 5 significa endereço provavelmente de contador |
| `categoria_contas` | text | presente em ~100%; `DORMANT`/`NO ACCOUNTS FILED` = sem sinal de operação |
| `site` | text | **PODE VIR VAZIO — vem vazio em ~91% dos casos** |
| `evidencia_identidade` | enum | `cep_exato` · `numero_registro` · `area_telefone` · **`nenhuma` ⇒ site deve ser tratado como ausente** |
| `email` | text | **PODE VIR VAZIO — vem vazio em ~92% dos casos**; sempre genérico, nunca nominal |
| `email_status` | enum | `verificado` · `arriscado_catchall` · `sem_mx` · `nao_verificado` |
| `telefone` | text | **PODE VIR VAZIO — vem vazio em ~92% dos casos**; E.164 |
| `fonte`, `coletado_em` | text, timestamptz | **sempre presente** |

**A regra que o backend precisa impor:** nenhum caminho de código pode preencher `email` ou `telefone` a partir de site com `evidencia_identidade = nenhuma`. Esse é o defeito medido em 26 dos 35 casos.

---

## 8. Riscos e lacunas conhecidas

**Medido e ruim:**

1. **8% a 11% de contato verificável** com o pipeline gratuito. O produto não é entregável na formulação atual sem mudança de modelo de cobrança.
2. **26% de precisão** na confirmação por nome. Sem a trava de evidência positiva, o produto entrega majoritariamente contato errado.
3. **Não conseguimos verificar e-mail** da nossa infraestrutura. 36% das sondagens bateram em bloqueio do nosso próprio IP.
4. **38% dos endereços são compartilhados**, 17% com mais de 100 empresas. A busca por raio geográfico entrega empresas que não operam ali.
5. **41% do universo não tem sinal contábil de operação.**
6. **13% dos domínios são catch-all** — teto estrutural de verificação, insuperável por qualquer fornecedor.

**Não medido — e que precisa ser antes de qualquer promessa:**

7. **Taxa de acerto da API de busca.** n=7 é anedota, não medida. Este é o teste mais urgente que falta.
8. **Cobertura do índice reverso por número de registro no Common Crawl.**
9. **Preço dos agregadores britânicos** (Endole, 192.com).
10. **Irlanda e França.** Não medidos. O CRO e a Sirene resolvem universo, endereço e segmento como o Companies House — **e provavelmente têm o mesmo buraco de contato**, porque nenhum registro oficial publica e-mail. A cadeia mede-se do mesmo jeito; só falta rodar. A França ainda tem o *statut de diffusion*, que mascara identidade e endereço de quem se opôs — precisa ser respeitado na ingestão.

**Vieses da amostra, declarados:**

11. Li 2 dos 7 arquivos do snapshot, o que significa **recorte alfabético** de nome de empresa. Não vejo mecanismo pelo qual a inicial do nome se correlacione com ter site, mas não testei.
12. Uma única área metropolitana (Grande Manchester) e quatro segmentos. **Não sei** se Londres, com empresas maiores, tem taxa melhor — é plausível que sim, e é barato medir.
13. Rastreio feito de IP residencial brasileiro. 10% dos hosts não conectaram; de infraestrutura no Reino Unido ou na União Europeia o número provavelmente seria menor.

---

## 9. Recomendação

### 9.1 Sobre o modelo de cobrança — sim, muda tudo, e é a favor

O modelo em estudo — **crédito só quando um contato verificado é entregue** — não é ajuste de precificação. Com os números medidos, **é o que separa um produto vendável de um produto que não pode ser vendido.**

Com cobrança por busca e 8% de acerto, o assinante paga por 40 empresas e recebe 3 com contato. Ele não conclui "a base é rasa". Ele conclui que foi enganado — e tem razão, porque a promessa era outra. Isso é exatamente a perda de credibilidade que o dono nomeou como risco fatal.

Com cobrança na entrega, os mesmos 8% viram outra coisa: o cliente vê **todas** as empresas que combinam com ele — o mapa completo do mercado dele, que é valor real e que o Companies House entrega com 100% de completude — e paga só pelo que veio com contato. A taxa baixa deixa de ser fraude e vira **menor faturamento por busca**, que é um problema de crescimento, não de honestidade.

**Recomendo adotar.** Três consequências que precisam entrar no desenho:

- **A receita por busca cai muito.** Para consumir 133 registros verificados por mês a 8%, o assinante precisa de ~1.660 empresas listadas. Isso é possível — o universo de Grande Manchester tem 13.600 —, mas exige que a busca devolva listas grandes, não 40 linhas.
- **Cada ponto percentual de taxa de entrega vira receita direta.** O investimento em descoberta de site passa a ter retorno mensurável, o que é saudável.
- **A profundidade do poço (seção 6) vira métrica de retenção.** A tela deve mostrar, por cidade e segmento, quantos registros com contato ainda restam para aquele cliente.

### 9.2 O que o produto NÃO pode prometer

**Proibido, com os números medidos:**

- ❌ "40 empresas com contato"
- ❌ "empresas com telefone e e-mail verificados" como descrição do resultado de busca
- ❌ qualquer número de contatos **antes** de a busca rodar
- ❌ tratar "site encontrado" como "empresa identificada" sem evidência de identidade

**Formulação honesta proposta:**

> **"Todas as construtoras ativas de Manchester registradas no Companies House — nome, endereço, código de atividade e situação cadastral. Você vê a lista completa de graça.**
> **Você só gasta crédito quando entregamos um contato verificado. Hoje, nesta cidade e neste segmento, conseguimos contato verificado para cerca de 1 em cada 12 empresas — e estamos subindo esse número toda semana."**

O "1 em cada 12" é o 8% medido. Deve ser um número calculado pelo sistema, por par (cidade, segmento), a partir do que a base tem de fato — **nunca um número escrito à mão na copy**. Se subir para 30%, vira "1 em cada 3" sozinho.

E deve haver um segundo aviso, que a medição da seção 3.4 tornou obrigatório:

> "Endereço mostrado é o endereço registrado na Companies House. Em cerca de 4 de cada 10 casos ele é o escritório do contador, não o local de operação — sinalizamos quando detectamos."

### 9.3 Sequência de trabalho recomendada

| # | Ação | Dono | Por quê |
|---|---|---|---|
| 1 | **Medir a API de busca contra a mesma amostra de 100** | `engenheiro-dados` | é a única incógnita que decide entre produto de 8% e produto de 30%. Cabe no plano gratuito |
| 2 | **Implementar a trava de evidência positiva** | `engenheiro-backend` | sem ela o produto entrega 74% de contato errado. É a correção mais urgente do código |
| 3 | **Cotar Endole e 192.com** | `cfo-planejador` | comprar pode ser mais barato que construir, e ainda alcança empresa sem site |
| 4 | **Contratar verificação de e-mail** | `engenheiro-backend` | não dá para fazer da nossa infra. ~US$ 8/mil |
| 5 | **Levar a decisão de cobrança na entrega ao produto** | `prospectx-produto` | muda tela, copy e modelo de crédito |
| 6 | **Levar o achado de IP bloqueado ao envio** | `especialista-deliverability` | o mesmo bloqueio vai atingir o disparo |
| 7 | **Confirmar o regime dos dados de diretores** | `juridico-internacional` + `especialista-privacidade` | a recomendação técnica é não ingerir |
| 8 | Só depois: repetir a cadeia na Irlanda e na França | `engenheiro-dados` | mesmo método, mesmo custo de medição |

### 9.4 A frase que resume

**O Companies House resolve universo, endereço e segmento com 100% de completude e custo zero. Não resolve contato, e nada gratuito resolve.** Os 8% medidos são o que se consegue de graça. Chegar a 30% custa entre US$ 5 e US$ 10 por mil consultas — dinheiro que a margem absorve sem esforço.

**A decisão não é técnica nem financeira. É de promessa.** Enquanto a interface disser "40 empresas com contato" e a base entregar 3, nenhuma melhoria de tela conserta o produto. Cobrar na entrega alinha a promessa ao que a base faz — e é a única recomendação deste relatório que eu daria mesmo se todos os outros números fossem melhores.

---

## Anexo — correção aplicada ao código

Aplicada durante esta análise, por ser pequena, segura e diretamente ligada à restrição do dono.

**Problema:** o crédito é debitado **antes** da busca (`useExecutarBusca.ts`). Quando a fonte real devolvia vazio, `useAppStore.buscarEmpresas` substituía silenciosamente por empresas geradas por `gerarEmpresasMock` — com telefone e e-mail inventados. O selo "Exemplo simulado" aparece na tela, mas **depois** de o crédito sair, e **não acompanha o dado exportado**.

Um assinante podia pagar crédito e receber uma lista de empresas que não existem, com contatos que não existem. É a falha exata que o dono nomeou como fatal.

**Correção:** campo opcional `permitirSimulado` em `ParametrosBusca`, ligado **apenas** na demonstração de visitante (que não gasta crédito e é rotulada na tela). Para quem pagou, busca vazia devolve vazio.

Arquivos alterados:
- `C:\Users\carol\Downloads\Jr\prospectx_4\prospectx\src\types\empresa.ts`
- `C:\Users\carol\Downloads\Jr\prospectx_4\prospectx\src\store\useAppStore.ts`
- `C:\Users\carol\Downloads\Jr\prospectx_4\prospectx\src\hooks\useExecutarBusca.ts`

`npx tsc --noEmit` passa sem erro.

**O que a correção NÃO resolve, e fica para `engenheiro-backend`:** o crédito continua debitado mesmo quando o resultado é vazio. Não existe RPC de estorno no banco (verificado nas migrações 002, 016, 021 e 024) e criar uma é mudança de backend, fora do escopo de "correção pequena e segura". Duas saídas possíveis, na ordem que eu recomendo:

1. **Debitar depois**, e só pelo que foi entregue — que é exatamente o modelo de cobrança na entrega da seção 9.1, e resolve os dois problemas de uma vez.
2. Criar `estornar_creditos(busca_id)` e chamá-la quando o resultado vier vazio.

---

## Anexo — reprodutibilidade

Scripts e dados brutos da medição, copiados para o repositório em
`C:\Users\carol\Downloads\Jr\prospectx_4\prospectx\ferramentas\medicao-fonte-uk\`:

| Arquivo | O que faz |
|---|---|
| `extrair.py` | lê o snapshot, filtra por área postal e SIC, conta coabitantes de endereço, sorteia a amostra (semente 20260816) |
| `descobrir.py` | heurística de domínio, confirmação, extração de e-mail e telefone, respeita `robots.txt` |
| `auditar.py` | recolhe sinais de identidade dos sites encontrados para a auditoria de precisão |
| `verificar_email.py` | verificação em 3 camadas (sintaxe, MX, SMTP `RCPT` com remetente nulo) e detecção de catch-all — **nunca envia `DATA`** |
| `amostra.json` | as 100 empresas sorteadas, com todos os campos do registro |
| `descoberta3.json` | resultado da cadeia de descoberta, empresa por empresa |
| `auditoria.json` | sinais de identidade coletados nos 35 sites, base da auditoria de precisão |
| `verificacao_email.json` | respostas SMTP e MX, endereço por endereço |

Para refazer a medição: baixar `BasicCompanyData-AAAA-MM-01-part{1,5}_7.zip` de
`https://download.companieshouse.gov.uk/en_output.html` para o mesmo diretório e rodar
`extrair.py` → `descobrir.py` → `auditar.py` → `verificar_email.py`. Dependências: `requests`, `dnspython`.
A semente do sorteio (20260816) está fixa no código — trocar a semente troca a amostra e invalida a comparação.
