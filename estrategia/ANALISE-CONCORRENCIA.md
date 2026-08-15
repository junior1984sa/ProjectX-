# ProspectX — Análise de Concorrência

**Data de consulta de todas as fontes: 15 de agosto de 2026.**
Analista: `analista-concorrencia` · Escopo: EUA, Reino Unido e Austrália (Brasil tratado como fase 2)

---

## Convenção de confiabilidade de preço

Este relatório separa três níveis. Não misture.

| Marca | Significado |
|---|---|
| **[PÁGINA]** | Preço lido diretamente na página de preços do fornecedor em 15/08/2026 |
| **[SECUNDÁRIA]** | Preço só encontrado em blog de terceiro ou comparador. Serve para faixa, **não** para decisão |
| **[NÃO VERIFICADO]** | Não foi possível confirmar. Não use em nenhum cálculo |

Fornecedores que bloqueiam leitura automática da página de preços (Lusha, ZoomInfo, Cognism, Apollo, BookYourData, GetProspect) aparecem apenas com **[SECUNDÁRIA]** ou **[NÃO VERIFICADO]**. Isso não é falha de pesquisa: **esconder o preço é, ele próprio, um dado sobre o público-alvo** — quem esconde preço vende para comitê, não para profissional solo.

---

## 1. Sumário Executivo

**1.** O mercado está partido em dois blocos que quase não conversam: o bloco de **sales intelligence corporativa** (Apollo, ZoomInfo, Cognism, Lusha, UpLead), que vende contato de decisor nomeado por assento a partir de ~US$ 49/usuário/mês e chega a US$ 15.000/ano de piso; e o bloco de **leads locais via mapas** (Scrap.io, LeadSwift, D7, Outscraper, Lead Atlas, B2BLeadFinder), que vende registro de empresa local a **US$ 0,003 a US$ 0,03 por registro**. A ProspectX está vendendo produto do segundo bloco com estrutura de preço do primeiro — e mais cara que ambos por crédito.

**2.** O diferencial declarado — o mapa "quem contrata quem" com 531 termos — **de fato não existe como produto no mercado**, e a razão é instrutiva: toda a categoria de descoberta de ICP (Ocean.io, Unify, Keyplay, Clay) parte de **clientes que você já tem** para achar semelhantes. Nenhuma delas serve quem tem zero clientes. Esse é o espaço vazio real. Mas ele está vazio porque é **barato de copiar** (em 2026 qualquer LLM devolve "quem contrata manutenção industrial" em segundos) e porque **o valor não está no mapa, está na base por trás dele** — que a ProspectX ainda não tem. O mapa é uma camada fina sobre um buraco.

**3.** A fraqueza estrutural que dá para atacar é a mesma em todos os players: **eles exigem que o cliente já saiba quem procurar.** Apollo pede filtro de SIC/NAICS; Scrap.io pede a categoria do Google Maps; D7 pede a palavra-chave. Todos assumem um comprador treinado. O prestador solo não é treinado — e é por isso que ele desiste na primeira busca vazia, não por falta de dado.

**4.** O concorrente real do prestador solo em EUA/UK/AU **não é uma ferramenta de dados, é o marketplace de leads**: Angi, Thumbtack, Bark, Checkatrade. Eles cobram US$ 8–150 por lead (Thumbtack) e £5–40 por lead (Bark), vendem o mesmo lead para 4–5 profissionais, e 78% dos clientes contratam quem responde primeiro **[SECUNDÁRIA]**. Essa é a dor que a ProspectX pode nomear e que nenhuma ferramenta de dados nomeia. É o melhor ângulo de mensagem disponível.

**5.** Recomendação central: **não venda base, venda alvo — e prove antes do cadastro.** A ProspectX não vai ganhar de Apollo em volume nem de Scrap.io em preço por registro. Pode ganhar sendo a única que responde "para quem eu vendo?" antes de responder "qual o e-mail dele?". Mas isso só é vendável se a base entregar dado real; enquanto o OpenStreetMap for a fonte, cada busca vazia queima a promessa e o pouco de confiança que uma marca sem assinantes tem.

---

## 2. Mapa do mercado

### 2.1 Concorrentes diretos — leads locais por cidade × segmento

Esta é a categoria da ProspectX. Fonte de dados quase sempre Google Maps (API ou raspagem).

| Produto | O que é | Entrada mais barata |
|---|---|---|
| **Scrap.io** | Extração de Google/Apple/Bing Maps, 195 países, 4.000+ categorias | US$ 35/mês anual, 10.000 créditos de exportação **[PÁGINA]** |
| **LeadSwift** | Raspagem ao vivo de Maps/Yelp/Facebook/YellowPages para agências | US$ 19,99/mês anual (1 busca/dia, leads ilimitados) **[PÁGINA]** |
| **D7 Lead Finder** | Até 1.200 leads por busca, mundial | US$ 44,99/mês (15 buscas/dia) **[SECUNDÁRIA]** |
| **Outscraper** | Pay-as-you-go por registro, sem mensalidade | US$ 1–9 por 1.000 registros **[PÁGINA]** |
| **Lead Atlas** | Busca por cidade/CEP/setor, créditos que não expiram | **US$ 9 por 300 créditos (US$ 0,030/lead)** **[PÁGINA]** |
| **B2BLeadFinder** | Google Places API + score de "lacuna digital" | US$ 14,99/mês; teste 7 dias, 25 scans **[PÁGINA parcial]** |

### 2.2 Concorrentes diretos — sales intelligence B2B

| Produto | Posição | Entrada |
|---|---|---|
| **Apollo.io** | Líder de volume no self-serve, plano gratuito agressivo | US$ 49/usuário/mês anual **[SECUNDÁRIA]** |
| **UpLead** | Precisão garantida, filtro por SIC | US$ 74/mês anual (2.040 créditos/ano) **[PÁGINA]** |
| **Lusha** | Extensão de navegador, autosserviço | **[NÃO VERIFICADO]** — página bloqueada |
| **Cognism** | Dado europeu, celular verificado, contrato anual | Piso ~US$ 15.000/ano + assento **[SECUNDÁRIA]** |
| **ZoomInfo** | Enterprise, mínimo de 3 assentos, sem preço público | US$ 15.000–60.000/ano **[SECUNDÁRIA]** |
| **Seamless.AI** | Autosserviço agressivo, reputação ruim de cobrança | ~US$ 147/usuário/mês anual **[SECUNDÁRIA]** |
| **Lead411** | Intent Bombora no plano de entrada | US$ 49/mês (1.000 exportações) **[SECUNDÁRIA]** |
| **Kaspr** | LinkedIn, e-mail B2B ilimitado | €45/usuário/mês **[PÁGINA]** |
| **Wiza** | LinkedIn Sales Navigator → CSV | US$ 49/mês **[SECUNDÁRIA]** |
| **Data Axle Salesgenie** | Listas compiladas EUA, SMB clássico | US$ 99/mês **com contrato de 12 meses** **[SECUNDÁRIA]** |

