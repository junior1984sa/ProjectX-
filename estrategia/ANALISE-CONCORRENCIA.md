# ProspectX — Análise de Inteligência Competitiva

**Analista:** Inteligência Competitiva e de Mercado
**Data da pesquisa:** 15 de agosto de 2026
**Escopo:** Estados Unidos, Reino Unido, Austrália (mercados-alvo declarados) + Brasil (mercado secundário)
**Estado do produto analisado:** ProspectX no ar, zero assinantes, base atual em OpenStreetMap/Overpass

> **Regra aplicada neste documento:** todo preço citado foi lido na página de preços do próprio fornecedor em 15/08/2026, salvo quando marcado `[FONTE SECUNDÁRIA]` ou `[NÃO VERIFICADO]`. Nenhum número de faturamento, base de clientes ou rodada de investimento foi estimado. Câmbio de referência: **1 USD = 5,19 BRL** (cotação de mercado consultada em 15/08/2026, `[FONTE SECUNDÁRIA]`).

---

## 1. Sumário Executivo

**A ProspectX está posicionada num preço que o mercado não pratica, com uma fonte de dados que o mercado comoditizou, contra um diferencial que o mercado não cobra separadamente.** Essas são três conclusões independentes e cada uma sozinha já impede a venda.

**Primeiro: o preço por registro está fora da curva por uma ordem de grandeza.** A ProspectX cobra R$ 497/mês por 100 créditos — **US$ 0,96 por contato revelado**. O RocketReach entrega exatamente os mesmos 100 lookups/mês por US$ 27/mês (US$ 0,27). O Lead411 entrega 1.000 exportações/mês por US$ 49 (US$ 0,049), com rollover. Nem o plano fundador (R$ 197 ≈ US$ 0,38/crédito) chega ao degrau de entrada do mercado. Não existe cliente informado que pague isso.

**Segundo: a fonte de dados escolhida é justamente aquela cujo preço de mercado caiu a quase zero.** Dados de estabelecimento local — nome, endereço, telefone, site — que é o que o OpenStreetMap devolve, são vendidos hoje a **US$ 1,50 por 1.000 registros** no Apify e a partir de **US$ 3,00 por 1.000** no Outscraper `[FONTE SECUNDÁRIA]`. A ProspectX está cobrando US$ 960 pelo mesmo volume de mil registros. O problema de qualidade que o dono já detectou não é um bug de implementação: é a consequência de ter escolhido a camada mais barata e mais copiável da cadeia.

**Terceiro: o diferencial real — o mapa de 1.187 pares "quem contrata quem" — é genuinamente raro, e essa raridade merece desconfiança antes de comemoração.** Não encontrei nenhum produto cujo eixo central seja "informe o seu serviço e receba os segmentos que compram esse serviço". Mas o mercado resolve o mesmo problema por três caminhos que já funcionam e já foram pagos: filtro por código setorial (SIC/NAICS, presente em todo mundo), *lookalike* a partir da carteira existente (Ocean.io) e dado de intenção de compra (Bombora, 6sense, Cognism Pro). O mapa estático é a versão mais fraca das três, porque um par fixo "manutenção industrial → indústria" é conhecimento que qualquer prestador com dois anos de ofício já tem de cabeça. **O que ele não tem é a lista com contato e um sinal de que aquela empresa está comprando agora.** É esse o produto.

**Onde está a oportunidade real:** todos os fornecedores sérios de dados abandonaram deliberadamente o profissional solo. Cognism exige 5 assentos e não publica preço. ZoomInfo cota na casa dos cinco dígitos anuais. Apollo cobra por assento e desenha tudo para equipe de SDR. Abaixo desse degrau só sobrou o *scraper* cru (US$ 1,50/mil, sem interpretação) e o marketplace de leads (Bark, Thumbtack: **US$ 15 a US$ 60 por lead**, com 75% de fantasma reportado). **Existe um vão real entre "planilha crua barata demais para usar" e "lead de marketplace caro demais para escalar" — e é nesse vão que a ProspectX pode viver, se abandonar o preço atual e trocar a fonte de dados.**

---

## 2. Mapa do mercado

### 2.1 Concorrentes diretos (vendem lista de empresas + contato para prospecção ativa)

| Camada | Players | Faixa de entrada |
|---|---|---|
| **Enterprise / sem preço público** | ZoomInfo, Cognism, Dun & Bradstreet, illion (AU), Data Axle, Bureau van Dijk/FAME (UK) | Cotação comercial; 5+ assentos |
| **Mid-market self-service** | Apollo.io, Lusha, Seamless.ai, Amplemarket | US$ 49–119/assento/mês |
| **Solo-friendly self-service** | RocketReach, Lead411, Hunter, UpLead, Kaspr, Wiza, Skrapp | US$ 27–99/mês |
| **Local / geo-segmentado** | **LeadSwift**, Outscraper, Apify (Compass), D7 Lead Finder, GMapsScraper, MapLeadScraper, Targetley | US$ 1,50/mil registros até US$ 20/mês |
| **Outreach com base embutida** | Instantly, Saleshandy, lemlist, Reply.io | US$ 25–47/mês (+ base como assinatura separada) |
| **"Monte a sua própria base"** | Clay, PhantomBuster, TexAu, n8n + workflow pronto | Grátis a US$ 185/mês |

### 2.2 Concorrentes indiretos (resolvem "conseguir cliente", não "conseguir lista")

- **Marketplaces de lead pago:** Bark (UK/US/AU), Thumbtack (US), Angi/HomeAdvisor (US), Hipages (AU), Checkatrade (UK), Airtasker (AU), Houzz Pro.
- **Mídia paga por intenção:** Google Local Services Ads, Google Ads, Meta Ads.
- **Dado de intenção de compra:** Bombora, 6sense, Demandbase, G2 Buyer Intent.
- **Serviço feito-por-você:** UpLead Done-For-You, Sopro (UK), Illicium (AU), agências de *outbound*.

### 2.3 Substitutos gratuitos — **o concorrente real de quem tem zero assinante**

Este bloco merece atenção desproporcional. Um prestador solo que nunca pagou por dado de prospecção não está escolhendo entre ProspectX e Apollo; está escolhendo entre ProspectX e **não gastar nada**.

| Substituto | Cobertura | Custo | Por que ele segura o cliente |
|---|---|---|---|
| **Busca manual no Google Maps** | US/UK/AU/BR, universal | R$ 0 | Devolve exatamente o que o OSM devolve, com dado melhor e sem cadastro |
| **Companies House (UK)** | Reino Unido, censitário | R$ 0, download em massa liberado, uso comercial permitido | Registro legal de **toda** empresa do país, com SIC code e endereço. Arquivo mensal `BasicCompanyDataAsOneFile` |
| **ABN Lookup / ABR (Austrália)** | Austrália, censitário | R$ 0, extrato semanal em XML; até 500 mil registros por consulta | Identificador ABN é a chave canônica do dado B2B australiano |
| **SAM.gov (EUA)** | Federal, licitações + fornecedores | R$ 0, sem cadastro para consultar | 24 mil avisos novos/mês; alerta por código NAICS |
| **Find a Tender / Contracts Finder (UK)** | Setor público UK | R$ 0 | Base central obrigatória de contratos públicos |
| **AusTender (AU)** | Federal AU, contratos ≥ A$ 10 mil | R$ 0, alerta por perfil | Publicação obrigatória; ~1/3 dos contratos vai para PME |
| **LinkedIn manual + Sales Navigator** | Global | R$ 0 a ~US$ 99/mês | Dado de pessoa, atualizado pelo próprio titular |
| **Listas de associação setorial** | Por país/setor | R$ 0 a taxa de associado | Já vem pré-qualificado por segmento — é o "quem contrata quem" feito à mão |
| **Planilha do próprio prestador** | — | R$ 0 | Custo de troca psicológico altíssimo: já funciona |

> **Achado estrutural:** no Reino Unido e na Austrália — dois dos três mercados-alvo — **o Estado publica de graça, em massa e com licença comercial, um cadastro censitário de empresas com classificação setorial**. Isso é dado melhor que o OpenStreetMap, sem custo e sem risco de termo de uso. Qualquer proposta de valor da ProspectX nesses dois países precisa explicar por que o cliente pagaria por algo que o governo entrega melhor.

