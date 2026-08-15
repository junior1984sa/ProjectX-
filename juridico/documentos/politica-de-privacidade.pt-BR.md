# ProspectX — Política de Privacidade

**Controlador / Fornecedor:** `[PREENCHER: razão social completa]`, CNPJ `[PREENCHER: CNPJ]`, `[PREENCHER: endereço completo com CEP]`
**Contato de privacidade:** `[PREENCHER: e-mail de privacidade]`
**Encarregado pelo Tratamento de Dados Pessoais (LGPD, art. 41):** `[PREENCHER: nome e contato do encarregado]`
**Representante no Reino Unido / União Europeia:** `[PREENCHER: nome e endereço do representante do art. 27 do UK GDPR, se nomeado — ver PARECER]`

**Vigência a partir de:** `[PREENCHER: data de publicação]`
**Versão:** 1.0
**Data de referência da pesquisa normativa:** 15/08/2026

---

## 0. O que precisa ser entendido primeiro: nós usamos dois chapéus

A ProspectX trata dado pessoal em **dois papéis inteiramente distintos**, e seus direitos mudam conforme o papel que se aplica a você.

| | **Parte 1 — Somos CONTROLADORES** | **Parte 2 — Somos OPERADORES** |
|---|---|---|
| Dados de quem | Dados de contato de empresas que nós mesmos coletamos de fontes públicas; e dados cadastrais dos nossos assinantes | Dados que o assinante insere, carrega e gerencia dentro da conta dele |
| Quem decide a finalidade | Nós | O assinante |
| A quem você pede seus direitos | A nós, diretamente | Ao assinante (nós encaminhamos e cobramos a resposta) |

Se você recebeu um e-mail enviado pelo ProspectX e quer saber por quê, ou quer ser removido, **a Parte 1 se aplica a você** e você pode agir agora — veja a seção 8.1.

---

# PARTE 1 — Onde a ProspectX é controladora

## 1. Dados de contato de empresas coletados de fontes públicas

### 1.1 O que coletamos

| Categoria | Campos | Fonte |
|---|---|---|
| Identificação da empresa | Nome fantasia, categoria/segmento, endereço, cidade, região, país, coordenadas | OpenStreetMap (APIs Nominatim e Overpass) |
| Contato empresarial | Telefone comercial publicado, e-mail comercial publicado, site | Etiquetas do OpenStreetMap |
| Derivados | Classificação de segmento, chave de deduplicação, pontuação de correspondência, relevância de busca | Gerados por nós a partir do acima |

Não coletamos dessas fontes: e-mail pessoal, endereço residencial, celular pessoal, nome de empregado individual, dado financeiro nem qualquer dado sensível.

### 1.2 Isso é dado pessoal?

Muitas vezes sim. Um endereço comercial do tipo `contato@nomedapessoa.com`, ou os dados de um empresário individual, identificam uma pessoa natural. **Tratamos todo registro de contato empresarial como dado pessoal por padrão**, em vez de presumir que não é.

### 1.3 De onde vem o dado — atribuição

Os dados de localização de empresas derivam do **OpenStreetMap**, © **OpenStreetMap contributors**, sob a **Open Database License (ODbL) v1.0**. O OpenStreetMap é uma base pública, editada de forma colaborativa. **Os registros são criados e editados por voluntários. Nem nós nem a OpenStreetMap Foundation os verificamos, e nenhum dos dois é fonte de consentimento para ser contatado.**

### 1.4 Finalidades e bases legais