### 2.3 Cold outreach com base embutida

Aqui a base virou brinde do disparador. Isso é o fato mais perigoso para a ProspectX.

| Produto | Base embutida | Entrada |
|---|---|---|
| **Instantly.ai** | 450M+ contatos B2B; pacote Starter US$ 94/mês com 1.500 créditos | Outreach US$ 47/mês; Créditos US$ 47/mês **[PÁGINA]** |
| **lemlist** | 650M+ leads incluídos já no plano de US$ 69 | US$ 55/mês anual **[SECUNDÁRIA]** |
| **Snov.io** | Prospecção + disparo + verificação | US$ 29,25/mês, 1.000 créditos **[PÁGINA]** |
| **Hunter.io** | Busca de e-mail + sequências | US$ 34/mês anual, 2.000 créditos **[PÁGINA]** |
| **Saleshandy** | Lead Finder + disparo | US$ 25/mês (2.000 prospects ativos) **[PÁGINA]** |

### 2.4 Descoberta de ICP / "lookalike"

| Produto | Mecanismo | Limite estrutural |
|---|---|---|
| **Ocean.io** | Lookalike a partir de clientes atuais; 35M empresas | Precisa de clientes existentes. US$ 0,071/crédito, mín. 750 **[SECUNDÁRIA]** |
| **Unify / Keyplay / Persana / Landbase** | Scoring de fit + intent + lookalike | Preço enterprise, ciclo de venda com comitê **[NÃO VERIFICADO]** |
| **Clay** | Infra de enriquecimento; Launch US$ 185/mês, Growth US$ 495/mês **[SECUNDÁRIA]** | Exige operador técnico |

**Achado:** a categoria inteira responde "quem se parece com meu cliente?". Nenhuma responde "quem é meu cliente?" para quem ainda não tem nenhum.

### 2.5 Substitutos gratuitos — o verdadeiro concorrente

| Substituto | Custo | Por que o cliente usa |
|---|---|---|
| **Busca manual no Google Maps + planilha** | R$ 0 | É o que ele já faz. Funciona mal, mas funciona |
| **LinkedIn manual / Sales Navigator** | US$ 0 ou ~US$ 99–119/mês **[SECUNDÁRIA]** | Decisor nomeado; inútil para oficina, obra, restaurante |
| **Apollo plano gratuito** | US$ 0 | 10 créditos de exportação/mês, 25 registros por exportação **[SECUNDÁRIA]** |
| **Companies House (UK)** | R$ 0 | Registro oficial, SIC code, dado limpo, download em massa |
| **ABN Lookup / ABR (Austrália)** | R$ 0 | Registro oficial, 20M+ registros, extração em massa permitida |
| **SAM.gov (EUA), Contracts Finder / Find a Tender (UK), AusTender (AU)** | R$ 0 | Quem já contrata aquele serviço, com valor e prazo. Sinal de compra puro |
| **Stotles** | Plano gratuito com usuários ilimitados **[SECUNDÁRIA]** | Agrega os portais públicos do UK/IE num feed |
| **Listas de associação setorial / câmaras de comércio** | R$ 0 a baixo | Segmentado por definição, é literalmente "quem é desse setor" |
| **ChatGPT / Claude** | US$ 0–20/mês | **Responde "quem contrata manutenção industrial?" de graça.** Este é o substituto que ameaça o diferencial declarado da ProspectX, não a base de dados |

### 2.6 Substitutos pagos que consomem o mesmo orçamento

| Plataforma | Custo por lead | Mecânica |
|---|---|---|
| **Thumbtack (EUA)** | US$ 8–150+; US$ 25–75 típico; US$ 35–55 em HVAC/elétrica nos 50 maiores mercados **[SECUNDÁRIA]** | Lead compartilhado |
| **Angi Leads (EUA)** | US$ 15–85, US$ 100+ em serviços caros, + ~US$ 300/ano de acesso **[SECUNDÁRIA]** | Assinatura + lead |
| **Bark (UK)** | Crédito ~£1,20 + IVA; lead custa 5–20 créditos, ou £5–40 **[SECUNDÁRIA]**. Créditos comprados a partir de 01/11/2025 expiram em 3 meses | Crédito consumível |

Custo por trabalho fechado: Angi ~US$ 542, Thumbtack ~US$ 250 **[SECUNDÁRIA]**. Leads dividos com 4–5 profissionais; 78% contratam quem responde primeiro **[SECUNDÁRIA]**.

**Este é o orçamento que a ProspectX disputa de verdade.** Um prestador que gasta US$ 300/mês no Thumbtack tem dinheiro. Um que nunca gastou nada não tem.

---

## 3. Fichas de teardown

### 3.1 Apollo.io — o concorrente que define o teto do mercado

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "The AI sales platform for smarter, faster revenue growth" / "Build pipeline smarter, close deals faster, and simplify your tech stack with a unified platform built for modern sales and marketing teams." CTA: "Sign up for free" |
| **Cliente-alvo** | Time de vendas B2B com SDR. **Ignora conscientemente** o prestador local: não há caso de uso para "achar 40 construtoras em Manchester" |
| **Fonte de dados** | Rede de ~2 milhões de contribuidores (usuários compartilham contatos), crawl de sites públicos, rastreio de engajamento de e-mail e fornecedores terceiros (230M+ registros/mês) **[SECUNDÁRIA]** |
| **Modelo de preço** | Assento + créditos por tipo de ação (e-mail 1 crédito, telefone 8, IA 1, discador 2/min) **[SECUNDÁRIA]** |
| **Preço real** | Free US$ 0 · Basic US$ 49 · Professional US$ 79 · Organization US$ 119/usuário/mês anual (mín. 3 assentos). Mensal: 65/99/149 **[SECUNDÁRIA — página de preços é renderizada por JS e não pôde ser lida]** |
| **Plano gratuito** | Sim, e é o mais agressivo do mercado: e-mail ilimitado, 5 créditos de celular, **10 créditos de exportação/mês, 25 registros por exportação** **[SECUNDÁRIA]**. Limita por **exportação**, não por busca — deixa você ver tudo e pagar para levar |
| **Onboarding** | Cadastro → busca imediata. Primeiro valor em minutos |
| **Reclamações recorrentes** | Qualidade de dado é a queixa nº 1 (500+ das 9.000+ resenhas no G2 citam dado impreciso/desatualizado). Taxa de bounce reportada de 20–30%. Precisão ~88% nos EUA e ~60% fora **[SECUNDÁRIA]** |
| **Fraqueza estrutural** | A rede de contribuidores só enxerga **quem usa e-mail corporativo em CRM**. Encanador, serralheria e transportadora com 6 funcionários não estão lá e **não podem estar** — não há contribuidor gerando esse dado. Apollo não consegue cobrir SMB local sem trocar de fonte |