---

## 3. Ficha de cada concorrente

### 3.1 Apollo.io — o padrão de referência do mercado

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "A plataforma completa para crescer seu negócio — Construa o pipeline de forma mais inteligente, feche negócios mais rápido e unifique sua ferramenta de tecnologia com uma plataforma impulsionada por IA." |
| **Cliente-alvo** | Equipe de vendas B2B com SDR. **Ignora conscientemente** o prestador de serviço local |
| **Fonte de dados** | Base própria + rede contributiva via extensão Chrome (usuários alimentam a base ao navegar). Escala em dado de **pessoa em empresa com presença digital**, não de estabelecimento físico |
| **Modelo de preço** | Por assento + crédito. E-mail = 1 crédito; telefone = **8 créditos**; pesquisa de IA = 1 crédito/execução; discador EUA = 2 créditos/min |
| **Preço real (15/08/2026)** | Grátis: US$ 0, 900 créditos/assento/ano. Básico: **US$ 49**/assento/mês anual, 30.000 créditos/ano. Profissional: **US$ 79**, 48.000 créditos/ano. Organização: **US$ 119**, mín. 3 assentos, 72.000 créditos/ano. Add-ons Inbound e Advanced Dialer: US$ 119/equipe/mês cada |
| **Plano gratuito** | Sim, permanente. Limita por **funcionalidade** (5 chats de IA, 2 sequências, filtros básicos), não por tempo |
| **Onboarding** | Busca disponível logo após cadastro gratuito; teste de 14 dias com 50 créditos |
| **Reclamações recorrentes** | Precisão real relatada na faixa de 65–80% `[FONTE SECUNDÁRIA]`; créditos que não acumulam de um mês para o outro; custo efetivo bem acima do preço de tabela por consumo de crédito |
| **Fraqueza estrutural** | A base vive de **pessoas com cargo em empresa com pegada digital**. Uma serralheria com 4 funcionários e um perfil no Google não tem "VP of Operations" no LinkedIn. Apollo não pode consertar isso sem trocar a lógica de sourcing inteira |

**Cálculo relevante:** Básico = 30.000 créditos/ano ÷ 12 = 2.500/mês por US$ 49 → **US$ 0,0196 por crédito de e-mail.**

---

### 3.2 LeadSwift — **o concorrente direto mais perigoso**

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "#1 Local B2B Lead Generation & Outreach Software" |
| **Cliente-alvo** | Agência de marketing local e freelancer que vende serviço **para** pequeno negócio. É o vizinho de porta do cliente da ProspectX |
| **Fonte de dados** | Raspagem em tempo real de **Google Maps, Yelp, Facebook, LinkedIn, YellowPages e Bing** `[FONTE SECUNDÁRIA]`. Mesma camada da ProspectX, com seis fontes em vez de uma |
| **Modelo de preço** | **Por busca/dia**, com resultado ilimitado. Não cobra por registro |
| **Preço real (15/08/2026, página própria)** | Starter: **US$ 19,99**/mês anual (US$ 49,99 mensal), 1 busca/dia. Professional: **US$ 39,99**/mês anual (US$ 99,99 mensal), 5 buscas/dia. Agency: **US$ 79,99**/mês anual (US$ 199,99 mensal), 20 buscas/dia. Todos com "unlimited: leads, contacts, exports, data points, list uploads" |
| **Plano gratuito** | Teste de 7 dias, **sem cartão de crédito** |
| **Onboarding** | Busca imediata, sem cartão |
| **Reclamações recorrentes** | E-mails genéricos (`info@`, `contact@`) em vez de contato direto verificado; ausência de sinal de compra; ausência de enriquecimento de CRM `[FONTE SECUNDÁRIA]` |
| **Fraqueza estrutural** | Entrega o *estabelecimento*, não a *pessoa que decide*. E não diz **para quem** vender — devolve o que você pediu, não o que você deveria pedir |

**Por que isso importa mais que tudo:** LeadSwift é a prova de que existe demanda paga na faixa "prestador pequeno + dado local". Também é a prova do teto de preço dessa faixa: **US$ 19,99/mês**. A ProspectX pede 4,8x isso no plano mensal padrão (R$ 497 ≈ US$ 95,8) e 1,9x no plano fundador (R$ 197 ≈ US$ 38).

O mecanismo interessante aqui é a **cobrança por busca, não por registro**: ela remove a ansiedade de consumo. O usuário sabe que uma busca é uma busca, e nunca fica com medo de "gastar crédito à toa" numa consulta exploratória. Isso é decisivo num produto de descoberta, onde o usuário *precisa* errar algumas vezes antes de achar o filtro certo. Cobrar por crédito num produto de descoberta pune exatamente o comportamento que gera o "aha".

---

### 3.3 RocketReach — o espelho exato da estrutura de crédito da ProspectX

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Planos flexíveis para cada equipe" / "Pesquise entre 700 milhões de profissionais e 35 milhões de empresas" |
| **Cliente-alvo** | Indivíduo e equipe pequena. Recrutador, vendedor solo, fundador |
| **Fonte de dados** | Agregação e verificação de dado profissional público, com verificação "sob demanda e em tempo real" |
| **Modelo de preço** | Por assento + **consultas mensais** (mesma mecânica de crédito da ProspectX) |
| **Preço real (15/08/2026, página própria)** | Essentials: **US$ 27/mês** (US$ 329/ano), **100 consultas/mês**, só e-mail. Pro: **US$ 69/mês** (US$ 829/ano), 250 consultas, e-mail + telefone. Ultimate: **US$ 142/mês** (US$ 1.699/ano), 1.000 consultas. Planos de organização "a partir de US$ 6 mil anuais" |
| **Plano gratuito** | Conta gratuita com consultas gratuitas, sem cartão |
| **Onboarding** | Cadastro gratuito → consulta imediata |
| **Reclamações recorrentes** | `[NÃO VERIFICADO]` — não auditei as avaliações públicas |
| **Fraqueza estrutural** | Dado de profissional, não de estabelecimento. Fraco em micro-empresa de serviço |

**Este é o comparativo mais desconfortável do relatório.** RocketReach Essentials e ProspectX mensal têm **exatamente o mesmo número de créditos: 100/mês**. RocketReach cobra US$ 27. ProspectX cobra R$ 497 (≈ US$ 95,8). **3,5x mais caro pela mesma unidade de consumo, com base de dados incomparavelmente pior.** Nenhuma quantidade de copy resolve isso.

---

### 3.4 Lead411 — o degrau de entrada mais agressivo em volume

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Affordable Pricing with no hidden fees" / "Quality Lead Data With Growth Intent" |
| **Cliente-alvo** | Equipe pequena e média que quer volume sem contrato enterprise |
| **Fonte de dados** | Base própria com verificação tripla (SMTP + humana + validação por abertura), re-verificação a cada 3–6 meses |
| **Modelo de preço** | **Por exportação**, com **rollover** de saldo não usado |
| **Preço real (15/08/2026, página própria)** | Pilot Light: US$ 0 / 7 dias, 50 exportações. Spark: **US$ 49/mês, 1.000 exportações/mês**. Ignite: a partir de **US$ 150/mês**, 1.000+ exportações |
| **Plano gratuito** | Teste de 7 dias com 50 exportações |
| **Onboarding** | Teste imediato |
| **Funcionalidade digna de nota** | Filtro **"Currently Hiring"** — encontra empresas que estão contratando para cargos específicos. É sinal de compra derivado de dado público de vaga |
| **Fraqueza estrutural** | Foco em dado corporativo americano; cobertura fraca em micro-empresa local `[NÃO VERIFICADO]` |

**Custo por registro: US$ 0,049.** A ProspectX é **20x mais cara por registro** que o Lead411 — e o Lead411 ainda deixa o crédito acumular.

O mecanismo do **rollover** merece atenção: ele converte "crédito" de uma ameaça de perda em um saldo acumulável. Isso muda o comportamento do usuário — ele para de racionar e passa a usar. Em produto novo sem base instalada, uso é a única coisa que gera evidência de valor.

---

