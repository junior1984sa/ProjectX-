# Parecer — Termos, Privacidade e Uso Aceitável da ProspectX

**Emitido para:** decisão de publicação antes da primeira venda internacional
**Data de referência da pesquisa jurídica:** 15/08/2026
**Jurisdições consideradas:** Brasil (sede), Estados Unidos, Reino Unido, Austrália
**Status:** análise preliminar de departamento jurídico interno. **Não é parecer de advogado habilitado** nos Estados Unidos, no Reino Unido nem na Austrália.

Documentos analisados que já existiam e cujas conclusões foram preservadas: `RISCO-EUA-UK-AUSTRALIA.md` e `ESTRUTURA-TRIBUTARIA.md`, ambos na pasta `juridico/`.

---

## 1. Sumário executivo

Foram redigidos seis documentos, em inglês e em português brasileiro, na pasta `juridico/documentos/`:

| Documento | Arquivo | Extensão |
|---|---|---|
| Termos de Uso | `termos-de-uso.pt-BR.md` · `terms-of-service.en.md` | 20 cláusulas + Anexo A (DPA) |
| Política de Privacidade | `politica-de-privacidade.pt-BR.md` · `privacy-policy.en.md` | 3 partes, duplo papel |
| Política de Uso Aceitável | `politica-de-uso-aceitavel.pt-BR.md` · `acceptable-use-policy.en.md` | 15 cláusulas |

**Três conclusões que mudam decisão de negócio:**

**Primeira — os documentos não podem ser publicados como estão.** Existem **75 campos distintos** a preencher (150 ocorrências, contando as duas línguas). Desses, **onze não são "preencher um dado", são "construir uma funcionalidade"**: o documento afirma algo que o produto ainda não sabe fazer. Publicar sem construir transforma a política em declaração falsa ao consumidor e ao regulador — que é risco pior do que não ter política, porque vira prova documental contra a empresa. A Cláusula 8 deste parecer lista cada uma.

**Segunda — a ODbL obriga mais do que atribuição, e a saída de "base coletiva" não funciona no nosso caso.** A Community Guideline *Horizontal Map Layers* da OSMF é expressa: se você usa dado do OSM **e** dado próprio **para o mesmo tipo de feição**, o share-alike incide, ainda que estejam em camadas separadas. Nossa Camada ProspectX classifica e pontua exatamente as mesmas feições que vêm do OSM — empresas. Logo, a base derivada é **Derivative Database**, entregá-la a um assinante pagante é **uso público**, e nascem as obrigações das seções 4.4 e 4.6 da ODbL. Isso exige **construir um endpoint público de download da camada derivada do OSM**, sob ODbL. A Cláusula 4 detalha, inclusive o que a licença **não** contamina — que é mais do que se costuma temer.

**Terceira — a cláusula de limitação de responsabilidade e a de foro não são plenamente exequíveis no Reino Unido nem na Austrália, e isso foi escrito de forma explícita no documento em vez de escondido.** Fingir que a lei brasileira resolve tudo não protege a empresa: no Reino Unido a razoabilidade do UCTA 1977 é aferida pelo tribunal, e na Austrália, desde 09/11/2023, **usar ou invocar cláusula abusiva em contrato de adesão com pequena empresa é infração autônoma com penalidade**, não apenas causa de nulidade. Uma cláusula de responsabilidade agressiva demais deixou de ser "inofensiva se cair" e passou a ser risco ativo.

Um ponto positivo relevante: **a trava por país já implementada no servidor é o ativo jurídico mais valioso do produto hoje**. Ela é o que permite escrever uma PUA honesta. Sem ela, a Cláusula 5 da PUA seria promessa vazia.

---

## 2. Decisões de redação, e por quê

### 2.1 Duas línguas, e qual governa

Publicamos em inglês e português. A Cláusula 20.9 dos Termos define: **português rege assinantes domiciliados no Brasil; inglês rege todos os demais.**

Por quê: o mercado-alvo declarado é EUA → Reino Unido → Austrália, e o texto operacional é o inglês. Mas uma cláusula que dissesse "só o inglês vale" seria frágil contra assinante brasileiro (CDC, art. 46 — obrigação só vincula se o consumidor teve possibilidade de conhecimento prévio; e a jurisprudência brasileira é hostil a contrato de adesão em língua estrangeira). Dividir por domicílio resolve os dois lados sem criar contradição.

**Consequência operacional:** as duas versões precisam ser mantidas em paralelo para sempre. Alterar uma sem a outra cria conflito entre versões igualmente vigentes para públicos diferentes. Isso é dívida permanente, e foi aceita conscientemente.

### 2.2 Lei brasileira e foro brasileiro — com uma cláusula que admite os limites disso

Escolhemos lei brasileira (Cláusula 18.1) e foro da comarca da sede (18.2). É o correto para uma empresa brasileira: litigar sob lei que o próprio advogado da empresa conhece vale mais do que uma escolha "sofisticada" de lei inglesa que ninguém aqui saberia conduzir.

A eleição de foro foi ancorada no **art. 63 do CPC (Lei nº 13.105/2015), com a redação da Lei nº 14.879, de 04/06/2024**, que passou a exigir pertinência do foro eleito com o domicílio ou a residência de uma das partes ou com o local da obrigação (fonte: planalto.gov.br, consultado em 15/08/2026). Por isso o texto **declara expressamente** que o foro eleito é o domicílio da ProspectX. Sem essa frase, a cláusula fica exposta a declínio de ofício.

Mas a Cláusula 16 diz, em letra clara, que 18.1 e 18.2 **não retiram** direito inafastável de foro do domicílio do assinante. Essa concessão é deliberada, e a razão está em 2.3.

### 2.3 Por que admitimos, no texto, que partes do contrato podem cair

Esta foi a decisão de redação mais contraintuitiva do conjunto, e vale explicar.

**Reino Unido.** O **Unfair Contract Terms Act 1977** aplica-se quando se contrata sobre termos-padrão escritos. A seção 3 sujeita a exclusão de responsabilidade por descumprimento ao **requisito de razoabilidade** da seção 11; a seção 2(1) proíbe totalmente excluir responsabilidade por morte ou lesão decorrente de negligência (jurisdição: Reino Unido; fonte: legislation.gov.uk, consultado em 15/08/2026). Ou seja: quem decide se o nosso teto de responsabilidade vale é o juiz inglês, e a lei aplicável escolhida não afasta esse controle quando o contrato é executado lá.