### 3.2 Scrap.io — o concorrente mais parecido com a ProspectX

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "Local Leads Generator" / "Target businesses you won't find on LinkedIn. Extract leads from Google Maps, Apple Maps and Bing Maps." CTA: "Try for free now" |
| **Cliente-alvo** | Agência e prestador vendendo para negócio local. Exatamente o alvo da ProspectX |
| **Fonte de dados** | Google Maps, Apple Maps, Bing Maps. 195 países, 4.000+ categorias. Declara conformidade com GDPR/CCPA por usar só informação pública de empresa |
| **Modelo de preço** | Assinatura por **crédito de exportação**, com desbloqueio geográfico progressivo (cidade → país) |
| **Preço real [PÁGINA, 15/08/2026]** | Anual: Basic US$ 35 (10k) · Professional US$ 69 (20k) · Agency US$ 139 (40k) · Company US$ 350 (100k). Mensal: 49 / 99 / 199 / 499 |
| **Plano gratuito** | Teste de 7 dias com até 100 leads |
| **Onboarding** | Busca → resultado na hora |
| **Reclamações recorrentes** | Padrão da categoria: e-mail só existe para 40–60% dos negócios com site, e é genérico (`info@`, `contact@`) **[SECUNDÁRIA]** |
| **Fraqueza estrutural** | (a) Depende de raspagem do Google Maps — modelo que viola os termos do Google e vive de tolerância **[SECUNDÁRIA]**; (b) **o usuário tem que saber qual categoria buscar.** O produto não decide o alvo. Consertar isso exigiria construir exatamente o mapa que a ProspectX diz ter |

### 3.3 Lead Atlas — quem definiu o degrau de entrada real

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "Find Local Business Leads by City, ZIP Code, and Industry" / "Search by location and industry, then export structured business contact data for sales, marketing, and outreach." CTA: "Get 40 free credits" |
| **Cliente-alvo** | Micro. Quem quer 300 leads e sumir |
| **Fonte de dados** | "Dados públicos de contato empresarial", atualizados e deduplicados. **Fonte não nomeada** — sinal de que é raspagem |
| **Modelo de preço** | **Compra avulsa de crédito, sem assinatura, crédito não expira** |
| **Preço real [PÁGINA, 15/08/2026]** | Starter US$ 9 / 300 créditos (US$ 0,030 por lead) · Growth US$ 29 / 1.500 + 750 bônus (US$ 0,019) · Scale US$ 59 / 3.750 (US$ 0,016) |
| **Plano gratuito** | 40 créditos no cadastro |
| **Onboarding** | Cadastro → 40 leads grátis |
| **Reclamações recorrentes** | Não há volume público de resenhas. Produto pequeno **[NÃO VERIFICADO]** |
| **Fraqueza estrutural** | Sem retenção: crédito não expira e não há assinatura, então não há receita recorrente nem motivo para voltar. É um utilitário, não uma plataforma. **Esse também é o risco da ProspectX se ela virar "busca + exportação"** |

### 3.4 Instantly.ai — a base virou brinde

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "Find Clients" / "Get more clients by chatting to AI". CTA: "Get Started" |
| **Cliente-alvo** | Agência e fundador fazendo cold e-mail em volume |
| **Fonte de dados** | Base própria de 450M+ contatos B2B (origem não divulgada) + verificação |
| **Modelo de preço** | Modular: Outreach (envio) + Credits (base) + CRM, ou pacote |
| **Preço real [PÁGINA, 15/08/2026]** | Outreach: Growth US$ 47 · Hypergrowth US$ 97 · Lightspeed US$ 358. Pacotes: Starter US$ 94 (5k e-mails, 1k contatos, **1.500 créditos**, "450M+ B2B leads") · Scale US$ 194 · Agency US$ 555. Créditos avulsos: Growth US$ 47 / 1.500 |
| **Plano gratuito** | Não há plano gratuito permanente; sem cartão para começar |
| **Onboarding** | Precisa conectar caixas de e-mail e aquecer domínio — **dias, não minutos** |
| **Reclamações recorrentes** | Créditos não acumulam mês a mês **[SECUNDÁRIA]**; custo real do stack sobe rápido |
| **Fraqueza estrutural** | Ganha dinheiro com **volume de envio**. Não tem incentivo para reduzir a lista do cliente a 40 empresas certas — isso derruba o próprio ARPU. **Esse é o ponto exato em que a ProspectX pode se posicionar do lado contrário** |

**Nota crítica de precificação:** o crédito da ProspectX (R$ 4,97 no mensal cheio) precisa ser comparado com US$ 0,031 do crédito Instantly e US$ 0,030 do Lead Atlas. Ver seção 7.

### 3.5 Cognism — o exemplo de como se vende dado caro

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "Europe's most trusted B2B data for growing pipeline." / "Become fluent in your market with precise, compliant data for the companies and decision-makers that matter." CTA duplo: "See it in Action" + "Calculate ROI" |
| **Cliente-alvo** | Time de vendas europeu com orçamento. **Não vende para solo, e diz isso pelo formato do CTA** — não há botão de "começar grátis" |
| **Fonte de dados** | Compilação licenciada + verificação humana de celular ("Diamond Data", triagem contra listas DNC) |
| **Modelo de preço** | Taxa de plataforma + assento + pool de créditos negociado |
| **Preço real** | **Não publica.** Estimativas de terceiros: ~US$ 15.000–25.000/ano de plataforma + US$ 1.500–2.500/assento/ano **[SECUNDÁRIA]**. Sem teste gratuito, só contrato anual |
| **Plano gratuito** | Não |
| **Onboarding** | Demo com vendedor. Semanas |
| **Reclamações recorrentes** | **[NÃO VERIFICADO]** — não foi possível ler resenhas em volume |
| **Fraqueza estrutural** | Verificação humana de telefone é cara e não escala para milhões de micro empresas. Cognism nunca vai descer para o SMB local: o custo unitário do dado deles não fecha abaixo de contrato de 5 dígitos |

### 3.6 UpLead — o mais próximo do "filtro por setor"