### 3.5 Hunter — o modelo sem imposto de assento

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Find the right plan for your business. Unlimited users, auto-verified Hunter lead data on all plans, and subscriptions that scale as you grow." |
| **Cliente-alvo** | Equipe de qualquer tamanho fazendo *cold email*. Explicitamente amigável a time pequeno |
| **Fonte de dados** | Rastreamento de e-mail em domínio público + verificação automática |
| **Modelo de preço** | Por crédito, **com usuários ilimitados em todos os planos** |
| **Preço real (15/08/2026, página própria)** | Free: US$ 0, 50 créditos/mês. Starter: **US$ 34/mês** anual (US$ 408/ano), 24.000 créditos/ano (2.000/mês), 3 contas de e-mail. Growth: **US$ 104/mês** anual, 120.000 créditos/ano. Scale: **US$ 209/mês** anual, 300.000 créditos/ano |
| **Plano gratuito** | Permanente, 50 créditos/mês, 1 conta de e-mail, 500 destinatários por sequência |
| **Onboarding** | Imediato, gratuito |
| **Fraqueza estrutural** | Parte do **domínio** para achar o e-mail. Prestador que só tem Instagram e telefone fica invisível |

**"Unlimited users" em todos os planos é uma decisão estratégica, não uma generosidade.** O mecanismo: quando o preço não escala por assento, o produto entra na empresa sem negociação interna e sem gestor de licença. Remove atrito de adoção em troca de teto de receita por conta. Para quem ataca o mercado de baixo, é a escolha certa — e é a escolha oposta à do Apollo.

---

### 3.6 UpLead — o benchmark de preço por crédito no mid-market

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "UpLead Plans & Pricing — Find the plan that's right for you." |
| **Cliente-alvo** | Segmentado na própria página: "The Basics" (Essentials), "For Individuals" (Plus), "For Organizations" (Professional) |
| **Fonte de dados** | Base própria com verificação em tempo real no momento da revelação |
| **Modelo de preço** | Por crédito, 1 assento nos planos publicados. **Crédito avulso a US$ 0,60** |
| **Preço real (15/08/2026, página própria)** | Free Trial: US$ 0 / 7 dias, **5 créditos**. Essentials: **US$ 99/mês**, 170 créditos, 1 assento. Plus: **US$ 199/mês**, 400 créditos. Professional: só anual, "Let's talk" |
| **Plano gratuito** | Não — apenas teste de 7 dias com 5 créditos |
| **Fraqueza estrutural** | Preço por crédito alto (US$ 0,58–0,60) só se sustenta pela precisão declarada. Se a precisão cai, o modelo inteiro cai |

**US$ 0,60 por crédito avulso é o teto de mercado observado para revelação de contato B2B verificado.** A ProspectX cobra US$ 0,96 por crédito no plano mensal — **60% acima do teto do mercado**, com dado de OpenStreetMap.

---

### 3.7 Cognism — o líder em Reino Unido, e o que ele revela sobre o degrau abandonado

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Clear pricing, built around how your team uses data." (a ironia é do próprio site: não há preço na página) |
| **Cliente-alvo** | Equipe de receita com 5+ pessoas. **Declara na própria página: "5 seats included"** |
| **Fonte de dados** | Base própria com foco em conformidade (GDPR), verificação telefônica de celular ("Diamond Data"), sinais contextuais e intenção via Bombora |
| **Modelo de preço** | Por assento (mín. 5) + crédito. "1 credit = 1 revealed contact". Sem cobrança para reexibir contato já revelado |
| **Preço real** | **Não publicado.** Apenas "Talk to sales" / "Get a personalised quote" (verificado na página em 15/08/2026). Fontes secundárias citam faixa de US$ 1.500 a US$ 25 mil/ano `[FONTE SECUNDÁRIA — não usar como base de decisão]` |
| **Plano gratuito** | Não |
| **Cobertura** | Reconhecidamente a melhor cobertura B2B europeia, especialmente **Reino Unido**, DACH e Nórdicos `[FONTE SECUNDÁRIA]` |
| **Fraqueza estrutural** | O mínimo de 5 assentos **é** a fraqueza. Eles não podem vender para 1 pessoa sem destruir o preço médio por conta e a economia do time comercial que fecha essas vendas |

**Leitura estratégica:** o líder do mercado que a ProspectX quer atacar (UK) publicou, na própria página de preços, que não atende quem tem menos de 5 assentos. Isso é uma fronteira declarada. Abaixo dela existe mercado — mas note que **ninguém com dado bom desceu até lá**, e a razão não é falta de vontade: é que o custo de manter dado verificado não cai proporcionalmente ao tamanho do cliente.

---

### 3.8 Clay — o "monte você mesmo" que come o mercado por cima

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Compare plans, features & costs" / posicionamento de plataforma de GTM com 150+ parceiros de dados |
| **Cliente-alvo** | Operações de GTM, growth engineer. **Não** é o prestador solo |
| **Fonte de dados** | Não tem base própria — é **agregador em cascata** ("waterfall") sobre 150+ fornecedores, com desconto de volume negociado e repassado |
| **Modelo de preço** | Data Credits (compra de dado) + Actions (execução), **assentos ilimitados** |
| **Preço real (15/08/2026, página própria)** | Free: 100 Data Credits + 500 Actions/mês, 200 linhas/tabela, assentos ilimitados. Launch: **a partir de US$ 185/mês**, 2.500 Data Credits + 15.000 Actions. Growth: **a partir de US$ 495/mês**, 6.000 Data Credits + 40.000 Actions. Enterprise: sob consulta |
| **Plano gratuito** | Sim, permanente |
| **Fraqueza estrutural** | Exige que o usuário **saiba o que quer**. É uma ferramenta de montagem para quem já tem a hipótese. Zero valor para quem não sabe a quem vender |

**O mecanismo do "waterfall" é o mais importante deste relatório para a ProspectX.** Clay não tenta ter o melhor dado; tenta ter *um* dado, consultando fornecedores em cascata até algum responder, e cobrando só pelo acerto. Isso transforma cobertura de um problema de aquisição de base em um problema de roteamento. **É exatamente a arquitetura que resolveria o problema de dado da ProspectX sem construir base própria** — e é a razão de a Clay não ter base própria e mesmo assim cobrar US$ 495/mês.

---

### 3.9 Kaspr — cobertura por dependência de plataforma

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Kaspr Plans & Pricing — Unlimited B2B Emails on Free Plan" |
| **Cliente-alvo** | SDR individual e time pequeno que vive dentro do LinkedIn |
| **Fonte de dados** | Extensão sobre LinkedIn / Sales Navigator / Recruiter Lite |
| **Modelo de preço** | Por assento + créditos separados por tipo (e-mail B2B, telefone, e-mail direto), com rollover |
| **Preço real (15/08/2026, página própria)** | Free: €0, 15 créditos de e-mail B2B/mês, 5 de telefone, 5 de e-mail direto, exportação limitada a 100. Starter: **€45/usuário/mês**, e-mail B2B ilimitado, 1.200 créditos de telefone/ano, 12.000 exportações/ano. Business: **€79/usuário/mês**, 30.000 exportações/ano |
| **Fraqueza estrutural** | Existe por concessão de uma plataforma que não controla. Se o LinkedIn fechar, o produto acaba. E o dono de padaria não está no LinkedIn |

---

### 3.10 Saleshandy e Instantly — outreach barato com base acoplada