**Austrália.** Dois regimes incidem. A **Australian Consumer Law** (Schedule 2 do *Competition and Consumer Act 2010* (Cth)) trata como "consumidor" também a aquisição empresarial cujo preço não exceda **A$ 100.000** (limite elevado de A$ 40.000 com efeito a partir de 01/07/2021 — fonte: orientação da ACCC, consultada em 15/08/2026). Nenhuma assinatura da ProspectX chega perto disso: **todo assinante australiano é consumidor para a ACL**, e as garantias legais não podem ser afastadas por contrato. E o regime de **cláusulas abusivas em contrato de adesão com pequena empresa** mudou em **09/11/2023**: deixou de ser apenas nulidade e passou a haver **proibição de propor, usar ou invocar** cláusula abusiva, com penalidade (fonte: orientação da ACCC e da ASIC, consultada em 15/08/2026).

Daí a decisão: **uma cláusula agressiva que provavelmente cai não é neutra — na Austrália ela é, ela própria, o ilícito.** Por isso a Cláusula 16 dos Termos foi escrita como cláusula de prevalência de direitos locais imperativos, e a Cláusula 15 foi calibrada para ser defensável, não para ser máxima.

**Brasil.** Incluímos a hipótese de aplicação do CDC (Lei nº 8.078/1990) a assinante brasileiro pela teoria finalista mitigada — vulnerabilidade técnica ou econômica reconhecida pela jurisprudência. É risco real num produto vendido a serralheiro e a empresa de limpeza. A Cláusula 7.5 já concede reembolso de 7 dias a todos, o que **esvazia a discussão do art. 49 do CDC antes que ela comece**. Sete dias de reembolso custam menos do que uma tese.

### 2.4 O teto de responsabilidade: maior entre 12 meses de mensalidade e US$ 100

Um teto puro de "valor pago nos últimos 12 meses" tem um defeito prático: no primeiro mês, ele vale a mensalidade — algo entre US$ 20 e US$ 80. Um teto tão baixo é justamente o que um tribunal inglês ou australiano usa como exemplo de irrazoabilidade, e derrubar o teto por inteiro é pior do que ter um teto modesto que sobrevive. O piso de **US$ 100** existe para dar ao teto uma chance de ser considerado razoável.

Também foi incluído prazo contratual de **1 ano** para propor demanda (Cláusula 15.6), com ressalva expressa de prazo legal maior. No Brasil essa cláusula tem eficácia duvidosa em relação a prazo prescricional legal; ela foi mantida por valer em outras jurisdições e por estar ressalvada, não por confiança na sua exequibilidade aqui.

### 2.5 Elegibilidade empresarial — e por que declarar isso não basta

A Cláusula 3 restringe o Serviço a uso empresarial. Isso é necessário, mas **não é suficiente**, e o documento diz isso em 3.3 em vez de fingir o contrário.

Motivo: no Reino Unido a proteção do UCTA independe de rótulo; na Austrália o limiar de A$ 100.000 captura empresas; no Brasil a finalista mitigada captura microempresa vulnerável. Uma cláusula que dissesse "você declara não ser consumidor, logo nenhuma lei consumerista se aplica" seria, ela mesma, candidata a cláusula abusiva na Austrália. Declarar a limitação e depois reconhecer os direitos imperativos é mais defensável do que negá-los.

### 2.6 Ausência de garantia de resultado — e a ligação com o vocabulário de marketing

A Cláusula 4.3 nega qualquer promessa de resposta, reunião, lead, cliente ou receita, e a 14.3 nega verificação dos registros.

Isso conecta diretamente com a lista de vocabulário proibido do `RISCO-EUA-UK-AUSTRALIA.md`. **Contrato e anúncio precisam concordar.** Se a landing page disser "verified leads" e o contrato disser "não verificamos nada", a contradição não protege — ela é prova de propaganda enganosa, com exposição à FTC nos EUA (deceptive practices), à ACCC na Austrália (*misleading or deceptive conduct*, s. 18 da ACL) e ao CDC no Brasil (arts. 30 e 37). A Cláusula 20.2 (integralidade) **não salva** desse risco, porque em nenhuma dessas jurisdições uma cláusula de integralidade afasta responsabilidade por declaração enganosa — e o texto ressalva isso expressamente para declaração fraudulenta.

**Handoff obrigatório:** `copywriter-conversao` e `prospectx-growth` precisam ler as Cláusulas 4.2, 4.3 e 14.3 antes de escrever qualquer peça.

### 2.7 Créditos: acumulam, mas não valem dinheiro

Definimos (Cláusula 6.4) que créditos acumulam enquanto a assinatura está ativa, não têm valor monetário, não são transferíveis e expiram no término. Isso segue o que a migration `016_creditos_acumulativos_e_travas.sql` já implementa.

O reembolso de crédito (6.6) foi limitado a **falha nossa ou segmento não mapeado** — expressamente **não** cobre insatisfação com quantidade ou qualidade do resultado. Sem esse recorte, cada busca com poucos resultados vira pedido de estorno, e num produto cuja base é OSM não validado isso seria constante.

### 2.8 O duplo papel na Política de Privacidade

A política foi partida em três: Parte 1 (somos controladores), Parte 2 (somos operadores), Parte 3 (comum). A tabela da seção 0 explica ao titular, em três linhas, qual parte se aplica a ele.

Essa separação não é estética. Ela resolve o problema que quebra a maioria das políticas de ferramenta de prospecção: **a empresa que recebe o e-mail e a empresa que assina o produto têm direitos diferentes, contra pessoas diferentes.** Uma política única, escrita só para o assinante, deixa o destinatário sem caminho — e é exatamente o destinatário que reclama ao ICO, à OAIC ou à ANPD.

### 2.9 Base legal por finalidade — e onde recusamos usar legítimo interesse

A tabela da seção 1.4 declara base legal finalidade a finalidade, em quatro jurisdições. O ponto crítico está na seção 1.6: **não invocamos legítimo interesse para justificar disparo no Reino Unido nem na Austrália.**

Isso preserva a conclusão do `RISCO-EUA-UK-AUSTRALIA.md` e a torna coerente com o código. A posição publicada do ICO é que *sole trader* e *ordinary partnership* são *individual subscribers* sob a regulation 22 do PECR, exigindo consentimento prévio ou *soft opt-in* — e legítimo interesse do UK GDPR **não substitui** o consentimento exigido pelo PECR, porque são normas distintas incidindo cumulativamente. Na Austrália, o Spam Act 2003 (Cth) exige consentimento expresso ou inferido, e **registro de OSM criado por terceiro não sustenta consentimento inferido**.

**Consequência de produto:** o Reino Unido e a Austrália, hoje, são mercados onde se pode **vender a assinatura** e **fazer a busca**, mas **não disparar**. Isso precisa estar claro na página de preços, não só na PUA — vender ao britânico a promessa de disparo que o servidor vai recusar é risco de consumidor e de *misleading conduct*.