| Eixo | Resposta |
|---|---|
| **Proposta (literal, home, 15/08/2026)** | "Real-time verified B2B emails, mobile numbers and intent data" / "200M+ leads, AI-verified as you search and ranked by freshness". CTA: "Grab 5 Free Leads Now". Garantia: "95%+ accuracy guarantee" |
| **Cliente-alvo** | PME B2B. Material de marketing deles cita explicitamente busca por **SIC code** para achar "os tipos de negócio que você quer limpar" (limpeza comercial) **[SECUNDÁRIA]** |
| **Fonte de dados** | Agregação + verificação em tempo real no momento da busca |
| **Modelo de preço** | Assinatura + crédito por registro revelado |
| **Preço real [PÁGINA, 15/08/2026]** | Teste 7 dias, 5 créditos · Essentials US$ 99/mês (170 créditos) ou US$ 74/mês anual (2.040/ano) · Plus US$ 199/mês (400) ou US$ 149 anual (4.800/ano) · Professional sob consulta. Crédito extra US$ 0,60 |
| **Plano gratuito** | Só teste de 7 dias com 5 créditos |
| **Onboarding** | Minutos |
| **Reclamações recorrentes** | **[NÃO VERIFICADO]** |
| **Fraqueza estrutural** | **Aqui está a prova do espaço vazio:** a UpLead vende exatamente "ache as indústrias que contratam seu serviço" — mas o **cliente precisa descobrir o SIC code sozinho** e o próprio marketing deles ensina isso num post de blog. A tradução serviço → setor está terceirizada para o cliente. Consertar exigiria o mapa |

### 3.7 Marketplaces de lead (Thumbtack / Angi / Bark) — o concorrente pelo orçamento

| Eixo | Resposta |
|---|---|
| **Proposta** | "Receba clientes prontos, sem prospectar" |
| **Cliente-alvo** | Exatamente o prestador solo alvo da ProspectX |
| **Fonte de dados** | Demanda gerada por eles próprios (mídia paga + SEO). Não é base, é fluxo |
| **Modelo de preço** | Pay-per-lead, crédito consumível, às vezes + assinatura |
| **Preço real** | Thumbtack US$ 8–150+ (US$ 25–75 típico); Angi US$ 15–85 + ~US$ 300/ano; Bark ~£1,20/crédito, 5–20 créditos por lead **[SECUNDÁRIA]** |
| **Plano gratuito** | Perfil grátis, lead pago |
| **Onboarding** | Horas |
| **Reclamações recorrentes** | Lead fantasma cobrado (BBB, jan/2026: US$ 30,31 por contato que negou ter pedido orçamento); taxa de contratação de 5–7%; lead vendido a 4–5 profissionais; dificuldade de cancelar; créditos Bark passaram a expirar em 3 meses **[SECUNDÁRIA]** |
| **Fraqueza estrutural** | **O modelo exige revender o mesmo lead.** Vender exclusividade destruiria a receita por lead. Eles não podem consertar isso. É a maior brecha de mensagem disponível para a ProspectX |

### 3.8 Fichas resumidas dos demais

| Produto | Fonte de dados | Modelo | Entrada | Grátis | Fraqueza estrutural |
|---|---|---|---|---|---|
| **ZoomInfo** | Compilação + contribuição + intent | Plataforma + assento (mín. 3) + créditos | US$ 15k–60k/ano **[SECUNDÁRIA]** | Não | Custo de aquisição impede qualquer movimento para baixo |
| **Seamless.AI** | Busca em tempo real na web | Assento + crédito, contrato anual | ~US$ 147/usuário/mês **[SECUNDÁRIA]** | 50 créditos vitalícios | Reputação de cobrança (Trustpilot 1,4/5; 79 queixas no BBB em 3 anos) **[SECUNDÁRIA]** |
| **Kaspr** | LinkedIn + contribuição | Assento + créditos de telefone | €45/usuário/mês; e-mail B2B ilimitado, 12.000 exportações/ano **[PÁGINA]** | Sim: 15 e-mails, 5 telefones/mês | Só existe onde há LinkedIn. Inútil para SMB local |
| **Hunter.io** | Crawl de domínio | Crédito de busca/verificação | US$ 34/mês anual, 2.000 créditos **[PÁGINA]** | Sim: 50 créditos/mês | Parte do domínio: você já precisa saber a empresa |
| **Snov.io** | Agregação + verificação | Crédito | US$ 29,25/mês, 1.000 créditos **[PÁGINA]** | Teste renovável, 50 créditos | Sem foco geográfico local |
| **Saleshandy** | Lead Finder + disparo | Prospects ativos | US$ 25/mês, 2.000 prospects **[PÁGINA]** | Não claro | Vive de volume de envio |
| **Data Axle Salesgenie** | Compilação própria EUA (listas telefônicas + verificação) | Assinatura + créditos | US$ 99/mês **com contrato de 12 meses** **[SECUNDÁRIA]** | 3 dias | Contrato anual afasta o solo; produto e UX de outra década |
| **Outscraper** | Google Maps e outras | **Por registro, pré-pago, sem mensalidade** | US$ 1–9 por 1.000 registros **[PÁGINA]** | Sim: 500 negócios | É ferramenta técnica, não produto de negócio. Sem funil, sem contexto |
| **LeadSwift** | Maps/Yelp/Facebook/YellowPages ao vivo | Assinatura por **buscas/dia**, leads ilimitados | US$ 19,99/mês anual **[PÁGINA]** | Teste 7 dias sem cartão | Limitar por busca/dia é hostil a quem faz uma campanha e some |
| **D7 Lead Finder** | Raspagem multi-fonte, 65M+ leads | Assinatura por buscas/dia | US$ 44,99/mês **[SECUNDÁRIA]** | Sem teste público | G2 3,7/5 em 5 resenhas; e-mails genéricos; sem reembolso por dado errado **[SECUNDÁRIA]** |
| **B2BLeadFinder** | **Google Places API** + score de lacuna digital | Assinatura | US$ 14,99/mês **[PÁGINA parcial]** | 7 dias, 25 scans | Nicho estreito (só vende para quem vende site/SEO) |
| **Ocean.io** | 35M empresas, 330M pontos | Crédito com slider, usuários ilimitados | ~US$ 0,071/crédito, mín. 750 **[SECUNDÁRIA]** | **[NÃO VERIFICADO]** | Lookalike exige cliente existente |
| **Clay** | Orquestração de 100+ fornecedores | Data Credits + Actions | Launch US$ 185/mês, Growth US$ 495 **[SECUNDÁRIA]** | Free: 100 créditos + 500 ações **[SECUNDÁRIA]** | Exige operador técnico. Não é produto de prestador solo |
| **LinkedIn Sales Navigator** | LinkedIn | Assento | ~US$ 99–119/mês **[SECUNDÁRIA]** | Teste | Empresa local sem página no LinkedIn é invisível |
| **Stotles** | Portais públicos UK/IE agregados | Free / £50 por usuário/mês / £475+ **[SECUNDÁRIA]** | **Plano gratuito com usuários ilimitados** | Só setor público, só UK/IE |