| Eixo | Saleshandy | Instantly |
|---|---|---|
| **Proposta (literal, 15/08/2026)** | "Outreach that pays for itself — One booked meeting covers your entire month." | "Simple Pricing For Everyone — Pricing built for businesses of all sizes. Always know what you'll pay." |
| **Preço de envio (15/08/2026, página própria)** | Starter: **US$ 25/mês** anual (US$ 36 mensal), 2.000 prospects ativos, 6.000 e-mails/mês, contas de e-mail ilimitadas. Pro: US$ 69/mês anual. Scale: US$ 139/mês anual | Growth: **US$ 47/mês**, 1.000 contatos, 5.000 e-mails/mês, contas ilimitadas. Hypergrowth: US$ 97/mês, 25.000 contatos. Light Speed: US$ 358/mês |
| **Base de dados** | "Lead Finder": 852M contatos / 42M empresas declarados. **Assinatura separada.** 50 créditos grátis no cadastro | "Lead Finder" em assinatura de créditos separada. Faixas citadas: US$ 47/1.500 créditos, US$ 97/5.000, US$ 197/10.000 `[FONTE SECUNDÁRIA — não confirmado na página de preços]` |
| **Plano gratuito** | Teste de 7 dias | `[NÃO VERIFICADO]` |
| **Nota relevante** | Preço exibido em **USD, EUR, GBP, AUD, CAD, INR e BRL** na própria página | Créditos **não acumulam** entre meses `[FONTE SECUNDÁRIA]` |
| **Fraqueza estrutural** | Ambos cobram duas vezes: uma pelo envio, outra pela base. O usuário solo só percebe isso depois de assinar |

**A separação entre "envio" e "base" é o padrão do mercado — e é uma fraqueza explorável.** O prestador solo não quer duas assinaturas, não entende por que precisa de duas, e reclama disso. Um produto que entrega busca + disparo num preço só tem uma vantagem narrativa concreta. A ProspectX já tem essa arquitetura (busca + funil + disparo em lote). **Isso é ativo real e está sendo desperdiçado numa mensagem que fala de mapa de segmentos.**

---

### 3.11 Camada de commodity: Apify, Outscraper e a API do Google

| Fornecedor | Preço (15/08/2026) | Fonte |
|---|---|---|
| **Apify — Google Maps Scraper (Compass)** | "from **US$ 1,50 / 1.000 scraped places**", modelo pay-per-event. Extrai e-mail, telefone, site, redes sociais. Sem camada gratuita | Página do ator no Apify |
| **Outscraper** | ~US$ 3,00 / 1.000 registros após faixa gratuita de 500 resultados | `[FONTE SECUNDÁRIA]` — página bloqueada por verificação de bot, não acessada |
| **Google Places API (New) — Text Search Pro** | **US$ 32,00 / 1.000 chamadas** após franquia gratuita de 5.000 chamadas/mês. Campos de review/atmosfera sobem para US$ 40,00/1.000 | `[FONTE SECUNDÁRIA]` |
| **Workflow n8n pronto (Gumroad)** | **US$ 19**, pagamento único, extrai nome, endereço, telefone e site | `[FONTE SECUNDÁRIA]` |
| **OpenStreetMap / Overpass API** | R$ 0 | Fonte atual da ProspectX |

**Este quadro é a sentença econômica do produto atual.** Uma chamada de Text Search do Google devolve até 20 estabelecimentos, o que coloca o custo efetivo de dado local em torno de **US$ 1,60 por mil registros** — praticamente idêntico ao Apify. A ProspectX cobra **US$ 960 por mil registros** (US$ 0,96 × 1.000) por dado da mesma natureza e qualidade inferior. Não existe posicionamento, marca ou copy que sustente um múltiplo de 600x sobre a commodity subjacente. **O valor tem que estar em outro lugar, e o preço tem que refletir onde ele está.**

---

### 3.12 Targetley — o único precedente direto de "quem precisa do meu serviço"

| Eixo | Resposta |
|---|---|
| **Proposta (literal, 15/08/2026)** | "Targetley — Find Businesses Without Websites \| Web Design & Agency Client Finder" |
| **Cliente-alvo** | Web designer e agência digital |
| **Mecanismo** | Em vez de mapear "quem contrata web design" de forma abstrata, detecta o **sintoma observável** da necessidade: a empresa não tem site |
| **Preço** | `[NÃO VERIFICADO]` — não exposto no conteúdo acessível da página |
| **Fonte de dados** | `[NÃO VERIFICADO]` |

**Este é o achado conceitual mais valioso do relatório.** Targetley resolve "quem precisa do meu serviço" para **um** serviço, e resolve com um **critério verificável no dado**, não com uma tabela de correspondência. Não diz "agências de marketing contratam web design"; diz "esta empresa aqui, agora, não tem site". O prospect é qualificado por evidência, não por categoria.

A ProspectX escolheu o caminho oposto: 1.187 pares abstratos, generalizados para 531 segmentos e três idiomas. **Amplitude sem evidência.** O par "manutenção industrial → construtora" é verdadeiro e inútil, porque não distingue a construtora que precisa da que não precisa. O Targetley entrega 1 par com evidência e cobra por isso; a ProspectX entrega 1.187 pares sem evidência.

---

### 3.13 Marketplaces de lead — onde o dinheiro do prestador solo realmente vai hoje

| Plataforma | Custo por lead (2026) | Modelo | Reclamação dominante |
|---|---|---|---|
| **Bark** (UK/US/AU) | Crédito a £1,80 + IVA (UK) / ~US$ 2,20–2,35 (US/AU); lead custa 6–12 créditos → **US$ 15–30/lead** | Crédito pré-pago | Créditos comprados a partir de 01/11/2025 **expiram em 3 meses** (antes eram 12), sem reembolso; maioria dos contatos pagos nunca responde |
| **Thumbtack** (US) | **US$ 20–60/lead** típico (faixa US$ 5–150+) | Pay-per-lead, mesmo lead vendido a 4–5 profissionais | Lead compartilhado; taxa de fantasma alta |
| **Angi/HomeAdvisor** (US) | **US$ 15–85/lead**, US$ 100+ em nichos de alto ticket, + ~US$ 300/ano de anuidade | Assinatura + pay-per-lead | ~1,96/5 no BBB com 3.000+ avaliações; leads falsos e cobranças inesperadas |
| **Hipages** (AU) | `[NÃO VERIFICADO]` | Assinatura + créditos | `[NÃO VERIFICADO]` |

*Todos os números desta tabela: `[FONTE SECUNDÁRIA]` — compilados de publicações de mercado, não das páginas oficiais de preço, que exigem cadastro de profissional.*

**Custo por trabalho fechado citado:** ~US$ 250 no Thumbtack, ~US$ 542 na Angi, ~US$ 168 no Google Local Services Ads `[FONTE SECUNDÁRIA]`.

**Este é o verdadeiro ponto de comparação econômico do cliente-alvo.** O prestador solo não compara ProspectX com Apollo. Ele compara com "quanto me custa conseguir um cliente hoje". Se ele paga US$ 25 por um lead no Bark que 75% das vezes não responde, então **R$ 497/mês (≈ US$ 96) por 100 contatos** não é caro em termos absolutos — é caro *por crédito*, mas potencialmente barato *por cliente conquistado*.

**Isso muda a régua da conversa comercial inteira.** A ProspectX está se comparando com ferramentas de dados (onde perde feio em preço por registro) quando deveria se comparar com marketplaces de lead (onde a matemática é favorável). Mas essa comparação **só funciona se o dado entregue realmente gerar conversa** — o que hoje, com OpenStreetMap, não acontece. A comparação favorável está bloqueada pelo problema de dados, não pelo posicionamento.

---

### 3.14 Ocean.io — a alternativa mecânica ao mapa estático

| Eixo | Resposta |
|---|---|
| **Cliente-alvo** | Time de vendas pequeno, sobretudo europeu, com ICP já definido |
| **Mecanismo** | *Lookalike* por IA: você entrega a URL de um cliente bom, ele devolve empresas ranqueadas por semelhança. 1 resultado = 1 crédito |
| **Preço** | Assinatura a partir de US$ 0,071/crédito (mín. 750); pay-as-you-go US$ 0,081/crédito (mín. 1.000); planos a partir de ~US$ 32/mês anual por 9.000 créditos; **usuários ilimitados**; créditos com validade de 6 meses `[FONTE SECUNDÁRIA]` |
| **Fraqueza estrutural** | Exige que o cliente **já tenha clientes bons** para servir de semente. Inútil para quem está começando |

**O contraste com a ProspectX é instrutivo.** Ambos respondem "a quem devo vender?". Ocean.io responde a partir da **evidência do próprio cliente** (quem já comprou); a ProspectX responde a partir de uma **tabela pré-escrita**. A resposta do Ocean.io melhora com o uso; a da ProspectX é a mesma no dia 1 e no dia 500.