### 2.10 Por que não notificamos individualmente cada empresa indexada

Seção 1.7 da Política. Apoia-se no **art. 14(5)(b) do UK GDPR**, que dispensa a informação ao titular obtida indiretamente quando ela exigir esforço desproporcional, desde que adotadas medidas apropriadas, incluindo tornar a informação publicamente disponível. A política **é** essa medida, e cada e-mail enviado informa o destinatário no momento do contato.

Registre-se com honestidade: **isso é uma tese, não uma certeza.** É a tese padrão do setor e é defensável, mas o ICO já contestou o uso do art. 14(5)(b) por corretores de dados. É item para advogado inglês (Cláusula 7).

### 2.11 O paradoxo da lista de supressão, e como foi resolvido

Existe uma contradição real entre dois direitos: o titular pede exclusão dos dados **e** pede para nunca mais ser contatado. Se excluirmos tudo, perdemos a memória de que ele pediu para não ser contatado, e a próxima busca o traz de volta.

Solução adotada, declarada em texto na Parte 6 da Política e na Cláusula 7.5 da PUA: **excluímos o registro e mantemos apenas a entrada de supressão, por tempo indeterminado, guardando só o endereço e a data, sem uso para nenhuma outra finalidade.** E dizemos, com todas as letras, que **um pedido de exclusão não remove o titular da lista de supressão** — se quiser sair dela também, precisa pedir separadamente e de forma expressa.

Isso é minimização aplicada corretamente: guardar o mínimo necessário para honrar o próprio pedido. A alternativa — apagar tudo — pareceria mais "privacy-friendly" e produziria o resultado oposto.

### 2.12 A PUA como proteção de infraestrutura, não como boas maneiras

A Cláusula 0 da PUA foi escrita para ser lida, não para ser pulada. Ela declara três coisas incômodas de propósito:

1. **um assinante que faz spam destrói o produto para todos** — porque blocklist age contra domínio e contra fornecedor, não contra conta;
2. **agimos primeiro e explicamos depois** quando o risco é à reputação de envio (Cláusula 12.2, espelhando a 13.2 dos Termos);
3. **algumas proibições são mais rígidas que a lei** — ser lícito não é ser permitido aqui.

E a Cláusula 14.2 cria uma exceção ao aviso prévio de 30 dias: **restrições por destino (Cl. 5) e limites de envio (Cl. 8) podem mudar com efeito imediato.** Sem essa exceção, um bloqueio urgente de país exigiria esperar 30 dias — o que anula o próprio mecanismo de defesa.

Foi incluída (Cl. 2.4) a extensão explícita ao **WhatsApp e a canais manuais**, preservando o achado do documento de risco: envio manual não é defesa, porque a norma olha a natureza da mensagem, não o grau de automação. O produto entrega telefone; sem essa cláusula, o assinante britânico usaria o telefone entregue por nós e nós não teríamos escrito em lugar nenhum que aquilo é proibido.

### 2.13 As três camadas de dados — a decisão estrutural do contrato

A Cláusula 9 dos Termos separa:

| Camada | Quem licencia | O que o assinante pode fazer |
|---|---|---|
| **Dados OSM** | Os colaboradores do OpenStreetMap, sob ODbL — **não nós** | O que a ODbL permitir. Não restringimos |
| **Camada ProspectX** | Nós | Uso interno na própria prospecção. Sem revenda, sem redistribuição, sem treinar concorrente |
| **Conteúdo do Assinante** | O assinante é dono | Tudo. Nós só hospedamos e processamos por instrução |

Essa separação é **obrigatória**, não estilística. A seção **4.7(a) da ODbL proíbe impor termos que restrinjam os direitos concedidos pela licença**. Uma cláusula genérica de "proibido revender os dados" — sem recortar o componente OSM — seria, ela própria, violação da ODbL, e violação da ODbL **extingue automaticamente** o direito de usar os dados (seção 9.1). Ou seja: a cláusula anti-revenda mal redigida mataria o produto. Por isso existem a Cláusula 9.1(c) dos Termos e a 6.2 da PUA.

Contrapartida necessária: a PUA precisou distinguir **direito sobre o dado** de **uso da nossa infraestrutura**. O assinante tem direito ODbL sobre os dados OSM, mas **não tem direito de raspar os nossos servidores** para obtê-los (PUA 6.2(b)). A restrição incide sobre a API, não sobre o dado. Esse recorte é o que mantém as duas coisas verdadeiras ao mesmo tempo.

---

## 3. Onde a limitação de responsabilidade e o foro podem ser inexequíveis — sinalização exigida

| Cláusula | Reino Unido | Austrália | Brasil |
|---|---|---|---|
| **14.2** — "as is", exclusão de garantias implícitas | Sujeita ao teste de razoabilidade da s. 11 do UCTA 1977. **Risco médio-alto de cair em parte** | **Não se aplica** contra as garantias legais da ACL. A ACL prevalece integralmente | Sujeita ao art. 51, I, do CDC se reconhecida relação de consumo |
| **15.2** — exclusão de lucros cessantes e perda de dados | Teste de razoabilidade. Defensável entre empresas, mas não automático | Válida apenas fora do alcance das garantias da ACL. Dentro delas, limitada pela s. 64A | Lucro cessante é indenizável (CC, art. 402). Cláusula frágil em relação de consumo |
| **15.4** — teto de 12 meses ou US$ 100 | **Ponto mais exposto.** Teto muito baixo é o exemplo clássico de irrazoabilidade sob o UCTA | Pode ser **cláusula abusiva** sob o regime de pequena empresa vigente desde 09/11/2023 — e usá-la é infração autônoma | Art. 51, I, do CDC veda exoneração em relação de consumo |
| **15.6** — prazo de 1 ano para demandar | Redução de prazo prescricional legal tende a ser irrazoável | Não afasta prazo da ACL | Prazo prescricional é legal e indisponível. **Provavelmente ineficaz no Brasil** |
| **17** — indenização pelo assinante | Ampla demais pode ser irrazoável sob o UCTA | Indenização unilateral e desbalanceada é indício clássico de abusividade | Sujeita a controle de abusividade |
| **18.2** — foro exclusivo no Brasil | Não afasta competência inglesa quando houver direito local inafastável | **Não afasta** a jurisdição australiana quanto aos direitos da ACL | Válida entre empresas; em consumo, o foro do domicílio do consumidor prevalece |

**Como isso foi endereçado no texto:** cada uma dessas cláusulas está expressamente subordinada à Cláusula 16, que reconhece a prevalência do direito local imperativo e determina que a cláusula afetada deixe de se aplicar **apenas na medida do conflito**, preservando o restante. É o desenho que maximiza a chance de sobrevivência parcial em vez de nulidade integral.