---

## 4. Matriz de funcionalidades — nós × eles

Legenda: ✅ tem · ⚠️ parcial · ❌ não tem · **🚫 deliberadamente não vamos ter**

| Funcionalidade | ProspectX (hoje) | Apollo | Scrap.io | Instantly | UpLead | Lead Atlas | Recomendação |
|---|---|---|---|---|---|---|---|
| Busca por cidade + segmento | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | Mesa posta. Não é diferencial |
| **Mapa serviço → setores que contratam** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Único ativo. Construir em cima disso** |
| Tradução PT/EN/ES do mapa | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | Manter — é o que viabiliza EUA/UK/AU + Brasil no mesmo produto |
| Cobertura de dado local real | ❌ (OSM ruim) | ❌ | ✅ | ⚠️ | ⚠️ | ✅ | **Bloqueador nº 1. Nada mais importa até resolver** |
| Decisor nomeado + cargo | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | **🚫 Não perseguir.** Perde por definição para Apollo/Cognism |
| Celular verificado | ❌ | ⚠️ | ❌ | ⚠️ | ✅ | ❌ | **🚫 Não construir.** Custo unitário incompatível com o preço-alvo |
| Verificação de e-mail | **[NÃO VERIFICADO]** | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | Obrigatório antes de qualquer disparo. Terceirizar |
| Funil / CRM leve | ✅ | ✅ | ⚠️ | ✅ | ❌ | ❌ | Commodity. Manter mínimo, não investir |
| Disparo de e-mail em lote | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | **Reavaliar.** Ver seção 7, item 4 — risco desproporcional |
| Aquecimento de domínio / infra de entrega | ❌ | ⚠️ | ❌ | ✅ | ❌ | ❌ | **🚫 Não construir.** É o negócio do Instantly, não o nosso |
| IA que sugere a abordagem | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | **Commoditizado em 2026.** Não é argumento de venda. Manter, não anunciar como diferencial |
| Dados de intenção (intent) | ❌ | ✅ | ❌ | ⚠️ | ✅ | ❌ | **🚫 Não construir.** Requer rede de coleta que não temos |
| Integração bidirecional com CRM | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | **🚫 Não construir.** Prestador solo não tem CRM |
| API pública | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | **🚫 Adiar.** Público errado |
| Plano gratuito real | ❌ | ✅ | ⚠️ (7 dias) | ❌ | ⚠️ (5 leads) | ✅ (40 créditos) | **Construir. É a maior lacuna competitiva atual** |
| Busca visível antes do cadastro | **[NÃO VERIFICADO]** | ❌ | ❌ | ❌ | ❌ | ❌ | **Construir. Ninguém faz. Diferencia na hora** |
| Multi-assento | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | **🚫 Não construir.** Cliente é solo |

**Leitura da matriz:** de 17 linhas, 8 são coisas que a ProspectX **não deve** construir. O produto ganha por subtração, não por paridade.

---

## 5. Mapa de posicionamento

### Eixo escolhido (e por quê)

Descartei "preço × funcionalidades" — não decide nada. Os dois eixos que decidem são:

- **Eixo X — Quem escolhe o alvo:** o produto decide para quem você deve vender ← → você tem que saber e digitar
- **Eixo Y — Que tipo de empresa está na base:** micro/local (oficina, obra, restaurante, transportadora) ← → corporativa com decisor nomeado

```
                      CORPORATIVA, DECISOR NOMEADO
                                  ▲
                                  │
        Ocean.io ·  Unify         │   ZoomInfo · Cognism
        Keyplay · Clay            │   Apollo · Lusha · UpLead
        (lookalike: decide,       │   Sales Navigator
         mas exige cliente        │   Lead411 · Seamless · Kaspr
         existente)               │
                                  │
   PRODUTO DECIDE ◄───────────────┼───────────────► CLIENTE DECIDE
      O ALVO                      │                   O ALVO
                                  │
       ██████████████             │   Scrap.io · D7 · LeadSwift
       █  PROSPECTX  █            │   Outscraper · Lead Atlas
       █  (declarado)█            │   B2BLeadFinder
       ██████████████             │   Data Axle Salesgenie
        vazio hoje                │
                                  │   [Angi · Thumbtack · Bark:
                                  │    fora do plano — vendem
                                  ▼    demanda, não base]
                       MICRO / LOCAL
```

### O que o mapa mostra

1. **O quadrante inferior-esquerdo está genuinamente vazio.** Nenhum produto encontrado decide o alvo para quem vende a negócio local.
2. **O quadrante superior-esquerdo é habitado, mas com pré-requisito fatal:** Ocean.io, Unify e Keyplay decidem o alvo — a partir de clientes que você já tem. Quem tem zero clientes não entra.
3. **Aplicando o princípio "ausência raramente é oportunidade":** o quadrante vazio tem três explicações plausíveis, e é preciso saber qual é.
   - *(a) Ninguém pensou.* Improvável. UpLead escreve blog ensinando SIC code para limpeza comercial — o problema é conhecido, a solução foi deixada como conteúdo, não como produto.
   - *(b) O mercado não paga.* Plausível. Quem tem zero clientes tem baixa disposição a pagar e alta rotatividade. É o pior segmento de SaaS que existe.
   - *(c) O valor não é defensável.* **Esta é a explicação mais forte.** A tradução "manutenção industrial → indústria, construtora, estaleiro" é reproduzível por qualquer LLM em 2026, de graça. O mapa não é fosso; é conveniência. O fosso teria que ser a base de dados por trás — que hoje é o ponto fraco.

   **Conclusão honesta:** o quadrante está vazio principalmente por (c), com contribuição de (b). Isso não invalida o produto — invalida a estratégia de vender o mapa como se fosse o produto.

---

## 6. Espaços não atendidos (cada um com a evidência)

### 6.1 Tradução serviço → setor comprador
**Evidência:** UpLead vende busca por SIC code e publica conteúdo ensinando o cliente a descobrir o próprio SIC **[SECUNDÁRIA]**. Scrap.io exige a categoria do Google Maps. Apollo exige o filtro de indústria. Nenhum decide.
**Tamanho do espaço:** não mensurado **[NÃO VERIFICADO]**.
**Risco:** replicável por LLM. Vale como onboarding, não como fosso.

### 6.2 Descoberta de ICP para quem tem zero clientes
**Evidência:** Ocean.io ("lookalike a partir dos seus clientes"), Unify (scoring + lookalike), Keyplay, Clay — toda a categoria pressupõe base instalada.
**Risco:** o público sem clientes é o de menor disposição a pagar. Precifique conforme.