| Finalidade | Base legal — Brasil (LGPD) | Base legal — Reino Unido | Base legal — Austrália | Base legal — Estados Unidos |
|---|---|---|---|---|
| Montar e manter um índice pesquisável de empresas | Legítimo interesse, art. 7º, IX, com o teste de balanceamento do art. 10 | Legítimo interesse, UK GDPR art. 6(1)(f) | APP 3 — coleta razoavelmente necessária às nossas funções, a partir de publicação geralmente disponível | Leis estaduais de privacidade, onde os limiares forem atingidos; informação publicamente disponível costuma ficar fora do escopo, mas isso se avalia estado a estado |
| Entregar resultados de busca ao assinante pagante | Legítimo interesse, art. 7º, IX | Legítimo interesse, art. 6(1)(f) | APP 6 — uso para a finalidade primária da coleta | Idem |
| Enviar a primeira abordagem comercial por conta do assinante | Legítimo interesse, art. 7º, IX, **somente quando cumpridas as quatro condições do item 1.5** | **Não invocado para individual subscribers.** Veja 1.6 | Veja 1.6 | O CAN-SPAM regula o conteúdo da mensagem, não a base legal da coleta. Veja 1.6 |
| Operar a lista global de descadastro | Cumprimento de obrigação legal e exercício regular de direitos, art. 7º, II e VI; conservação pelo art. 16, I e IV | Obrigação legal e legítimo interesse | APP 6 — exigido para honrar opt-out sob o Spam Act 2003 | Exigido pelo CAN-SPAM |
| Guardar registro de quem foi contatado, quando e por quem | Exercício regular de direitos em processo, art. 7º, VI | Legítimo interesse — prova de conformidade | Idem | Idem |
| Prevenção a fraude e segurança da plataforma | Legítimo interesse, art. 7º, IX | Legítimo interesse | APP 6 | — |

### 1.5 As quatro condições do envio

Só permitimos a primeira abordagem comercial pelo Serviço quando **as quatro** forem verdadeiras:
1. o endereço é **corporativo**, não pessoal;
2. a mensagem é **pertinente ao ramo declarado do destinatário**;
3. o remetente está **clara e verdadeiramente identificado**, com endereço postal físico;
4. há **descadastro funcionando em um clique** em toda mensagem.

As condições 3 e 4 são impostas pela plataforma: o rodapé é acrescentado no servidor e não pode ser removido pelo assinante.

### 1.6 Onde não invocamos legítimo interesse

**Reino Unido.** O Privacy and Electronic Communications (EC Directive) Regulations 2003 ("PECR"), regulation 22, distingue "corporate subscriber" de "individual subscriber". A posição publicada do ICO é que **sole traders e ordinary partnerships são individual subscribers**, e o marketing eletrônico não solicitado a eles exige consentimento prévio ou soft opt-in fundado em venda anterior. **Uma análise de legítimo interesse não substitui esse consentimento.** O PECR também trata mensageria instantânea como "electronic mail", de modo que a mesma regra alcança o WhatsApp; enviar manualmente, um a um, não é defesa.

**Austrália.** O Spam Act 2003 (Cth) exige consentimento — expresso ou inferido — para mensagem eletrônica comercial. **O consentimento não pode ser inferido de um registro do OpenStreetMap**, porque o registro pode ter sido criado por terceiro e não representa publicação feita pela própria empresa.

Por isso o Serviço aplica as restrições de destino descritas na Política de Uso Aceitável, e o assinante precisa confirmar a base legal antes de enviar. `[PREENCHER: confirmar o estado atual dos bloqueios por destino no produto antes de publicar — ver PARECER]`

### 1.7 Por que não avisamos cada empresa individualmente

O art. 14(5)(b) do UK GDPR dispensa a informação ao titular, quando o dado foi obtido indiretamente, se isso exigir esforço desproporcional, desde que adotadas medidas adequadas — inclusive tornar a informação publicamente disponível. **Esta política é essa medida.** Além disso, toda mensagem enviada pelo Serviço diz ao destinatário por que ele a recebeu e como parar de recebê-la, o que cumpre a substância do dever no momento do contato. Raciocínio equivalente se aplica ao art. 9º da LGPD.

### 1.8 Nós não vendemos esse dado

Não vendemos, alugamos nem licenciamos registros de contato empresarial como produto de dados avulso. O assinante paga pelo acesso ao Serviço. `[PREENCHER: se o produto um dia oferecer exportação em massa ou feed de dados como item separado, esta frase precisa ser revista — o conceito de "sale" em algumas leis estaduais americanas é mais amplo que pagamento por lista]`

---

## 2. Dados cadastrais do assinante

### 2.1 O que coletamos