**Recomendação:** aceitar essa calibragem. A tentação de endurecer o teto deve ser resistida — na Austrália, endurecer aumenta o risco em vez de reduzir.

---

## 4. ODbL — qual é a obrigação real ao entregar os dados a um assinante pagante

Esta é a análise que o pedido exigia em separado, e a resposta é mais específica do que "precisa de atribuição".

### 4.1 As quatro perguntas, respondidas

**(a) Nossa base é uma "Derivative Database"?** — **Sim, com alta confiança.**
A ODbL define *Derivative Database* como base fundada na Base original, incluindo qualquer adaptação, arranjo, modificação ou alteração da Base ou de parte Substancial dos Conteúdos. A seção 4.4(b) é ainda mais direta: **extração ou reutilização do todo ou de parte substancial dos Conteúdos para uma nova base é uma Derivative Database** (fonte: opendatacommons.org, consultado em 15/08/2026). Nós extraímos registros do OSM via Nominatim/Overpass, guardamos em Postgres, deduplicamos, classificamos e pontuamos. É exatamente a conduta descrita.

**(b) A saída da "Collective Database" nos salva?** — **Não.**
Esta é a descoberta que altera a avaliação anterior. A Community Guideline **Horizontal Map Layers**, adotada pelo board da OSMF, estabelece que o critério é o **tipo de feição**: *"If you use OpenStreetMap data along with non-OpenStreetMap data for a given Feature Type, then the share-alike condition would apply regardless of whether some data for that Feature Type is in a different layer"* (fonte: osmfoundation.org, consultado em 15/08/2026). Nossa Camada ProspectX — segmento, score, chave de dedup — descreve **as mesmas empresas** que vêm do OSM. Mesmo tipo de feição. Guardar em tabela separada **não** transforma isso em base coletiva. A arquitetura não resolve o problema.

**(c) Entregar ao assinante é "uso público"?** — **Sim.**
A ODbL define *Publicly* como "a Pessoas que não sejam Você ou estejam sob Seu controle por mais de 50% de participação ou pelo poder de dirigir suas atividades". Um assinante pagante não é nada disso. Portanto **a exceção de uso interno da seção 4.5(c) não se aplica a nós** — ela cobriria usar a base só dentro da empresa, que não é o modelo de negócio.

**(d) É parte "Substancial"?** — **Provavelmente sim, e a tendência é agravar.**
O conceito vem da Diretiva de Bases de Dados europeia e é avaliado quantitativa e qualitativamente. Um recorte por cidade e segmento, acumulado ao longo do tempo pela tabela `cache_buscas`, tende a ser substancial. E a Guideline *Regional Cuts* trata recorte geográfico como derivada. **Este é o único dos quatro pontos em que uma opinião contrária é sustentável** — se a base for pequena e efêmera. Não é a direção do produto.

### 4.2 O que a ODbL obriga — e o que ela não obriga

| Situação | Obriga? | Fundamento |
|---|---|---|
| Exibir "© OpenStreetMap contributors" com link para a licença na tela de resultados | **Sim** | ODbL 4.2 e 4.3. **Já implementado** |
| Levar a atribuição junto em qualquer exportação (CSV, PDF, e-mail de resultado) | **Sim** | ODbL 4.2. **Não verificado no código** |
| Licenciar sob ODbL a camada derivada do OSM | **Sim** | ODbL 4.4(a) |
| Oferecer acesso à base derivada, ou a um arquivo de alterações, a quem recebe o uso público | **Sim** | ODbL 4.6 |
| Não impor ao assinante termos que restrinjam os direitos da ODbL sobre os dados OSM | **Sim** | ODbL 4.7(a). **Endereçado nos Termos 9.1(c) e na PUA 6.2** |
| Cobrar pelo serviço | **Permitido** | A ODbL não proíbe uso comercial |
| Abrir o **código-fonte** da ProspectX | **Não** | ODbL licencia base de dados, não software |
| Licenciar sob ODbL o **Conteúdo do Assinante** (funil, anotações, contatos carregados) | **Não** | Não deriva do OSM |
| Licenciar sob ODbL o e-mail redigido pela IA ou a tela renderizada | **Não** | São *Produced Work* — ODbL 4.5(b). Mas o 4.6 continua incidindo sobre a base subjacente |
| Licenciar sob ODbL dados de outras fontes sobre outro tipo de feição | **Não** | Guideline *Horizontal Map Layers* |

**A leitura tranquilizadora:** a ODbL **não** contamina o software, nem o conteúdo do assinante, nem a inteligência de negócio como algoritmo. O que ela alcança é o **conjunto de registros de empresas derivado do OSM** — incluindo, e este é o custo real, **as classificações que anexamos a esses registros**, por serem do mesmo tipo de feição.

### 4.3 O que fazer, concretamente

1. **Publicar um endpoint com o dump da camada derivada do OSM, sob ODbL**, com aviso de licença. É o caminho de menor esforço para satisfazer 4.4(a) e 4.6 simultaneamente. Preenche `[PREENCHER]` dos Termos 9.1(e) e da PUA 6.2(b). **Precisa ser construído — não existe.**
2. **Decidir o escopo do dump.** Duas opções, com trade-off comercial real:

   | Opção | Publica | Risco de conformidade | Custo competitivo |
   |---|---|---|---|
   | **A — conservadora** | Registros OSM + classificação de segmento + chave de dedup | Baixo | Entrega ao concorrente a nossa classificação |
   | **B — mínima** | Só os registros OSM tratados, sem classificação nem score | Médio — depende de a classificação ser mesmo "mesmo tipo de feição" | Preserva a inteligência |

   **Recomendação: começar pela A.** É a única que dorme tranquila. A classificação de segmento não é o fosso competitivo do produto — o fosso é a experiência de uso, o funil e o disparo. Revisitar a opção B só depois de parecer de advogado de open data, se a classificação virar diferencial real.
3. **Manter a atribuição em toda saída**, não só na tela: exportação, PDF, e-mail com resultados.
4. **Não remover o recorte da Cláusula 9.1(c)**, sob nenhum pretexto comercial.

### 4.4 Refinamento à avaliação anterior — o risco é grave, mas curável

O `RISCO-EUA-UK-AUSTRALIA.md` classificou a ODbL como "risco existencial" porque a violação extingue automaticamente o direito de uso. **Isso está correto** — a seção 9.1 termina a licença automaticamente, sem notificação.