### 6.3 Plano gratuito de verdade no segmento de leads locais
**Evidência [PÁGINA]:** Scrap.io = teste de 7 dias; UpLead = 5 créditos; D7 = nada; LeadSwift = 7 dias. Só Lead Atlas (40 créditos permanentes) e Apollo (10 exportações/mês) oferecem entrada gratuita contínua. **A ProspectX hoje não tem nenhuma.**
**Oportunidade direta:** com zero assinantes e zero marca em três países novos, não existe caminho de conversão sem prova gratuita.

### 6.4 Resultado visível antes do cadastro
**Evidência:** nenhum dos 6 produtos cujas home foram lidas em 15/08/2026 mostra resultado real antes do cadastro; todos abrem com "Sign up for free" / "Try for free" / "Get Started" / "Get 40 free credits".
**Leitura:** ninguém confia no próprio resultado o bastante para mostrá-lo cru. Quem mostrar primeiro compra credibilidade barata — **mas só pode mostrar se o dado prestar.**

### 6.5 Exclusividade do lead
**Evidência:** Angi/Thumbtack/Bark vendem o mesmo lead a 4–5 profissionais; 78% dos clientes contratam quem responde primeiro; custo por trabalho fechado de US$ 250–542 **[SECUNDÁRIA]**.
**Oportunidade:** a mensagem "ninguém mais recebeu esta lista" é verdadeira num produto de prospecção ativa e impossível num marketplace. É a melhor munição de copy disponível.

### 6.6 Cobertura de Austrália
**Evidência:** Cognism se posiciona como "Europe's most trusted B2B data" (literal, home 15/08/2026) — Austrália não aparece. Apollo tem precisão ~60% fora dos EUA **[SECUNDÁRIA]**. Fornecedores locais (InfobelPRO, KnowFirst, LeadLists) existem, e a Austrália tem registro público massivo e legalmente extraível (ABN Lookup / ABR, 20M+ registros).
**Oportunidade:** é o país onde a assimetria "dado oficial gratuito e limpo × cobertura fraca dos gigantes" é maior. **Mas atenção:** o Spam Act australiano é o mais restritivo dos três para e-mail não solicitado, exigindo permissão. Antes de qualquer disparo em massa na AU, acionar `especialista-privacidade` e `especialista-deliverability`.

### 6.7 SEO programático por par "serviço × cidade"
**Evidência:** os concorrentes brigam por termos genéricos e saturados ("b2b lead generation", "google maps scraper", "email finder"). Ninguém ocupa "quem contrata [serviço]".
**Oportunidade:** 531 termos × 3 idiomas × N cidades é um mapa de conteúdo pronto. É o único ativo da ProspectX que **não** é replicável em uma tarde — porque exige a curadoria dos 1.187 pares. Handoff para `especialista-seo` e `prospectx-growth`.

### 6.8 Onde a ausência NÃO é oportunidade — registre
- **Ninguém vende dado de SMB local com decisor nomeado.** Não é descuido: o dado não existe em escala e verificá-lo custa mais do que o segmento paga. Não persiga.
- **Ninguém cobra assinatura alta de prestador solo sem marca.** Data Axle exige contrato de 12 meses e é a exceção — com produto vendido por telefone há décadas. Não é modelo replicável por um SaaS novo sem força de vendas.

---

## 7. Recomendação — 5 movimentos, ordenados por impacto sobre esforço

### Movimento 1 — Congelar a promessa de cobertura até a base existir (impacto altíssimo / esforço zero)
Nada neste relatório importa se a busca voltar vazia. Enquanto a fonte for OpenStreetMap, **não anunciar cobertura, não abrir mídia paga, não lançar plano gratuito** — cada busca vazia gasta a única coisa que a ProspectX tem hoje, que é o benefício da dúvida.
Dado de contexto para a decisão de fonte: o OSM tem cobertura de ~26% e taxa de preenchimento de ~39,8% num estudo comparativo, contra ~100% e ~95,6% de um fornecedor comercial **[SECUNDÁRIA]**. O problema é estrutural, não de query.
Assimetria competitiva a registrar: **B2BLeadFinder declara usar a Google Places API; Scrap.io, Outscraper e D7 operam por raspagem, modelo que viola os termos do Google e vive de tolerância [SECUNDÁRIA].** A ProspectX descartou o Google por respeitar os termos — e paga o preço disso sozinha. Isso vira argumento de venda ("nosso dado é licenciado") **só depois** que a base licenciada existir. Handoff para `engenheiro-dados`.

### Movimento 2 — Inverter a promessa: de "base" para "alvo", com prova antes do cadastro (impacto alto / esforço baixo)
A home não deve prometer registros; deve executar o mapa na frente do visitante. Fluxo: campo único ("o que você faz" + "onde") → tela mostra **os setores que contratam aquele serviço** e a contagem de empresas por setor → cadastro só para ver os contatos.
Isso entrega três coisas de uma vez: (i) demonstra o único ativo proprietário; (ii) ocupa o espaço 6.4, que ninguém ocupa; (iii) transforma os 1.187 pares em landing pages de SEO programático.
Ninguém entre os 6 concorrentes lidos mostra resultado antes do cadastro.

### Movimento 3 — Refazer o modelo de cobrança (impacto alto / esforço médio)
O preço atual está fora de faixa em três dimensões ao mesmo tempo. Cálculo em BRL, sem conversão (ver ressalva abaixo):

| Plano ProspectX | Preço | Créditos/mês | **R$ por crédito** |
|---|---|---|---|
| Mensal | R$ 497 | 100 | **R$ 4,97** |
| Trimestral | R$ 1.377 (R$ 459/mês) | 135 | R$ 3,40 |
| Semestral | R$ 2.497 (R$ 416/mês) | 180 | R$ 2,31 |
| Anual | R$ 4.497 (R$ 375/mês) | 240 | R$ 1,56 |
| Fundador mensal | R$ 197 | 100 | R$ 1,97 |
| Fundador anual | R$ 1.707 | 240 | R$ 0,59 |

Referência de mercado por registro, verificada em página em 15/08/2026: **Lead Atlas US$ 0,030 · Instantly US$ 0,031 · Hunter US$ 0,017 · Snov.io US$ 0,029 · Scrap.io US$ 0,0035 · Outscraper US$ 0,001–0,009.** Apenas UpLead (US$ 0,58/crédito) está acima — e entrega e-mail verificado, celular e garantia de 95%.