**Mas a fraqueza do Ocean.io é o *cold start* — e o cold start é exatamente onde o prestador solo vive.** Um eletricista que quer entrar em manutenção predial não tem carteira nesse segmento para servir de semente. **Esse é o único vão defensável que encontrei para o mapa de 1.187 pares: ele é um substituto de partida a frio para o lookalike.** Não é o produto; é o *onboarding* do produto.

---

## 4. Matriz de funcionalidades

Legenda: ✅ tem · ⚠️ tem com limitação séria · ❌ não tem · 🚫 **não vamos ter de propósito**

| Funcionalidade | ProspectX (hoje) | Apollo | LeadSwift | Lead411 | RocketReach | Hunter | Clay | Bark/Thumbtack |
|---|---|---|---|---|---|---|---|---|
| Busca de empresa por segmento + cidade | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Sugestão de "a quem vender"** | ✅ (tabela estática) | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ (o usuário programa) | ❌ |
| Dado de estabelecimento local | ⚠️ (OSM, ruim) | ⚠️ | ✅ | ⚠️ | ❌ | ❌ | ✅ (via parceiros) | — |
| Dado de decisor com nome e cargo | ❌ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | — |
| E-mail verificado | ❌ | ✅ | ⚠️ (genérico) | ✅ | ✅ | ✅ | ✅ | — |
| Telefone direto / celular | ❌ | ✅ (8 créditos) | ⚠️ | ✅ | ✅ | ❌ | ✅ | — |
| **Sinal de compra** (contratando, obra, licitação, sem site) | ❌ | ✅ (intent) | ❌ | ✅ (hiring) | ⚠️ | ❌ | ✅ | — |
| Funil / CRM leve | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Disparo de e-mail em lote **incluído no mesmo preço** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ❌ |
| Assistente de IA para primeira abordagem | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Multi-idioma (PT/EN/ES) | ✅ | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| Plano gratuito permanente | ❌ | ✅ | ❌ (7 dias) | ❌ (7 dias) | ✅ | ✅ | ✅ | ❌ |
| Busca visível **antes** do cadastro | `[NÃO VERIFICADO]` | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ✅ |
| Rollover de crédito | `[NÃO VERIFICADO]` | ❌ | — | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| Assentos ilimitados | `[NÃO VERIFICADO]` | ❌ | — | ❌ | ❌ | ✅ | ✅ | — |
| Enriquecimento de CRM / API | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Discador | 🚫 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Dado de intenção comprado (Bombora) | 🚫 | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Integração Salesforce/HubSpot bidirecional | 🚫 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Extensão Chrome sobre LinkedIn | 🚫 | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cobrança por assento | 🚫 | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | — |

### O que **não** vamos ter de propósito, e por quê

| Não construir | Razão |
|---|---|
| **Discador / telefonia** | Consome 8 créditos por número no Apollo justamente porque o custo de verificação de celular é alto. Entrar aí é importar a estrutura de custo do concorrente sem a escala dele |
| **Dado de intenção comprado (Bombora e afins)** | Precificado para enterprise (US$ 75–400 por tópico adicional `[FONTE SECUNDÁRIA]`). O prestador solo não tem volume que justifique. Sinal de compra tem que vir de **fonte pública gratuita** (licitação, alvará, vaga, ausência de site) |
| **Integração bidirecional com Salesforce/HubSpot** | O cliente-alvo não tem CRM. Construir isso é atender o cliente do Apollo, não o nosso |
| **Extensão Chrome sobre LinkedIn** | Dependência de plataforma que não controlamos (ver Kaspr), e o dono de serralheria não está no LinkedIn |
| **Cobrança por assento** | Pune o cliente-alvo, que é uma pessoa só. Hunter, Clay e Ocean.io já provaram que assento ilimitado é arma de ataque por baixo |

---

## 5. Mapa de posicionamento

### Eixo escolhido: **onde vem a hipótese de "a quem vender"** × **quanto do trabalho o produto faz**

Esses são os dois eixos que importam porque o cliente-alvo (prestador solo) tem duas carências simultâneas e independentes: **ele não sabe a quem vender** e **ele não tem tempo de operar ferramenta**. Preço e volume de base são consequências, não causas.

```
                    O PRODUTO ENTREGA O CLIENTE PRONTO
                                  ▲
                                  │
        Bark ●                    │                    ● Angi
     Thumbtack ●                  │                ● Hipages
                                  │
      (caro por lead,             │          UpLead Done-For-You ●
       lead compartilhado,        │              Sopro (UK) ●
       75% fantasma)              │
                                  │
──────────────────────────────────┼──────────────────────────────────▶
  HIPÓTESE VEM                    │                    HIPÓTESE VEM
  DO PRODUTO                      │                    DO USUÁRIO
                                  │
         ◆ PROSPECTX              │        ● Apollo    ● Lead411
        (declara aqui,            │        ● Hunter    ● RocketReach
         entrega dado ruim)       │        ● LeadSwift ● UpLead
                                  │        ● Kaspr     ● Cognism
    ● Ocean.io                    │
   (lookalike — precisa           │              ● Clay
    de semente)                   │        (usuário programa tudo)
                                  │
    ● Targetley                   │        ● Apify / Outscraper
   (1 serviço, evidência real)    │        (dado cru, você resolve)
                                  │
                                  ▼
                    O USUÁRIO FAZ TODO O TRABALHO
```

### Leitura do mapa

1. **O quadrante inferior-esquerdo — "o produto tem a hipótese, o usuário faz o trabalho" — está praticamente vazio, e a ProspectX declara estar nele.** Só há dois vizinhos: Ocean.io (que precisa de semente) e Targetley (que serve a um único ofício). **Vazio não é oportunidade automática.** A leitura mais provável é que quem tenta esse quadrante descobre que sugerir o segmento é a parte fácil e barata; a parte cara é ter o dado daquele segmento com contato utilizável. A ProspectX está vivendo essa descoberta agora.

2. **O eixo vertical é onde o dinheiro do cliente-alvo já está.** Bark, Thumbtack, Angi e Hipages ocupam o topo e cobram US$ 15–85 por lead. Eles vendem *resultado*, não *dado*. E são detestados: 1,96/5 no BBB para a Angi, créditos com validade cortada de 12 para 3 meses no Bark.

3. **O corredor entre os dois — "hipótese do produto + entrega quase pronta" — é o único território não ocupado com evidência de demanda dos dois lados.** Acima dele há gente pagando caro e reclamando; abaixo há gente pagando pouco e trabalhando muito.

---

## 6. Espaços não atendidos

### 6.1 Nenhum fornecedor de dado bom desceu abaixo de US$ 25/mês para uma pessoa só

**Evidência:** Cognism declara "5 seats included" e não publica preço (página, 15/08/2026). Apollo Organização exige mínimo de 3 assentos (página, 15/08/2026). RocketReach Essentials a US$ 27/mês é o piso publicado por um fornecedor de dado sério. Lead411 Spark a US$ 49. UpLead Essentials a US$ 99.

**Tamanho do vão:** entre US$ 0 (substituto gratuito) e US$ 25/mês. Nesse vão só existe LeadSwift (US$ 19,99 anual) e *scraper* cru.

**Por que ele existe:** o custo marginal de manter dado verificado não cai com o tamanho do cliente, e o custo de aquisição de um cliente de US$ 20/mês só fecha com aquisição orgânica ou viral. **É um vão que só se ataca com produto que se vende sozinho — nunca com time comercial.** Isso valida a decisão do dono de gerar demanda por Instagram antes de vender.

---

### 6.2 O sinal de compra público está livre e ninguém o empacotou para o prestador pequeno

**Evidência:** Lead411 tem filtro "Currently Hiring" (página, 15/08/2026). Cognism tem sinais de "Hiring, Funding and M&A" (página, 15/08/2026). Ambos derivam sinal de fonte pública — mas ambos vendem para equipe de vendas B2B corporativa, a partir de US$ 49 e sem preço publicado, respectivamente.

Ao mesmo tempo, em **cada um dos três mercados-alvo**, o Estado publica sinal de compra de graça:

- **EUA:** SAM.gov, 24 mil avisos novos/mês, alerta gratuito por código NAICS, sem cadastro para consultar
- **UK:** Find a Tender + Contracts Finder, base central obrigatória, gratuita
- **AU:** AusTender, publicação obrigatória de tudo acima de A$ 10 mil, alerta gratuito por perfil; cerca de 1/3 dos contratos vai para PME

**Nenhum produto na faixa de preço do prestador solo transformou isso em "esta empresa aqui vai precisar do seu serviço nas próximas semanas".** Bark e Thumbtack vendem intenção de *consumidor*; ninguém vende intenção de *empresa* barato.

**Por que ninguém fez:** provavelmente porque exige trabalho de normalização por país e porque o mercado de licitação já tem seus especialistas caros (BidPrime, Stotles, Tenders Direct) mirando quem vende para governo em tempo integral. **O uso que ninguém atendeu é o do prestador que não vende para governo, mas usa o edital como sinal de que a empresa vencedora vai precisar subcontratar.** Isso é hipótese, não fato verificado — precisa de validação com cliente real antes de virar roadmap.

---

### 6.3 A cobrança por crédito num produto de descoberta pune o comportamento que gera o "aha"

**Evidência:** LeadSwift cobra por **busca/dia** com resultado ilimitado e comunica isso como argumento principal ("All plans include unlimited: Leads, Contacts, Exports"). Lead411 dá **rollover** de exportações não usadas e destaca isso em "Included Features in All Subscriptions". Hunter dá **usuários ilimitados** em todos os planos. Ocean.io dá **usuários ilimitados** e créditos com 6 meses de validade `[FONTE SECUNDÁRIA]`.

Do outro lado: os créditos do Apollo **não acumulam** e essa é uma reclamação recorrente `[FONTE SECUNDÁRIA]`; o Bark cortou a validade do crédito de 12 para 3 meses e virou caso de reputação `[FONTE SECUNDÁRIA]`.

**O padrão é claro:** quem ataca por baixo remove a ansiedade de consumo; quem já tem base instalada a mantém para forçar upgrade. A ProspectX, com zero assinantes, adotou o modelo de quem tem base instalada.

---

### 6.4 A dupla assinatura (base + disparo) é atrito real e a ProspectX já resolveu isso sem saber

**Evidência:** Instantly cobra US$ 47/mês pelo envio e a base é assinatura separada (verificado na página: "Do you also provide leads I can send emails to? Yes we do! You can use Instantly Lead Finder"). Saleshandy cobra US$ 25/mês pelo envio e tem aba separada de "Lead Finder". Lead411 e UpLead não têm disparo. Clay tem sequenciador só no plano gratuito e integrações de campanha a partir de US$ 185/mês.

**A ProspectX entrega busca + funil + disparo em lote + assistente de IA numa assinatura só.** Isso é uma vantagem concreta, verificável e comunicável — e não é o que a página está comunicando.

---

### 6.5 Onde ProspectX é fraca e ninguém está fraco junto: qualidade em UK e AU

**Evidência:** Companies House (UK) e ABR/ABN Lookup (AU) publicam cadastro censitário, gratuito, com licença comercial, em download em massa, com classificação setorial. Cognism é reconhecidamente o mais forte em UK `[FONTE SECUNDÁRIA]`. Em AU, illion e D&B Australia têm cobertura profunda mas não são construídos para prospecção *outbound* `[FONTE SECUNDÁRIA]`; o ABN é o identificador canônico do dado B2B australiano `[FONTE SECUNDÁRIA]`.

**Este não é um espaço não atendido — é o oposto.** É um alerta: nos dois mercados onde o dono quer começar, o dado básico de empresa é gratuito e melhor que o do OpenStreetMap. **A ProspectX não pode vender "a lista" nesses países. Só pode vender o que se faz com a lista.**

---

## 7. Recomendação

Ordenadas por impacto sobre esforço. Cada uma explica o mecanismo, não a cópia.

---

### R1. Trocar a unidade de cobrança de "crédito" para "busca", e reprecificar para o degrau abandonado
**Impacto: máximo · Esforço: baixo (é decisão, não código)**

O preço atual (US$ 0,96/crédito) está 60% acima do teto de mercado para revelação de contato verificado (UpLead, US$ 0,60) e 20x acima do Lead411, com dado incomparavelmente pior. Não há narrativa que sustente isso.

**O mecanismo por trás da mudança:** num produto de *descoberta*, o usuário precisa errar. Ele vai buscar "manutenção industrial em Manchester", ver que veio ruim, tentar "facilities management", tentar de novo. Se cada tentativa custa crédito, ele para de tentar antes de encontrar o filtro que funciona — e cancela achando que o produto não serve. Cobrar por busca/dia (LeadSwift) ou dar rollover (Lead411) elimina esse mecanismo de auto-sabotagem. **Não é generosidade; é remoção de um obstáculo à ativação.** Com zero assinantes, ativação é a única métrica que existe.

**Não copiar o preço do LeadSwift.** O que importa é o princípio: a unidade cobrada tem que ser aquela que o usuário controla com confiança. Ele sabe o que é uma busca; ele não sabe quantos créditos vai gastar.

---

### R2. Substituir o mapa estático de 1.187 pares por sinal verificável, começando por um único sinal e um único país
**Impacto: máximo · Esforço: médio**

O mapa responde "qual categoria compra o meu serviço". O cliente já sabe isso. O que ele não sabe é **qual empresa específica está comprando agora**.

**O mecanismo, demonstrado pelo Targetley:** substituir a *categoria* pela *evidência observável no dado*. "Empresas que não têm site" é infinitamente mais vendável que "agências contratam web design", porque o primeiro é uma lista de nomes e o segundo é uma obviedade. Lead411 faz o mesmo com "Currently Hiring": não diz "empresas em crescimento compram RH", diz "estas 40 estão contratando".

**Sinais gratuitos e verificáveis, por ordem de facilidade:**

| Sinal | Fonte gratuita | Serve a quem |
|---|---|---|
| Empresa sem site / site quebrado | Google Places + verificação HTTP | Web design, marketing, TI |
| Empresa contratando cargo X | Portais públicos de vaga | Treinamento, RH, terceirização, EPI, uniforme |
| Empresa venceu licitação recente | SAM.gov / Contracts Finder / AusTender | Subcontratação, logística, manutenção, obra |
| Empresa recém-registrada | Companies House (UK) / ABR (AU) | Contabilidade, seguro, mobiliário, reforma, TI |
| Empresa mudou de endereço | Companies House / ABR | Mudança, reforma, instalação, limpeza |

**Escolher UM.** "Empresas registradas nos últimos 90 dias" no Reino Unido é o mais barato de construir (arquivo mensal gratuito do Companies House, licença comercial) e o mais fácil de demonstrar em vídeo de Instagram, que é o canal escolhido.

**O mapa de 1.187 pares não deve ser jogado fora — deve ser rebaixado a onboarding.** Ele é a semente para quem não tem carteira, resolvendo o *cold start* que derruba o Ocean.io. Vira a **primeira pergunta** ("qual é o seu ramo?") que preenche o filtro inicial, não a proposta de valor da página inicial.

---

### R3. Adotar a arquitetura de cascata (waterfall) em vez de tentar ter base própria
**Impacto: alto · Esforço: médio**

Este item é do escopo de dados, que está sendo tratado à parte, mas a decisão competitiva pertence a este relatório.

**O mecanismo da Clay:** não tentar ter o melhor dado. Consultar fornecedores em sequência até um responder e cobrar só pelo acerto. Isso transforma "cobertura" de um problema de aquisição de base (caro, lento, sem fim) em um problema de roteamento (barato, incremental, mensurável). A Clay não tem base própria e cobra US$ 495/mês por isso.

**Aplicado à ProspectX:** camada 1 = registro público gratuito do país (Companies House, ABR, SAM.gov) para *existir e classificar*; camada 2 = Places/Apify a ~US$ 1,50/mil para *endereço e telefone*; camada 3 = enriquecimento pago só no contato que o usuário efetivamente quer revelar. **O custo variável passa a acompanhar o uso real, e o OpenStreetMap deixa de ser um ponto único de falha.**