O que faltava naquela análise, e vale registrar: **a seção 9.4 prevê restabelecimento.** A licença é reinstaurada provisoriamente por 60 dias após a cessação da violação e torna-se permanente no 60º dia se o licenciante não se opuser; e é permanente se for a primeira notificação de violação e ela for sanada em 30 dias (fonte: opendatacommons.org, consultado em 15/08/2026).

Isso **não rebaixa a prioridade** — continua sendo o risco mais grave da matriz —, mas muda a natureza: não é morte súbita sem apelação, é uma janela de correção. A postura correta continua sendo corrigir antes de vender.

---

## 5. Matriz de risco dos documentos

| # | Risco | Prob. | Impacto | Severidade | Mitigação |
|---|---|---|---|---|---|
| 1 | Publicar política que promete o que o produto não faz (exclusão, retenção, acesso) | Alta se publicar hoje | Alto — prova documental contra a empresa | **CRITICAL** | Cláusula 8 antes de publicar |
| 2 | ODbL 4.4/4.6 sem endpoint público da derivada | Alta | Extinção do direito de uso da base | **CRITICAL** | Construir o dump ODbL (4.3) |
| 3 | Teto de responsabilidade tratado como cláusula abusiva na Austrália | Média | Penalidade autônoma + nulidade | **HIGH** | Cláusula 16.2 já mitiga. Advogado australiano confirma |
| 4 | Falta de representante do art. 27 do UK GDPR | Média-alta | Infração autônoma | **HIGH** | Cláusula 7.2 |
| 5 | Marketing contradizer as Cláusulas 4.2/4.3/14.3 | Alta sem controle | FTC / ACCC / CDC | **HIGH** | Handoff ao copy; revisão final |
| 6 | Art. 14(5)(b) do UK GDPR contestado pelo ICO | Média | Determinação de notificação individual | **MEDIUM** | Advogado inglês |
| 7 | Divergência entre versão EN e PT após alteração | Média | Duas versões vigentes conflitantes | **MEDIUM** | Processo de alteração pareado |
| 8 | Assinante britânico comprar acreditando que pode disparar | Média | Consumidor + *misleading conduct* | **MEDIUM** | Declarar na página de preços, não só na PUA |
| 9 | Registro como data broker nos EUA (sinalizado no doc de risco) | Indeterminada | Multa por dia | **HIGH** | Advogado americano (7.1) |

---

## 6. Lista completa dos `[PREENCHER]`

**75 campos distintos · 150 ocorrências** (cada campo aparece nas duas línguas). Nenhum documento pode ser publicado com campo em aberto.

### 6.1 Identificação da empresa — bloqueia os três documentos

| # | Campo | Onde |
|---|---|---|
| 1 | Razão social completa | Termos (cabeçalho), Privacidade (cabeçalho), PUA (cabeçalho) |
| 2 | CNPJ | Mesmos três |
| 3 | Endereço postal completo com CEP | Mesmos três + Privacidade §13 |
| 4 | Domínio oficial do produto | Termos (cabeçalho) |
| 5 | Comarca e UF da sede | Termos 18.2 |
| 6 | Data de publicação / vigência | Os três cabeçalhos |

### 6.2 Endereços de contato

| # | Campo | Onde |
|---|---|---|
| 7 | E-mail de suporte | Termos 7.3, 7.5, 12.3; PUA 15 |
| 8 | E-mail de segurança | Termos 5.3; Privacidade §7 e §13; PUA 9 e 15 |
| 9 | E-mail de privacidade | Privacidade §1.8, §3, §8.1, §8.2, §10, §13 |
| 10 | E-mail de notificações jurídicas | Termos 20.6 |
| 11 | E-mail de abuso | PUA cabeçalho, 11.1, 15 |
| 12 | E-mail comercial (agência/revenda) | PUA 15 |
| 13 | Nome e contato do encarregado (DPO) | Privacidade cabeçalho e §13 — **ver nota em 6.7** |
| 14 | Representante do art. 27 no Reino Unido | Privacidade cabeçalho — **ver 7.2** |

### 6.3 URLs — todas precisam existir antes da publicação

| # | Campo | Onde |
|---|---|---|
| 15 | URL da PUA | Termos §1; PUA 14.1 |
| 16 | URL da Política de Privacidade | Termos §1 |
| 17 | URL da página de preços | Termos 6.1 |
| 18 | **URL do dump ODbL da camada derivada** | Termos 9.1(e); PUA 6.2(b) — **funcionalidade, não texto** |
| 19 | URL do arquivo de versões | Termos 19.4; Privacidade §12; PUA 14.3 |
| 20 | URL da página de subprocessadores | Termos Anexo A.8; Privacidade §4 |

### 6.4 Prazos e parâmetros comerciais

| # | Campo | Onde | Sugestão |
|---|---|---|---|
| 21 | Preço com ou sem imposto | Termos 6.2 | Decisão pendente desde `ESTRUTURA-TRIBUTARIA.md` §"decisão de preço" |
| 22 | Aviso prévio para mudança de custo em créditos | Termos 6.5 | 30 dias |
| 23 | Duração do teste gratuito | Termos 6.7 | 7 dias (é o que a migration 013 implementa) |
| 24 | Aviso prévio de renovação | Termos 7.2 | 7 dias mensal / 30 dias anual |
| 25 | Aviso prévio de mudança de preço | Termos 7.4 | 30 dias |
| 26 | Carência por falha de pagamento | Termos 7.7 | 7 dias |
| 27 | Prazo de encerramento por falta de pagamento | Termos 7.7 | 30 dias |
| 28 | Janela de manutenção com fuso | Termos 12.2 | — |
| 29 | Horário de suporte com fuso | Termos 12.3 | — |
| 30 | Meta de primeira resposta | Termos 12.3 | 1 dia útil |
| 31 | Prazo de saneamento de violação material | Termos 13.3 | 7 dias |
| 32 | Aviso de encerramento por conveniência | Termos 13.4 | 30 dias |
| 33 | Prazo de disponibilização de cópia após término | Termos 13.5 | 30 dias |
| 34 | Aviso prévio de alteração material dos Termos | Termos 19.2 | 30 dias |
| 35 | Aviso prévio de troca de subprocessador | Termos Anexo A.8 | 30 dias |

### 6.5 Privacidade — confirmações factuais e prazos