Mesmo sem fixar taxa de câmbio, a distância é de **uma a duas ordens de grandeza** em qualquer paridade plausível. Três correções:
- **Não cobre "crédito" sem definir publicamente o que ele compra.** Hoje isso é uma incógnita até internamente — ver seção 8. Crédito indefinido é o modelo que mais assusta comprador que não sabe estimar consumo, e o prestador solo é exatamente esse comprador.
- **Cobre por registro exportado, não por busca.** Alinha preço com valor entregue, é o modelo do Apollo no plano gratuito (limita exportação, não visualização) e permite mostrar o resultado antes de cobrar.
- **Desça o degrau de entrada e crie plano gratuito permanente.** O degrau abandonado no segmento local é abaixo de US$ 9–15/mês; o degrau abandonado no segmento de sales intelligence é abaixo de US$ 29–49/mês. Detalhamento no handoff para `analista-precificacao`.

### Movimento 4 — Reavaliar o disparo de e-mail em lote como funcionalidade central (impacto médio / esforço negativo — é remoção)
O disparo compete com Instantly (US$ 47), Saleshandy (US$ 25) e lemlist, que investem em infraestrutura de entrega, aquecimento de domínio e rede privada de IPs. Uma ferramenta de dados que dispara sem essa infraestrutura queima o domínio do cliente e leva a culpa. Some-se: **o Spam Act australiano exige permissão prévia**, o que torna o disparo em massa na AU juridicamente arriscado **[SECUNDÁRIA — confirmar com `especialista-privacidade`]**; UK (PECR) permite para assinante corporativo com opt-out; EUA (CAN-SPAM) permite com opt-out e endereço físico, com multa de até US$ 53.088 por mensagem na correção inflacionária de 2026 da FTC **[SECUNDÁRIA]**.
Recomendação: manter envio em volume baixo como conveniência, **nunca posicioná-lo como pilar**, e não competir em capacidade de envio.

### Movimento 5 — Escolher uma cabeça de ponte: um serviço, um país (impacto médio-alto / esforço médio)
531 termos × 3 países × 3 idiomas é uma promessa que a base não sustenta e que o marketing não consegue defender. Escolha um par serviço × país onde exista fonte oficial gratuita e limpa — Reino Unido é o candidato natural (Companies House com SIC code, dado estruturado e livre; PECR permite e-mail B2B corporativo com opt-out). Prove o mapa em um vertical, com dado que presta, antes de abrir os 531.
Efeito colateral bom: um vertical estreito é o único jeito de o Instagram em inglês gerar demanda qualificada em vez de curtida.

---

## 8. O que ficou não verificado

**Preços que não consegui ler na página do fornecedor** (páginas bloqueadas ou renderizadas por JS, testadas em 15/08/2026): Apollo.io, Lusha, ZoomInfo, Cognism, Seamless.AI, Lead411, Wiza, lemlist, Clay, LinkedIn Sales Navigator, Data Axle Salesgenie, D7 Lead Finder, Ocean.io, BookYourData, GetProspect, Stotles, Thumbtack, Angi, Bark. Tudo o que consta deles neste relatório é **[SECUNDÁRIA]** e serve só para faixa. **Antes de qualquer decisão de preço, `analista-precificacao` deve reconferir na página do fornecedor.**

**Sobre a própria ProspectX:**
- Preços em USD, GBP e AUD — **[NÃO VERIFICADO]**, não me foram informados. Toda comparação internacional deste relatório está incompleta sem eles.
- **O que 1 crédito da ProspectX compra** (uma busca? um registro exibido? um registro exportado? um e-mail enviado?) — **[NÃO VERIFICADO]**. Este é o item mais urgente: metade da análise de preço depende dele.
- Existência de plano gratuito, teste sem cartão e se a busca aparece antes do cadastro — **[NÃO VERIFICADO]**.
- Acurácia dos 1.187 pares "quem contrata quem" — **[NÃO VERIFICADO]**. Não foi auditado nenhum par. Se o mapa é o ativo, ele precisa de auditoria por amostragem antes de virar promessa pública.

**Sobre os concorrentes:**
- Faturamento, número de clientes, base instalada e rodadas de investimento de **todos** os concorrentes citados — **[NÃO VERIFICADO]** e deliberadamente ausentes. Nenhum número desse tipo aparece neste relatório.
- Participação de mercado por país — **[NÃO VERIFICADO]**.
- Cobertura real de Apollo/Lusha/Cognism na Austrália e no Reino Unido para micro empresa local — **[NÃO VERIFICADO]**. Só há indícios (posicionamento europeu da Cognism, precisão internacional citada de ~60% da Apollo em fonte secundária). **Testar com plano gratuito legítimo antes de afirmar qualquer coisa em copy.**
- Reclamações de Scrap.io, Lead Atlas, B2BLeadFinder e Ocean.io — **[NÃO VERIFICADO]**, volume público de resenhas insuficiente.
- Se algum concorrente já testou e abandonou o mapeamento "quem contrata quem" — **[NÃO VERIFICADO]**. Não encontrei produto morto nem post-mortem público. A ausência de evidência aqui é literal: não achei nem quem tentou, nem quem falhou.

**Interpretação jurídica:** as referências a CAN-SPAM, PECR, GDPR e Spam Act vieram de material secundário e **não substituem parecer**. Encaminhar a `especialista-privacidade` e `juridico-internacional` antes de qualquer campanha.

---

## Handoffs

### → `analista-precificacao`

**Faixa de preço do mercado (mensal, entrada, verificada em página quando marcado [PÁGINA]):**

| Segmento | Piso | Mediana aproximada | Teto self-serve |
|---|---|---|---|
| Leads locais por mapa | US$ 9 avulso (Lead Atlas) [PÁGINA] · US$ 14,99 (B2BLeadFinder) [PÁGINA] | **US$ 35–49** [PÁGINA] | US$ 350–499 (Scrap.io Company) [PÁGINA] |
| Prospecção + disparo | US$ 25 (Saleshandy) [PÁGINA] | **US$ 47–69** [PÁGINA] | US$ 358–555 (Instantly) [PÁGINA] |
| Sales intelligence self-serve | US$ 29,25 (Snov.io) [PÁGINA] · €45 (Kaspr) [PÁGINA] | **US$ 49–99** | US$ 199 (UpLead Plus) [PÁGINA] |
| Sales intelligence enterprise | US$ 15.000/ano [SECUNDÁRIA] | — | US$ 60.000/ano [SECUNDÁRIA] |

**Modelo de cobrança predominante:** crédito consumível mensal, sem acúmulo (Apollo, Instantly, Snov, Hunter, UpLead). O modelo em ascensão e mais alinhado ao valor é **crédito de exportação** (Scrap.io, Apollo no plano gratuito) e **crédito avulso que não expira** (Lead Atlas, Outscraper). Cobrança por assento é padrão só no bloco corporativo — e é exatamente o que repele o profissional solo.