| Categoria | Dado | Base legal (LGPD / UK GDPR) |
|---|---|---|
| Cadastro | Nome da empresa, nome do contato, e-mail comercial, WhatsApp/telefone, cidade, estado, país, segmento, descrição, site | Execução de contrato — art. 7º, V / art. 6(1)(b) |
| Autenticação | E-mail, senha em hash ou identidade federada, tokens de sessão | Contrato |
| Cobrança | Plano, moeda, identificadores de transação, histórico de faturas, número fiscal | Contrato e cumprimento de obrigação tributária e contábil — art. 7º, II / art. 6(1)(c) |
| Uso | Buscas feitas, créditos consumidos, atividade no funil, mensagens enviadas, horários, uso de funcionalidades | Legítimo interesse — operação do serviço, exatidão da cobrança, prevenção a abuso |
| Registros técnicos | Endereço IP, user agent, registros de acesso a aplicação | Legítimo interesse e, no Brasil, obrigação do art. 15 do Marco Civil da Internet (Lei nº 12.965/2014) de guardar registros de acesso a aplicações por seis meses |
| Arquivos enviados | Portfólio, propostas, panfletos | Contrato |
| Suporte | E-mails e chamados que você nos envia | Contrato e legítimo interesse |

### 2.2 Dados de cartão

**Nunca vemos nem armazenamos o número completo do seu cartão.** O pagamento é processado por Stripe e Mercado Pago, que atuam como controladores independentes da transação de pagamento e como nossos operadores quanto ao registro da assinatura. Recebemos apenas o resultado da transação, os dígitos finais e a bandeira.

### 2.3 Perfil público

Se você optar por aparecer no diretório público de prestadores, os campos do perfil que você marcar como públicos ficam visíveis a qualquer pessoa. É uma escolha sua e pode ser desligada no Serviço.

---

# PARTE 2 — Onde a ProspectX é operadora

## 3. Dados sob controle do assinante

Quando o assinante usa o funil, escreve anotações, carrega uma lista de contatos, edita um modelo de mensagem ou registra o desfecho de uma ligação, **é o assinante quem decide o que é coletado e por quê. Nós apenas hospedamos e tratamos sob instrução dele.**

- **Controlador:** o assinante.
- **Operador:** a ProspectX.
- **Contrato:** o Anexo A dos Termos de Uso, que é nosso acordo de tratamento nos termos do art. 39 da LGPD e do art. 28 do UK GDPR.
- **Nossos compromissos:** tratamos apenas conforme instrução documentada; não usamos esse conteúdo para finalidade própria; não o vendemos; **não o usamos para treinar modelos de aprendizado de máquina nossos**.

Se você é uma pessoa cujos dados aparecem dentro da conta de um assinante e quer correção ou exclusão, procure aquele assinante. Se você não sabe quem é, escreva para `[PREENCHER: e-mail de privacidade]` — identificaremos o assinante, encaminharemos o pedido e cobraremos a resposta. Agiremos diretamente se ele não responder.

---

# PARTE 3 — Comum aos dois papéis

## 4. Suboperadores e transferência internacional

Estamos estabelecidos no Brasil. **Todo dado tratado pelo Serviço é transferido internacionalmente.** Os fornecedores abaixo estão fora do Brasil, salvo onde indicado.

| Fornecedor | Função | Dado alcançado | Local principal de tratamento |
|---|---|---|---|
| **Supabase Inc.** | Banco de dados, autenticação, armazenamento de arquivos, edge functions | Todos os dados cadastrais, registros de empresas, conteúdo do assinante, logs | `[PREENCHER: região de hospedagem configurada no projeto Supabase — conferir no painel]` |
| **Vercel Inc.** | Hospedagem web, CDN, rede de borda | Requisições HTTP, endereços IP, user agents | Estados Unidos e nós de borda globais |
| **Resend (Plus Five Five, Inc.)** | Entrega de e-mail transacional e em lote | E-mail comercial do destinatário, identificação do remetente, conteúdo da mensagem, eventos de entrega | Estados Unidos |
| **Stripe, Inc.** | Pagamentos internacionais | Nome, e-mail de cobrança, endereço de cobrança, número fiscal, dados de cartão (direto ao Stripe) | Estados Unidos, Irlanda |
| **Mercado Pago** (grupo Mercado Libre) | Pagamentos no Brasil e América Latina | Nome, CPF/CNPJ, e-mail de cobrança, dados de pagamento | Brasil, Argentina |
| **Anthropic, PBC** | Assistente de IA para redação | Nome, segmento e cidade da empresa prospectada; empresa, segmento, cidade e nome de contato do próprio assinante; tom e canal escolhidos | Estados Unidos |
| **OpenStreetMap Foundation** (Nominatim) e **operador da Overpass API** | Fonte pública de dados para a busca | Apenas a consulta: segmento, cidade, região, país, raio. **O IP do usuário final não é repassado** — a consulta é intermediada pelo nosso servidor. | Reino Unido / Alemanha e espelhos |
| `[PREENCHER: provedor de analytics ou monitoramento de erro, se houver — ex. Sentry, PostHog, Plausible; apagar esta linha se não houver]` | | | |