**A consequência competitiva é maior que a técnica:** enquanto a base for OSM, a proposta "encontramos as empresas" é falsa, e nenhuma decisão de preço, copy ou growth se sustenta sobre ela. Isso trava R1 e R2.

---

### R4. Reposicionar o comparativo econômico: contra marketplace de lead, não contra ferramenta de dado
**Impacto: alto · Esforço: baixo**

Contra Apollo e Lead411, a ProspectX perde em preço por registro por 20x a 50x. Contra Bark e Thumbtack, a matemática vira: **US$ 15–60 por um lead compartilhado com 4 outros profissionais e com 75% de taxa de fantasma reportada** `[FONTE SECUNDÁRIA]`, contra uma assinatura mensal que dá acesso a uma lista inteira que só é sua.

**O mecanismo:** o cliente-alvo não tem orçamento de "ferramenta de vendas"; ele tem orçamento de "conseguir cliente". Enquadrar o produto na categoria errada faz o preço parecer absurdo; enquadrar na categoria certa faz o mesmo preço parecer óbvio.

**Duas ressalvas obrigatórias.** Primeira: essa comparação só é honesta se a lista entregue realmente gerar conversa — hoje não gera, e usá-la antes de R3 seria promessa falsa. Segunda: os números de Bark, Thumbtack e Angi neste relatório são de fontes secundárias. **Antes de virar copy pública, precisam ser confirmados nas páginas oficiais de profissional, e a comparação precisa passar pelo `juridico-internacional`** — publicidade comparativa com nome de concorrente tem regra distinta em EUA, Reino Unido (CAP Code) e Austrália (ACL).

---

### R5. Abrir a busca antes do cadastro e criar plano gratuito permanente por funcionalidade
**Impacto: médio-alto · Esforço: baixo-médio**

Apollo, Hunter, Clay, Kaspr e RocketReach têm plano gratuito **permanente**. LeadSwift dá 7 dias sem cartão. UpLead dá 5 créditos em 7 dias — e é o menos generoso e o mais caro.

**O mecanismo, e é o princípio central deste ofício:** se o produto esconde a busca atrás do cadastro, ele está dizendo que não confia no próprio resultado. Hoje a ProspectX não pode mostrar a busca — porque o resultado é ruim. **Isso torna R5 um teste de verdade, não uma tática de conversão: o dia em que a busca puder ficar aberta é o dia em que o produto está pronto para ser vendido.**

E o limite do plano gratuito deve ser por **funcionalidade**, não por volume — Apollo limita chats de IA e sequências, não a busca. Limitar volume ensina o usuário a racionar antes de ele ter visto valor. Limitar funcionalidade deixa ele ver o valor e sentir falta do que não tem.

---

## 8. O que ficou não verificado

### Preços que NÃO foram lidos na página oficial do fornecedor
- **Instantly Lead Finder** (base de dados): faixas de US$ 47/1.500 créditos, US$ 97/5.000, US$ 197/10.000 vêm de publicações de terceiros. A página de preços da Instantly tem aba dedicada que não consegui abrir. **Não usar em decisão.**
- **Saleshandy Lead Finder:** confirmado que existe e que dá 50 créditos grátis no cadastro; **faixas de preço não capturadas.**
- **Outscraper:** US$ 3/1.000 registros é fonte secundária. A página oficial está protegida por verificação de bot e **não foi acessada — não contornei a proteção, por princípio.**
- **Ocean.io:** todos os valores (US$ 0,071/crédito, ~US$ 32/mês) são de fontes secundárias.
- **Bark, Thumbtack, Angi, Hipages:** todos os custos por lead são de publicações de mercado. As páginas oficiais exigem cadastro como profissional. **Hipages não tem nenhum dado de preço.**
- **Google Places API:** US$ 32/1.000 chamadas é fonte secundária; não foi lido na tabela de SKU do Google.
- **Cognism e ZoomInfo:** confirmado na página que **não publicam preço**. Qualquer faixa citada por terceiros (US$ 15 mil/ano etc.) é `[NÃO VERIFICADO]` e não deve entrar em material comercial.
- **Targetley:** preço e fonte de dados não obtidos.

### Sobre a própria ProspectX (não me foram informados)
- **Tabela de preços em USD, GBP e AUD.** Todo o comparativo internacional deste relatório converteu o preço em BRL a 5,19. **Se os preços em moeda estrangeira forem diferentes da conversão direta, as conclusões de preço precisam ser refeitas.** Este é o item mais urgente a esclarecer.
- Se há plano gratuito, se há rollover de crédito, se a busca aparece antes do cadastro, e se o preço é por assento.
- Custo unitário real de uma busca hoje (para saber qual margem existe).

### Não investigado por escopo
- Concorrentes brasileiros (Econodata, Speedio, Cortex, Neoway, Ramper) — o Brasil foi declarado mercado secundário. **Antes de qualquer lançamento no Brasil, esta análise precisa ser refeita**: o mercado brasileiro tem dado de Receita Federal e CNPJ público, que muda completamente a economia.
- Nichos verticais de dado de obra (Dodge/ConstructConnect nos EUA, Glenigan/Barbour ABI no UK, Cordell/BCI na AU). **São os concorrentes mais relevantes se a ProspectX seguir a rota do sinal de licitação/obra (R2)** e merecem um segundo teardown dedicado.
- Termos de uso do OpenStreetMap e da Overpass API para revenda comercial — **questão jurídica real e não analisada aqui.** ODbL tem cláusula de *share-alike*. Encaminhar ao `juridico-internacional` antes de qualquer venda.
- Análise de canal de aquisição e SEO dos concorrentes.

---

## 9. Handoffs

### → `analista-precificacao`

**Faixa de preço observada no mercado (todos verificados em página oficial, 15/08/2026):**

| Produto | Entrada | Unidade | Custo por registro |
|---|---|---|---|
| LeadSwift Starter | **US$ 19,99/mês** (anual) | 1 busca/dia, leads ilimitados | efetivamente zero |
| RocketReach Essentials | **US$ 27/mês** (anual) | 100 consultas/mês | US$ 0,27 |
| Hunter Starter | **US$ 34/mês** (anual) | 2.000 créditos/mês, usuários ilimitados | US$ 0,017 |
| Saleshandy Starter | **US$ 25/mês** (anual) | envio; base à parte | — |
| Apollo Básico | **US$ 49/assento/mês** (anual) | 2.500 créditos/mês | US$ 0,0196 |
| Lead411 Spark | **US$ 49/mês** | 1.000 exportações/mês, com rollover | US$ 0,049 |
| UpLead Essentials | **US$ 99/mês** | 170 créditos | US$ 0,58 (avulso US$ 0,60) |
| Clay Launch | **a partir de US$ 185/mês** | 2.500 data credits | — |
| Cognism / ZoomInfo | sem preço público, mín. 5 assentos | — | — |
| **ProspectX mensal** | **R$ 497 ≈ US$ 95,8** | **100 créditos** | **US$ 0,96** |
| **ProspectX fundador** | **R$ 197 ≈ US$ 38** | **100 créditos** | **US$ 0,38** |

**Três fatos para a sua modelagem:**

1. **US$ 0,60/crédito (UpLead avulso) é o teto de mercado observado** para revelação de contato B2B verificado. A ProspectX mensal está 60% acima dele, com dado de OpenStreetMap. Nem o plano fundador chega ao piso de um fornecedor sério (RocketReach, US$ 0,27 com 100 créditos — **exatamente a mesma unidade de consumo por 1/3,5 do preço**).

2. **O modelo de cobrança predominante é crédito por assento, mas quem ataca por baixo abandonou os dois.** Hunter, Clay e Ocean.io dão **assentos ilimitados**. LeadSwift cobra por **busca/dia** com resultado ilimitado. Lead411 dá **rollover**. Cobrar por crédito com 100 unidades e sem rollover é o modelo de quem já tem base instalada e quer forçar upgrade — a ProspectX não tem base instalada.

3. **O degrau de entrada abandonado é a faixa US$ 0 a US$ 25/mês para uma pessoa só com dado utilizável.** Cognism declara mínimo de 5 assentos na própria página; Apollo Organização exige 3. Abaixo de US$ 25/mês só existe LeadSwift e scraper cru a US$ 1,50/mil. **Mas atenção: esse vão existe porque a economia é difícil, não porque ninguém percebeu.** Só fecha com aquisição orgânica — CAC pago mata a conta nessa faixa. Modele com CAC próximo de zero ou não modele.