| # | Campo | Onde |
|---|---|---|
| 36 | Confirmar o estado atual das travas por país | §1.6 |
| 37 | Revisar §1.8 se surgir SKU de exportação em massa ("venda" nos EUA é mais amplo que preço) | §1.8 |
| 38 | Região de hospedagem configurada no projeto Supabase | §4 |
| 39 | Provedor de analytics ou monitoramento de erro, se houver | §4 |
| 40 | Confirmar execução das cláusulas-padrão da ANPD com cada fornecedor | §4.1 |
| 41 | **Confirmar, contra os termos comerciais vigentes da Anthropic, o não uso para treino e o prazo de retenção da API** | §5.3 |
| 42 | Teto de retenção de logs de acesso | §6 |
| 43 | Prazo de retenção dos registros de empresas do OSM | §6 |
| 44 | Prazo de exclusão do Conteúdo do Assinante após término | §6 |
| 45 | Prazo de retenção de correspondência de suporte | §6 |
| 46 | Número e papéis das pessoas com acesso a produção | §7 |
| 47 | Backups: criptografia, local e retenção | §7 |
| 48 | MFA habilitado em Supabase, Vercel, Resend, Stripe e Mercado Pago | §7 |
| 49 | Prazo de resposta a pedido de titular | §8.1 |
| 50 | Confirmar a lista exata de cookies | §9 |
| 51 | Cookies de analytics/marketing — se houver, banner de opt-in vira obrigatório no Reino Unido | §9 |
| 52 | Confirmar ausência de pixel de publicidade | §9 |
| 53 | Aviso prévio de alteração material da política | §12 |

### 6.6 PUA — parâmetros operacionais

| # | Campo | Onde | Sugestão |
|---|---|---|---|
| 54 | Setores regulados — revisar se algum virar mercado-alvo | 4.3 | manter a lista |
| 55 | Limiares numéricos de reclamação e rejeição | 8.2 | definir com `especialista-deliverability` |
| 56 | Número máximo de follow-ups | 8.3 | 2 |
| 57 | Intervalo mínimo entre follow-ups | 8.3 | 5 dias úteis |
| 58 | Prazo de acusação de recebimento de denúncia | 11.2 | 2 dias úteis |
| 59 | Aviso prévio de alteração da PUA | 14.2 | 30 dias |

> Os itens 60 a 75 são as repetições dos mesmos campos em cláusulas distintas do mesmo documento (por exemplo, e-mail de suporte em três cláusulas dos Termos e no quadro final da PUA). Preencher por **busca e substituição do texto exato do marcador**, documento a documento, e conferir depois com `rg "\[PREENCHER" juridico/documentos/` — **o resultado precisa ser zero antes de publicar.**

### 6.7 Nota sobre o encarregado (item 13)

A LGPD, art. 41, exige que o controlador indique encarregado. Mas o **art. 11 da Resolução CD/ANPD nº 2, de 27/01/2022**, dispensa o **agente de tratamento de pequeno porte** de indicar encarregado, exigindo em contrapartida **disponibilizar canal de comunicação com o titular**, para cumprir o art. 41, §2º, I, da LGPD. A dispensa não alcança quem trata dado de alto risco nem quem ultrapassa os limites de receita definidos na Resolução (fonte: gov.br/anpd, consultado em 15/08/2026).

**A ProspectX, com faturamento zero, enquadra-se como agente de pequeno porte** — mas o tratamento pode ser considerado **de alto risco**, o que afastaria a dispensa. É decisão que exige análise específica.

**Recomendação prática:** preencher o campo com um **canal de comunicação** (`privacidade@...`) e a menção ao art. 11 da Resolução, em vez de nomear um encarregado. Custa nada e é conforme. Isso **não** resolve a questão do art. 37 do UK GDPR (7.2).

---

## 7. O que exige advogado habilitado antes de publicar

Os itens abaixo **não podem** ser fechados por análise interna. Estão em ordem de urgência.

### 7.1 Estados Unidos — advogado americano

| Questão | Por que trava |
|---|---|
| **Registro como data broker** (Califórnia e demais estados que exigem) | Sinalizado no `RISCO-EUA-UK-AUSTRALIA.md` com prazo correndo. Registro é obrigação da empresa, independente de política publicada. **Mapeamento estado a estado é indispensável** |
| Se somos "data broker" segundo a definição de cada estado | A resposta muda a Política §1.8 e cria obrigação de registro e de opt-out |
| Alcance do conceito de "sale"/"sharing" das leis estaduais sobre o nosso modelo | Hoje afirmamos que não vendemos. Se um SKU de exportação surgir, a afirmação muda |
| Aplicabilidade do TCPA a mensagens de WhatsApp | Já apontado no doc de risco. Não foi resolvido |
| Exequibilidade do teto de responsabilidade e do prazo de 1 ano perante lei estadual | Alguns estados restringem redução de prazo |

### 7.2 Reino Unido — advogado inglês (*solicitor*)

| Questão | Por que trava |
|---|---|
| **Necessidade de representante do art. 27 do UK GDPR** | A dispensa exige que o tratamento seja **ocasional**, não envolva categoria especial em larga escala e seja improvável gerar risco — **condições cumulativas e de interpretação estreita**. Indexar empresas britânicas como atividade-fim dificilmente é "ocasional" (fonte: orientação do ICO, consultada em 15/08/2026). **Se for exigido, é infração autônoma desde a primeira operação** |
| Necessidade de DPO sob o art. 37 do UK GDPR | Monitoramento regular e sistemático em larga escala é o gatilho. Nossa atividade-fim se aproxima disso |
| Solidez da tese do art. 14(5)(b) (esforço desproporcional) | O ICO já contestou esse uso por corretores de dados |
| Razoabilidade das Cláusulas 14 e 15 sob o UCTA 1977 | Só o teste de razoabilidade responde |
| Confirmação da posição PECR reg. 22 sobre *sole traders* | Sustenta a trava do produto. Vale ter por escrito |
| Se a trava por país é suficiente ou se indexar dado britânico já basta para acionar o PECR/UK GDPR | **Ponto mais relevante:** nós indexamos empresas britânicas mesmo sem enviar e-mail. Isso é tratamento, e o UK GDPR incide sobre ele |

### 7.3 Austrália — advogado australiano

| Questão | Por que trava |
|---|---|
| Cláusulas abusivas em contrato de adesão com pequena empresa (regime de 09/11/2023) | Usar cláusula abusiva é **infração com penalidade**. Cláusulas 15.4 e 17 precisam ser revisadas |
| Alcance real das garantias da ACL sobre um SaaS abaixo de A$ 100.000 | Confirma a redação da Cláusula 16.2 |
| Texto vigente da Schedule 2 do Spam Act e alcance da publicação conspícua | Pendência aberta desde o doc de risco. É o que destravaria a Austrália |
| Aplicação da isenção de pequena empresa da s. 6D(4) do Privacy Act | O doc de risco concluiu que **não** se aplica. Confirmar |
| Se a eleição de foro brasileiro sobrevive à ACL | Cláusula 18.2 |

### 7.4 Brasil — advogado brasileiro