A lista atualizada fica em `[PREENCHER: URL da página de suboperadores]`.

### 4.1 Mecanismos de transferência

- **A partir do Brasil.** As transferências se apoiam nos mecanismos do art. 33 da LGPD. Quando forem usadas cláusulas contratuais, adotamos as cláusulas-padrão contratuais aprovadas pela ANPD na **Resolução CD/ANPD nº 19, de 23 de agosto de 2024** (fonte: gov.br/anpd, consultado em 15/08/2026). `[PREENCHER: confirmar que as cláusulas-padrão da ANPD foram firmadas com cada fornecedor, ou que o DPA próprio do fornecedor foi avaliado como equivalente — ver PARECER]`
- **A partir do Reino Unido.** Quando o assinante for controlador no Reino Unido, as transferências se apoiam no International Data Transfer Agreement ou no UK Addendum às cláusulas-padrão da UE, com avaliação de risco de transferência.
- **A partir da Austrália.** O APP 8 exige medidas razoáveis para assegurar que o destinatário no exterior não viole os APPs. Apoiamo-nos nos compromissos escritos dos termos de tratamento de cada fornecedor.

### 4.2 O que nunca fazemos

Não divulgamos dado pessoal a redes de publicidade nem a data brokers. Só divulgamos a autoridade pública mediante ordem legal válida, e avisaremos a pessoa afetada salvo se legalmente proibidos.

---

## 5. Anthropic e o assistente de IA — declaração específica

5.1 O assistente envia à API da Anthropic: nome, segmento e cidade da empresa prospectada; nome da empresa, segmento, cidade e nome de contato do assinante; e o tom e canal escolhidos. **Não** envia o e-mail nem o telefone do destinatário, a senha do assinante, dados de cobrança, anotações do funil ou arquivos carregados.

5.2 A Anthropic atua como nossa operadora nessa requisição.

5.3 `[PREENCHER: confirmar contra os Commercial Terms of Service da Anthropic e a configuração de retenção vigente na data de publicação e então declarar aqui: (a) que entradas e saídas não são usadas para treinar modelos, e (b) o prazo de retenção da API. Não publicar esta seção sem essa confirmação.]`

5.4 O assistente é opcional. Se estiver indisponível ou desativado, o Serviço usa um modelo local, sem qualquer tratamento por IA de terceiro.

---

## 6. Retenção

| Dado | Prazo | Por quê |
|---|---|---|
| Cadastro e perfil do assinante | Enquanto a conta estiver ativa, depois **30 dias** para reativação, depois excluído ou anonimizado | Contrato |
| Registros de cobrança e faturas | **5 anos** do encerramento do exercício | Prazos de decadência e prescrição tributária e contábil (CTN, arts. 173 e 174) |
| Registros de acesso a aplicação (IP, horário) | **Mínimo de 6 meses**, depois excluídos, no máximo até `[PREENCHER: teto, ex. 12 meses]` | O art. 15 do Marco Civil da Internet (Lei nº 12.965/2014) impõe o mínimo de seis meses |
| Registros de contato de empresas derivados do OpenStreetMap | `[PREENCHER: escolher prazo que o código consiga cumprir — recomendado 12 meses da coleta, depois rederivado da fonte ou excluído]` | Exatidão. Registro velho é falha de qualidade de dado e falha de proteção de dados ao mesmo tempo |
| Cache de resultados de busca | 30 dias (1 dia quando o resultado é vazio) | Reduz carga sobre APIs públicas; corresponde à implementação atual |
| Registros de prospecção (quem foi contatado, quando, por quem) | **5 anos** do último contato | Prova de conformidade em caso de reclamação ou fiscalização — LGPD art. 7º, VI e art. 16, IV |
| **Lista global de descadastro** | **Por prazo indeterminado** | Precisamos guardar para sempre, justamente para nunca mais contatar aquele endereço. Apagar frustraria o próprio pedido. Guardamos apenas o endereço e a data, e nunca usamos para outra finalidade |
| Conteúdo do assinante (funil, anotações, contatos carregados, arquivos) | Enquanto a conta estiver ativa; excluído ou anonimizado em até `[PREENCHER: ex. 30 dias]` do término | Instrução do assinante, que é o controlador |
| Correspondência de suporte | `[PREENCHER: ex. 24 meses]` | Qualidade do serviço e defesa em demandas |