**Peça ao dono, antes de fechar qualquer preço:** a tabela em USD/GBP/AUD. Todo este comparativo assumiu conversão direta de BRL a 5,19; se os preços internacionais forem outros, refaça.

---

### → `copywriter-conversao`

**Frases saturadas — não usar, o mercado inteiro já disse:**

| Frase / ângulo | Quem já ocupa |
|---|---|
| "A plataforma completa / all-in-one para crescer seu negócio" | Apollo, literal |
| "Encontre seus clientes ideais" / "ideal buyers" | Saleshandy ("your ideal buyers are already here"), Instantly, todos |
| "Verified emails / dados verificados" | Apollo, Lead411 ("triple verified"), UpLead, Hunter, Cognism |
| "X00 milhões de contatos e Y milhões de empresas" | Saleshandy (852M/42M), RocketReach (700M/35M), ZoomInfo, Apollo — **guerra de números que a ProspectX não pode vencer e não deve entrar** |
| "Powered by AI" / "IA que personaliza sua abordagem" | Todos, sem exceção |
| "Simple pricing / clear pricing" | Instantly ("Always know what you'll pay"), Cognism ("Clear pricing") — a Cognism usa a frase **e não publica preço** |
| "Preços a partir de / mais barato que o ZoomInfo" | Categoria inteira de conteúdo comparativo, dominada por afiliados |
| "One booked meeting covers your entire month" | Saleshandy, literal |

**A fraqueza que a nossa mensagem deve explorar — e o motivo pelo qual ela é real:**

1. **Todos os fornecedores de dado bom vendem para *equipe de vendas*, não para *quem faz o serviço*.** A prova está na própria página deles: Cognism escreve "5 seats included"; Apollo exige 3 assentos no plano Organização; Apollo organiza o site por função ("Líderes de Vendas", "Executivos de Conta", "Desenvolvimento de Vendas", "Operações de Receita"). **Nenhum deles tem uma página para "você, que faz o serviço e também precisa vender".** Esse é o ângulo humano livre — e é honesto, porque é literalmente o que a estrutura de preço deles declara.

2. **O concorrente real do cliente não é software, é o marketplace de lead que ele já odeia.** Bark cortou a validade dos créditos de 12 para 3 meses; Angi tem 1,96/5 no BBB com mais de 3 mil avaliações; o lead do Thumbtack é vendido a 4–5 profissionais ao mesmo tempo `[FONTE SECUNDÁRIA — confirmar antes de publicar]`. **Há copy poderosa em "a sua lista é sua, não é dividida com mais quatro concorrentes" e em "você não paga por contato que nunca respondeu".** Mas isso só pode ir ao ar depois de R3 (dados) — hoje seria promessa falsa.

3. **Uma assinatura só.** Instantly e Saleshandy cobram o envio numa assinatura e a base em outra. A ProspectX entrega busca + funil + disparo + IA num preço só. É verdadeiro, verificável e ninguém no segmento comunica isso.

**Duas proibições enquanto a base for OpenStreetMap:** não escrever "dados verificados", não escrever número de empresas na base. Ambos são checáveis em 30 segundos por um cliente cético e destroem a credibilidade da página inteira.

**Antes de publicar qualquer comparação nominal com Bark, Thumbtack ou Angi:** passar pelo `juridico-internacional`. Publicidade comparativa tem regra própria em EUA, UK (CAP Code) e Austrália (ACL), e os números de suporte hoje são de fonte secundária.

---

### → `prospectx-produto`

**CONSTRUIR**

| O quê | Por quê (mecanismo) |
|---|---|
| **Um sinal de compra verificável, um país, uma fonte gratuita** | Targetley vende "empresas sem site" e Lead411 vende "currently hiring" porque **evidência observável vende e categoria abstrata não**. Comece por "empresas registradas nos últimos 90 dias" no Companies House (UK): gratuito, licença comercial, download mensal em massa, e demonstrável em vídeo de 20 segundos |
| **Cobrança por busca com resultado ilimitado, ou crédito com rollover** | Num produto de descoberta o usuário precisa errar o filtro 3–4 vezes antes do acerto. Crédito sem rollover faz ele parar de tentar e cancelar antes da ativação. LeadSwift e Lead411 provaram o contrário |
| **Plano gratuito permanente limitado por funcionalidade** | Apollo, Hunter, Clay, Kaspr e RocketReach têm. Limitar por funcionalidade (e não por volume) deixa o usuário chegar ao valor e sentir falta do que falta. Limitar por volume ensina a racionar antes de ele ver valor |
| **Arquitetura de dados em cascata** | Clay não tem base própria e cobra US$ 495/mês. Transformar cobertura em problema de roteamento (registro público gratuito → Places/Apify a US$ 1,50/mil → enriquecimento pago só no que o usuário revela) elimina o ponto único de falha do OSM e alinha custo variável ao uso |
| **Assentos ilimitados** | O cliente é uma pessoa. Cobrar por assento é atender o cliente do Apollo. Hunter e Clay usam assento ilimitado como arma de ataque por baixo — funciona porque remove negociação interna e gestão de licença |

**IGNORAR**

| O quê | Por quê |
|---|---|
| Discador e verificação de telefone celular | Apollo cobra 8 créditos por número porque o custo é alto. Importar essa estrutura de custo sem a escala do Apollo é herdar a dívida dele |
| Dado de intenção comprado (Bombora e similares) | US$ 75–400 por tópico adicional `[FONTE SECUNDÁRIA]`. Precificado para enterprise. Nosso sinal tem que vir de fonte pública gratuita |
| Integração bidirecional com Salesforce/HubSpot | O cliente-alvo não tem CRM |
| Extensão Chrome sobre LinkedIn | Dependência de plataforma que não controlamos (risco Kaspr) e o cliente-alvo não vive no LinkedIn |
| **A guerra de números de base** | Saleshandy declara 852M contatos, RocketReach 700M. Essa competição está perdida antes de começar e distrai do único eixo em que dá para vencer |
| Expandir o mapa de 1.187 para 2.000 pares | Mais pares abstratos não resolvem nada. O problema não é cobertura do mapa; é ausência de evidência por trás de cada par |

**FAZER DIFERENTE**

1. **Rebaixar o mapa de 1.187 pares de proposta de valor para onboarding.** Ele é bom no que Ocean.io é ruim: partida a frio. Ocean.io precisa que você já tenha clientes bons para achar parecidos — o prestador que quer entrar num segmento novo não tem. **O mapa vira a primeira pergunta que preenche o filtro inicial ("qual é o seu ramo?"), não a manchete.** A manchete é o sinal de compra.

2. **Inverter a ordem da promessa.** Hoje: "descubra quem contrata o seu serviço" → o cliente já sabe. Proposta: "estas 40 empresas de [cidade] provavelmente vão precisar de [serviço] nas próximas semanas — aqui está o porquê de cada uma". **O "porquê" é o produto.** Categoria é grátis; evidência é o que se cobra.

3. **Escolher um país e um ofício para o primeiro lançamento, não três países e 531 segmentos.** Targetley escolheu um ofício (web design) e um sinal (sem site) e isso basta para existir. Com zero assinantes, 531 segmentos × 3 idiomas × 3 países é dispersão que impede qualquer aprendizado. **Sugestão: Reino Unido, porque o Companies House entrega o dado de graça, com licença comercial e em massa — o único dos três mercados onde a base pode ficar boa sem gastar.**

4. **Tratar "a busca fica aberta antes do cadastro" como critério de pronto, não como tática.** Um produto de dados que esconde a busca está declarando que não confia no resultado. Hoje a ProspectX não pode abrir. **O dia em que puder é o dia em que está pronta para vender** — use isso como o marco de saída da fase de correção de dados, e não lance antes.

---

*Fim do relatório. Todo preço marcado como verificado foi lido na página oficial do fornecedor em 15/08/2026. Preços mudam; revalidar antes de qualquer decisão tomada após 30 dias desta data.*