| Questão | Por que trava |
|---|---|
| Eleição de foro sob o art. 63 do CPC com a redação da Lei 14.879/2024 | Redação já ancorada, mas revisão local confirma |
| Risco de aplicação do CDC pela finalista mitigada ao nosso público | Define quanto endurecer a Cláusula 3 |
| Necessidade de encarregado vs canal de comunicação (item 6.7) | Enquadramento como alto risco |
| Retenção do art. 15 do Marco Civil — mínimo de 6 meses e teto adequado | Precisa virar rotina, não só texto |
| **Requisitos de produto com efeito fiscal** do `ESTRUTURA-TRIBUTARIA.md` (restringir busca internacional a cidades fora do Brasil; validar número fiscal no checkout) | Tributarista + jurídico. Impacta a tese de exportação de serviço |

### 7.5 Open data — advogado especializado

| Questão | Por que trava |
|---|---|
| Se a classificação de segmento anexada a feição do OSM aciona share-alike (Guideline *Horizontal Map Layers*) | Define se o dump é opção A ou B (4.3) |
| Se nossa base é "Substancial" | Único dos quatro pontos com opinião contrária sustentável |
| Formato e escopo suficientes do dump para satisfazer 4.6 | Base completa ou arquivo de alterações |

---

## 8. O que precisa mudar no CÓDIGO para os documentos serem verdadeiros

**Esta é a seção mais importante do parecer.** Cada item abaixo é uma afirmação que os documentos fazem e que o produto, hoje, não cumpre. Publicar antes de construir converte a política em declaração falsa.