**Pedido de exclusão não remove você da lista de descadastro.** Se removesse, voltaríamos a contatar você. Se quiser sair também da lista de supressão, é preciso pedir isso separadamente e de forma expressa.

---

## 7. Segurança

- Criptografia em trânsito (TLS) e criptografia em repouso pelos nossos provedores de infraestrutura.
- Row-level security no banco, de modo que o assinante só lê os próprios registros.
- A lista de descadastro **não é legível por nenhum assinante** — a plataforma só responde "este endereço pode ser contatado, sim ou não".
- Links de descadastro assinados com HMAC, de modo que ninguém consiga descadastrar o endereço de terceiro nem varrer a base.
- Verificação de autenticação no próprio código das funções de envio e de IA, independente do gateway da plataforma.
- Acesso a dado de produção restrito a `[PREENCHER: quantidade e função das pessoas com acesso a produção]`.
- `[PREENCHER: declarar se os backups são criptografados, onde ficam e por quanto tempo]`
- `[PREENCHER: declarar se a autenticação de dois fatores está habilitada nas contas Supabase, Vercel, Resend, Stripe e Mercado Pago — se não estiver, habilitar antes de publicar esta política]`

Nenhum sistema é perfeitamente seguro. Não prometemos que um incidente jamais ocorrerá; prometemos ter controles, detectar e avisar.

## 7.1 Incidentes

Ocorrendo incidente de segurança que possa acarretar risco ou dano relevante:
- comunicaremos a ANPD e os titulares afetados, na forma do art. 48 da LGPD;
- comunicaremos o ICO em até 72 horas quando incidirem os arts. 33 e 34 do UK GDPR;
- avaliaremos a incidência do Notifiable Data Breaches scheme do Privacy Act 1988 (Cth) e, se aplicável, comunicaremos o OAIC e os indivíduos afetados;
- comunicaremos os assinantes afetados sem demora injustificada e os auxiliaremos em suas próprias obrigações.

---

## 8. Seus direitos

### 8.1 Se você recebeu um e-mail enviado pelo ProspectX

Você pode agir agora, sem conta e sem nos dar nenhuma informação adicional:

| O que você quer | Como |
|---|---|
| **Parar de receber mensagens** | Clique em "Não quero mais receber" no rodapé do e-mail. Funciona em um clique, sem login e sem formulário. A remoção é **global**: nenhum assinante do ProspectX poderá contatar aquele endereço de novo |
| **Saber o que temos sobre você** | Escreva para `[PREENCHER: e-mail de privacidade]` |
| **Corrigir** | Escreva para nós, ou edite o registro direto em openstreetmap.org, que é a fonte original |
| **Excluir** | Escreva para nós. Excluiremos o registro e manteremos apenas a entrada de supressão |
| **Opor-se ao tratamento** | Escreva para nós. Quando a base é legítimo interesse, a oposição a marketing direto é absoluta: nós paramos |
| **Reclamar** | A nós primeiro, depois à autoridade indicada em 8.4 |

Respondemos em **`[PREENCHER: ex. 15 dias]`**, e sempre dentro do menor prazo aplicável a você: 15 dias pelo art. 19 da LGPD para confirmação de tratamento, um mês pelo art. 12(3) do UK GDPR, 45 dias na maioria das leis estaduais americanas, 30 dias pelo APP 12 na Austrália.

### 8.2 Se você é assinante

Acesso, correção, exportação, portabilidade, exclusão, oposição e revogação de consentimento, exercidos no Serviço ou por escrito para `[PREENCHER: e-mail de privacidade]`.

### 8.3 Direitos por jurisdição