**Degrau de entrada abandonado (a informação que você pediu):**
1. **Abaixo de US$ 9/mês não existe produto pago no segmento local.** Só Lead Atlas (US$ 9 avulso) e Apollo (grátis com 10 exportações/mês) ocupam a base.
2. **Não existe plano intermediário entre "grátis com 10 exportações" e "US$ 35–49/mês com 10.000 créditos".** Quem precisa de 100–300 registros por mês, mensalmente, não tem produto. É o buraco mais concreto do mercado — e é o perfil exato do prestador solo.
3. **Ninguém no segmento local cobra por assento** — portanto não copie isso.

**Alerta de posição atual:** o crédito da ProspectX custa **R$ 4,97** no plano mensal cheio contra referências de **US$ 0,003 a US$ 0,031** por registro no segmento local. Antes de qualquer ajuste, **defina publicamente o que um crédito compra** — sem isso o número não é comparável e o cliente não consegue estimar consumo. Preciso da definição e dos preços em USD/GBP/AUD para fechar a análise.

### → `copywriter-conversao`

**Frases literais já usadas pelo mercado (colhidas das home em 15/08/2026) — não repetir nenhuma:**

| Concorrente | Headline literal |
|---|---|
| Apollo.io | "The AI sales platform for smarter, faster revenue growth" |
| Instantly.ai | "Find Clients" / "Get more clients by chatting to AI" |
| Cognism | "Europe's most trusted B2B data for growing pipeline" |
| Scrap.io | "Local Leads Generator" / "Target businesses you won't find on LinkedIn" |
| UpLead | "Real-time verified B2B emails, mobile numbers and intent data" / "200M+ leads" |
| Clay | "Build systems to grow revenue" |
| Lead Atlas | "Find Local Business Leads by City, ZIP Code, and Industry" |
| B2BLeadFinder | "Find Businesses That Don't Have a Website" |

**Padrões saturados — queimados, evitar:** "AI sales platform", "find clients", "build pipeline", "verified emails", "[N] million/billion leads", "most trusted data", "start free trial", "get started", "no credit card required", "95% accuracy guarantee". Contagem de registros como manchete está morta: todo mundo tem centenas de milhões e o comprador já não acredita.

**A fraqueza que a nossa mensagem deve explorar (em ordem de força):**
1. **O lead comprado não é seu.** Angi/Thumbtack/Bark vendem o mesmo contato a 4–5 profissionais; 78% dos clientes fecham com quem responde primeiro; o trabalho fechado sai por US$ 250–542 **[SECUNDÁRIA]**. Eles **não podem** parar de revender — é o modelo. Ângulo: *"a lista é sua. Ninguém mais recebeu."*
2. **Todas as ferramentas exigem que você já saiba quem procurar.** Apollo pede código de indústria; Scrap.io pede a categoria; a UpLead escreve blog ensinando SIC code. Ângulo: *"você diz o que faz. Nós dizemos para quem vender."*
3. **Volume não é resposta.** 450 milhões de contatos e bounce de 20–30% relatado nas resenhas do Apollo **[SECUNDÁRIA]**. Ângulo: *"40 empresas certas valem mais que 4.000 e-mails."*
4. **Contrato anual e cancelamento difícil** — Seamless.AI (Trustpilot 1,4/5, 79 queixas no BBB em 3 anos) e Data Axle (12 meses obrigatórios) **[SECUNDÁRIA]**. Ângulo: sem contrato, sem multa.

**Restrição obrigatória:** nenhuma promessa de cobertura, número de empresas ou taxa de acerto entra na copy enquanto o `engenheiro-dados` não confirmar a base. Use `[PREENCHER]`.

### → `prospectx-produto`

**Construir (nesta ordem):**
1. **Busca demonstrada antes do cadastro** — mostrar os setores que contratam o serviço informado e a contagem por setor, sem login. Nenhum dos 6 concorrentes analisados faz isso. É o movimento de diferenciação mais barato disponível.
2. **Plano gratuito permanente com limite de exportação, não de visualização** — copie o *mecanismo* do Apollo (ver tudo, pagar para levar), não a tabela dele. Hoje a ProspectX é o único produto do estudo sem porta de entrada gratuita, com zero marca em três países novos.
3. **Definir e exibir o que 1 crédito compra.** Bloqueador de precificação e de conversão.
4. **Auditoria por amostragem dos 1.187 pares.** Se o mapa é o ativo, ele precisa ser verdadeiro antes de virar manchete.
5. **Um vertical, um país, provado ponta a ponta** antes de abrir os 531 termos.

**Ignorar deliberadamente (e dizer isso na página, porque recusa explícita vende):** decisor nomeado, celular verificado, dados de intenção, integração bidirecional com CRM, API pública, multi-assento, infraestrutura de aquecimento de domínio. São sete linhas da matriz onde a derrota é estrutural e a tentativa de empate consome todo o roadmap.

**Fazer diferente:**
- **Onde os outros cobram por assento, cobre por registro exportado.** Assento é o modelo que pune o profissional solo — e o solo é o nosso cliente.
- **Onde os outros vendem volume, venda corte.** O incentivo do Instantly é o cliente enviar mais; o nosso tem que ser o cliente enviar menos e melhor. Isso é posicionamento, e precisa aparecer na tela — mostre por que aquela empresa entrou na lista, não só que entrou.
- **Onde os outros escondem a origem do dado** (Lead Atlas não nomeia a fonte; Scrap.io e D7 raspam o Google contra os termos), **declare a nossa.** Só depois que ela existir e for licenciada. É a única vantagem que a decisão de descartar o Google Places pode gerar.

### → `prospectx-growth` e `especialista-seo`

**Por onde o concorrente capta:** conteúdo comparativo de fundo de funil em escala industrial ("X pricing 2026", "melhores alternativas a Y") — os resultados de busca desta pesquisa foram dominados por blogs de concorrentes atacando concorrentes; extensão de Chrome como porta de entrada (Lusha, Kaspr, Wiza); plano gratuito como canal de aquisição (Apollo); diretórios de software (G2, Capterra, SourceForge, Slashdot).

**Termos já dominados — não brigar:** "b2b lead generation tools", "google maps scraper", "email finder", "sales prospecting tools", "[concorrente] pricing", "[concorrente] alternatives", "lead generation software".

**Território livre, e é o nosso:** a família "**who hires / who buys [serviço]**" e "**companies that hire [serviço] in [cidade]**", nos três idiomas. 531 termos × 3 idiomas × cidades é um mapa de conteúdo programático que nenhum concorrente pode montar sem antes construir a curadoria dos 1.187 pares. É o único ativo da ProspectX que não se copia numa tarde.

**Ressalva de sequência:** página programática que devolve resultado vazio é pior que página inexistente — o Google mede isso e o visitante nunca volta. Só publicar a malha depois do Movimento 1.