Verificações feitas na base em `C:\Users\carol\Downloads\Jr\prospectx_4\prospectx\`.

### 8.1 Bloqueantes — não publicar antes

| # | O documento afirma | Estado no código | O que construir |
|---|---|---|---|
| **C1** | Termos 9.1(e) e PUA 6.2(b): publicamos a camada derivada do OSM sob ODbL em URL pública | **Não existe** | Endpoint público com dump da camada derivada + aviso de licença. Ver escopo em 4.3 |
| **C2** | Privacidade §6: conta e perfil excluídos ou anonimizados após 30 dias; Conteúdo do Assinante excluído após o término; Termos 13.5 idem | **Não existe.** Nenhuma função de exclusão ou anonimização de conta foi encontrada nas migrations | RPC de exclusão/anonimização + rotina agendada + registro da execução |
| **C3** | Privacidade §8.1: o titular de Registro de Empresa pode pedir acesso, correção e exclusão por e-mail e nós atendemos | **Não existe.** Só há `prospeccao_optout` (migration 019), que é supressão de envio, não direito de titular | Fluxo de pedido de titular: registro, prazo, resposta, execução e log. Exclusão do registro **preservando** a entrada de supressão |
| **C4** | Privacidade §6: retenção por prazo definido para cada categoria | **Parcial.** `cache_buscas` tem `expira_em` e há um `delete from public.cache_buscas where expira_em < now()`, mas **não foi encontrado agendador** (`pg_cron` ausente). Registro expirado permanece armazenado até alguém chamar a função | Agendar o expurgo. Criar rotina equivalente para registros de empresa, logs e correspondência de suporte |
| **C5** | Privacidade §6: logs de acesso mantidos no mínimo 6 meses (Marco Civil, art. 15) e no máximo X | **Não há rotina de expurgo** | Política de retenção de log implementada, com teto |
| **C6** | Termos 8.3: o rodapé usa o endereço postal do assinante e informação incorreta é violação material | **Parcial.** A migration `023_endereco_postal.sql` existe | Tornar endereço postal **obrigatório e validado** antes do primeiro disparo, não opcional no perfil |
| **C7** | Termos 2.1 e 19.3: o assinante aceita os Termos, a PUA e a Privacidade; uso continuado após alteração é aceitação | **Não encontrado registro de aceite** | Gravar por assinante: documento, **versão**, data/hora e IP do aceite. Sem isso não há como provar a que versão ele aderiu — e "uso continuado é aceitação" fica sem lastro |

### 8.2 Alta prioridade — antes do primeiro pagamento internacional

| # | O documento afirma | O que construir |
|---|---|---|
| **C8** | Termos 7.2: avisamos por e-mail antes de cada renovação | Job de aviso prévio de renovação. É também exigência de várias leis de renovação automática nos EUA |
| **C9** | Termos 5.4 e 6.2: podemos exigir número fiscal e aplicar *reverse charge* | Coleta e validação de VAT ID / ABN / EIN no checkout. **Já era requisito fiscal** do `ESTRUTURA-TRIBUTARIA.md` |
| **C10** | Anexo A.8: aviso de 30 dias antes de trocar subprocessador | Página pública de subprocessadores + lista de notificação |
| **C11** | PUA 8.2: monitoramos reclamação, rejeição e armadilha **por assinante** e agimos sobre o limiar | Métricas por assinante a partir dos webhooks do Resend + ação automática de throttle/pausa |
| **C12** | PUA 8.3: limite de follow-ups e intervalo mínimo | Trava no servidor. Escrever na política sem implementar é pior do que não escrever |
| **C13** | ODbL 4.2: atribuição acompanha o dado | Incluir "© OpenStreetMap contributors" em **toda exportação** (CSV, PDF, e-mail), não só na tela |
| **C14** | Termos 13.5: "exporte seus dados antes de cancelar" e disponibilizamos cópia por 30 dias | Exportação completa do Conteúdo do Assinante — serve também à portabilidade (LGPD art. 18, V; UK GDPR art. 20) |
| **C15** | PUA 2.4 e doc de risco: WhatsApp segue o mesmo regime do e-mail | Aviso na interface ao exibir telefone de destinatário em país de regime opt-in. Hoje o produto entrega o telefone sem alerta |
| **C16** | Privacidade §7: MFA nos provedores; acesso a produção restrito | Habilitar MFA em Supabase, Vercel, Resend, Stripe e Mercado Pago. Documentar quem tem acesso |

### 8.3 Média prioridade

| # | Item |
|---|---|
| **C17** | Página de arquivo de versões dos três documentos, com histórico |
| **C18** | Cookies: se entrar analytics ou pixel, banner de opt-in prévio vira obrigatório no Reino Unido — e a frase "não usamos pixel" da Privacidade §9 vira falsa no mesmo dia |
| **C19** | `ESTRUTURA-TRIBUTARIA.md`: restringir busca de assinante internacional a cidades fora do Brasil, para sustentar a tese de exportação de serviço |
| **C20** | Confirmar região de hospedagem do Supabase e refletir na Privacidade §4 |
| **C21** | Anexo A.11 e Privacidade §7.1: procedimento de resposta a incidente, com prazos por autoridade (ANPD, ICO em 72h, OAIC) |

### 8.4 O que já está certo e não deve ser mexido

Registro explícito, para que nenhuma refatoração futura desfaça sem perceber:

- **Trava por país no servidor** (`supabase/functions/enviar-email-lote/regimes.ts`), com **país não mapeado recusado por padrão**. O comentário no código está correto: `?? { regime: "optout" }` seria o erro clássico. **É o ativo jurídico central do produto.**
- **Rodapé CAN-SPAM inserido no servidor**, com identificação, rótulo de publicidade e endereço postal, não removível pelo assinante.
- **Descadastro com assinatura HMAC**, funcional sem login, com lista de supressão global.
- **Lista de supressão não legível por assinante** (migration 019) — a plataforma responde apenas sim/não.
- **Atribuição do OpenStreetMap na tela de resultados.**
- **Segregação Google Places → OpenStreetMap**, que eliminou a violação de termos apontada no doc de risco.

A tabela `regimes.ts` e a Cláusula 5 da PUA **precisam ser mantidas em sincronia**. Se alguém liberar um país no código sem atualizar a PUA, o documento vira falso; se liberar na PUA sem mudar o código, o assinante compra promessa que o servidor recusa.

---

## 9. Ordem recomendada de publicação

| Fase | Ação |
|---|---|
| **0** | Preencher os campos de identificação da empresa (6.1) e os endereços de contato (6.2). Sem isso nada mais importa |
| **1** | Construir **C1** (dump ODbL) — é o único bloqueante que não é sobre dado pessoal, e o de maior severidade |
| **2** | Construir **C2**, **C3**, **C4**, **C5** — exclusão, direitos do titular e retenção. São o que torna a Política de Privacidade verdadeira |
| **3** | Construir **C6** e **C7** — endereço postal obrigatório e registro de aceite com versão |
| **4** | Consultas: advogado inglês (7.2, sobretudo o representante do art. 27) e advogado americano (7.1, registro de data broker). São os dois com prazo correndo |
| **5** | Publicar os três documentos, na ordem **PUA → Termos → Privacidade** (a ordem já recomendada no doc de risco), com o mesmo número de versão e a mesma data |
| **6** | Só então abrir o checkout internacional |
| **7** | Advogado australiano (7.3) antes de desbloquear a Austrália. Advogado de open data (7.5) para decidir o escopo definitivo do dump |

**Não recomendo publicar os documentos antes da fase 3.** Publicar uma política de privacidade que promete exclusão que o sistema não sabe executar cria, sozinha, o ilícito que a política pretendia evitar — e entrega ao regulador a prova pronta.

---

## 10. Handoffs

| Para | O que precisa saber |
|---|---|
| `arquiteto-software` | **C1** (endpoint ODbL) tem impacto arquitetural: separar fisicamente a camada derivada do OSM da Camada ProspectX facilita o dump e sustenta melhor o argumento de camadas. **C4** exige agendador (`pg_cron` ou equivalente) |
| `engenheiro-backend` | Todos os itens C1 a C21, com prioridade em C1 a C7 |
| `especialista-privacidade` | Revisar a matriz de base legal (Privacidade §1.4), o LIA e o DPIA pendentes do doc de risco, e o item 6.7 (encarregado vs canal) |
| `especialista-deliverability` | Definir os limiares numéricos da PUA 8.2 (item 55) e implementar C11 |
| `especialista-seguranca` | C16 (MFA e acesso a produção), item 46 a 48 da Privacidade §7 |
| `copywriter-conversao` e `prospectx-growth` | Cláusulas 4.2, 4.3 e 14.3 dos Termos definem o que **não** pode ser prometido. Somar ao vocabulário proibido do doc de risco. A PUA 5.2 define o que se pode dizer sobre disparo em UK e AU — hoje: **nada de disparo** |
| `analista-precificacao` e `cfo-planejador` | Item 21 (preço com ou sem imposto) continua aberto desde `ESTRUTURA-TRIBUTARIA.md`. A Cláusula 7.5 (reembolso de 7 dias) e a 6.4 (créditos acumulam) têm efeito no modelo de receita |
| `prospectx-produto` | C15 (aviso de WhatsApp), C19 (restringir busca internacional a cidades fora do Brasil) e a decisão de escopo do dump ODbL (4.3) são decisões de produto, não de engenharia |
| `revisor-qualidade` | Checklist final: zero `[PREENCHER]`; três documentos publicados e linkados no rodapé e no checkout; consentimento **não** pré-marcado; base legal declarada; atribuição OSM em tela **e** em exportação; `regimes.ts` sincronizado com a PUA 5.2 |

---

## 11. O que este parecer não é

- **Não é aconselhamento jurídico definitivo.** É análise preliminar de departamento jurídico interno, com base em fontes oficiais consultadas em 15/08/2026.
- **Não substitui advogado habilitado** nos Estados Unidos, no Reino Unido, na Austrália nem no Brasil. A Cláusula 7 lista, item a item, o que exige cada um.
- **Não valida o enquadramento tributário.** Isso está no `ESTRUTURA-TRIBUTARIA.md` e é matéria de contador e tributarista.
- **Não é auditoria de código.** As verificações do item 8 foram feitas por leitura das migrations e das Edge Functions; ausência de resultado em busca não é prova definitiva de ausência de funcionalidade. Cada item marcado como "não existe" deve ser confirmado pela engenharia antes de virar tarefa.
- **Não afirma que a publicação destes documentos torna a operação conforme.** Documento publicado é condição necessária e insuficiente. O que torna conforme é o produto fazer o que o documento diz.

---

**Fontes oficiais consultadas em 15/08/2026:** planalto.gov.br (CPC/Lei 13.105/2015 e Lei 14.879/2024; LGPD/Lei 13.709/2018; CDC/Lei 8.078/1990; Marco Civil/Lei 12.965/2014; CTN); gov.br/anpd (Resolução CD/ANPD nº 2/2022; Resolução CD/ANPD nº 19/2024); legislation.gov.uk (UCTA 1977; Misrepresentation Act 1967; UK GDPR; PECR); ico.org.uk (orientação sobre PECR reg. 22, representante do art. 27 e direitos do titular); legislation.gov.au e acma.gov.au (Spam Act 2003 (Cth); Privacy Act 1988 (Cth)); accc.gov.au e asic.gov.au (Australian Consumer Law; regime de cláusulas abusivas); ftc.gov (CAN-SPAM Act); opendatacommons.org (ODbL v1.0); osmfoundation.org (Community Guidelines *Horizontal Map Layers*, *Collective Database*, *Substantial*, *Regional Cuts*).