| Direito | Brasil (LGPD art. 18) | Reino Unido (UK GDPR) | Austrália (Privacy Act 1988) | Estados Unidos (leis estaduais) |
|---|---|---|---|---|
| Confirmação da existência de tratamento | Sim | Sim | Sim | Sim |
| Acesso | Sim | Art. 15 | APP 12 | Sim |
| Correção | Sim | Art. 16 | APP 13 | Sim |
| Exclusão | Sim, art. 18, VI, com os limites do art. 16 | Art. 17 | Não há direito autônomo geral; na prática, via destruição do APP 11.2 | Sim, nos estados que preveem |
| Portabilidade | Sim | Art. 20 | Não há direito geral | Em alguns estados |
| Oposição / opt-out de marketing direto | Sim, art. 18, § 2º | Art. 21 — absoluto para marketing direto | Spam Act 2003, descadastro obrigatório | CAN-SPAM, opt-out obrigatório |
| Opt-out de "venda" ou "compartilhamento" | — | — | — | Sim, na Califórnia, Colorado, Connecticut, Virgínia e outros |
| Informação sobre compartilhamento | Sim, art. 18, VII | Arts. 13 a 15 | APP 1 e APP 5 | Sim |
| Revisão humana de decisão automatizada | Art. 20 | Art. 22 | — | Em alguns estados |

**Não tomamos decisão automatizada que produza efeito jurídico ou efeito significativo equivalente sobre qualquer pessoa.** O assistente de IA apenas redige texto; um ser humano decide se envia.

### 8.4 Onde reclamar

| Jurisdição | Autoridade |
|---|---|
| Brasil | ANPD — Autoridade Nacional de Proteção de Dados — gov.br/anpd |
| Reino Unido | ICO — Information Commissioner's Office — ico.org.uk |
| Austrália | OAIC — Office of the Australian Information Commissioner — oaic.gov.au |
| Estados Unidos | O Attorney General do seu estado e a FTC — ftc.gov |

---

## 9. Cookies e tecnologias similares

Usamos `[PREENCHER: confirmar a lista exata antes de publicar]`:
- **Estritamente necessários:** sessão de autenticação, segurança, balanceamento de carga e armazenamento local das suas preferências de interface (idioma, país, filtros). Não exigem consentimento pela regulation 6(4) do PECR.
- **Analytics ou marketing:** `[PREENCHER: se não houver nenhum, escrever "não usamos nenhum". Se algum for acrescentado, passa a ser obrigatório banner de consentimento com opt-in prévio no Reino Unido — ver PARECER]`

Não usamos cookies de publicidade nem pixels de rastreamento entre sites. `[PREENCHER: confirmar — esta frase se torna falsa no dia em que um pixel da Meta ou do Google Ads for colocado na landing page]`

---

## 10. Crianças e adolescentes

O Serviço não se destina a, e não pode ser usado por, menores de 18 anos. Não coletamos conscientemente dado de criança ou adolescente. Se você acredita que coletamos, escreva para `[PREENCHER: e-mail de privacidade]` e excluiremos.

---

## 11. Perfilamento automatizado de empresas

Classificamos empresas por segmento e pontuamos a relevância delas para uma busca. Isso é perfilamento de **organização**, não de pessoa natural, e produz uma ordenação de resultados, não uma decisão sobre alguém. Quando um registro identifica um empresário individual, o efeito continua sendo apenas a posição daquele registro em uma lista de resultados.

---

## 12. Alterações desta política

Publicaremos cada nova versão com nova data e número de versão, e manteremos as anteriores em `[PREENCHER: URL do arquivo de versões]`. Para alterações materiais no uso de dado pessoal, avisaremos os assinantes por e-mail com pelo menos `[PREENCHER: ex. 30 dias]` de antecedência.

---

## 13. Contato

| Assunto | Endereço |
|---|---|
| Privacidade e direitos do titular | `[PREENCHER: e-mail de privacidade]` |
| Encarregado (DPO) | `[PREENCHER: nome e contato do encarregado]` |
| Incidentes de segurança | `[PREENCHER: e-mail de segurança]` |
| Postal | `[PREENCHER: endereço completo com CEP]` |

---

*Os dados de localização de empresas neste Serviço derivam em parte do OpenStreetMap. © OpenStreetMap contributors, disponíveis sob a Open Database License (ODbL) v1.0.*

**Fontes consultadas para as referências normativas desta política, em 15/08/2026:** planalto.gov.br (LGPD, Marco Civil, CTN, CDC); gov.br/anpd (Resolução CD/ANPD nº 19/2024); legislation.gov.uk e ico.org.uk (UK GDPR, DPA 2018, PECR); legislation.gov.au e oaic.gov.au (Privacy Act 1988, APPs, Spam Act 2003); ftc.gov (CAN-SPAM).
