# O que falta para o site rodar — lista prioritária

**Data:** 23 de agosto de 2026
**Método:** auditoria do que está NO AR, não do que está no repositório. Cada item foi verificado.

---

## ✅ Resolvido em 23/08/2026

Auditoria feita, e os itens de produção consertados no mesmo dia:

| Item | O que era | Estado |
|---|---|---|
| **Google Places ativo** | função consultando a API proibida, versão 10 | ✅ **neutralizada** — corpo substituído, não chama o Google, devolve 410 e exige JWT. Verificado: 401 sem token |
| **Disparo sem trava por país** | versão publicada era a antiga, com `p_pais` fixo em BR | ✅ **publicada a versão 8** com trava, rodapé CAN-SPAM e endereço postal. Verificado: 401 sem token e com token inválido |
| **Funções sensíveis abertas** | `expurgo_retencao` apagava dados e era alcançável por anônimo | ✅ **corrigido** — a causa era `revoke from anon` em vez de `from public`. Verificado nas ACLs |
| **Função de IA com o defeito do relay** | mandava publicar com `--no-verify-jwt` e gasta a chave da Anthropic | ✅ **guarda instalada na origem.** Não publicada: o caminho de IA é código morto hoje |
| **Licença não declarada** | `package.json` sem `license` nem `private` | ✅ declarado |
| **13 commits não enviados** | nada do trabalho recente estava no ar | ✅ **enviados** — 16 commits publicados |

**O que a auditoria mostrou estar CERTO e não devia ser mexido:** o webhook do Mercado Pago não confia no payload — pega só o ID e busca o pagamento real na API deles, então notificação forjada não ativa assinatura. E quatro das cinco funções que gastam dinheiro já verificam o usuário dentro do código.

**Endurecimento pendente:** `criar-assinatura-mp` e `cancelar-assinatura` dependem só do `verify_jwt`. Não é buraco aberto — é a mesma classe de risco que já nos custou caro uma vez.

---

## O resumo em três frases

O código está muito à frente do que está publicado: **13 commits não foram enviados**, então nada do trabalho recente está no ar — nem o nome novo, nem a trava por país, nem a redução de países.

Duas coisas estão **ativamente erradas em produção agora**: uma função que usa a API do Google Places continua ligada, e o disparo de e-mail publicado não tem a trava por país.

E o produto, testado ao vivo, **não faz o que promete**: buscar "construtora" em São Paulo devolve 2 empresas, nenhuma com telefone.

---

## P0 — Errado agora, em produção

Estes não bloqueiam o lançamento: eles são risco enquanto existirem.

### 1. `buscar-empresas-google` continua no ar

Removi a função do repositório, mas **ela continua ACTIVE no Supabase**, versão 10. É um endpoint vivo consultando a API do Google Places, cujos termos proíbem armazenar nome, endereço e telefone de estabelecimento — que é o que o produto faz com o resultado.

**O que fazer:** apagar a função publicada e remover o segredo `GOOGLE_PLACES_API_KEY`.
**Custo:** dois comandos.

### 2. O disparo de e-mail publicado não tem a trava por país

Verifiquei o código-fonte da versão publicada: é a versão antiga. Sem `regimes.ts`, sem verificação de país, com `p_pais: "BR"` fixo. **Toda a conformidade que construímos existe só no repositório.**

Hoje isso não causa dano porque não há assinante disparando. Passa a causar no primeiro.

**O que fazer:** publicar `enviar-email-lote` junto com `regimes.ts`.

### 3. Funções sensíveis executáveis por qualquer um

O analisador do Supabase aponta que `expurgo_retencao()`, `excluir_minha_conta()` e `consumir_creditos()` podem ser chamadas pelo papel `anon`. A causa é conhecida: o Postgres concede `EXECUTE` a `PUBLIC` por padrão, e o meu `revoke ... from anon` não remove essa concessão — precisa ser `revoke ... from public`.

O dano real hoje é limitado (as funções checam `auth.uid()` e falham), mas `expurgo_retencao` **apaga dados** e não deveria estar ao alcance de ninguém.

**O que fazer:** uma migration com os `revoke` corretos.

### 4. Proteção contra senha vazada desligada

O Supabase pode checar senhas contra bases de vazamento conhecidas. Está desligado.

**O que fazer:** ligar no painel. Um clique.

---

## P1 — Sem isto, o produto não funciona

### 5. A base não entrega empresas B2B — este é O problema

Teste ao vivo, feito hoje contra a função publicada:

| Busca | Empresas | Com telefone | Com e-mail |
|---|---|---|---|
| **construtora** · São Paulo | **2** | **0** | 1 |
| restaurante · São Paulo | 60 | 7 | 2 |
| construction · Manchester | 14 | 2 | 0 |

Duas construtoras numa cidade de 12 milhões de habitantes. O varejo funciona, o B2B não — que é exatamente o público do produto.

**Estado do conserto:** o pipeline do Companies House já está construído e a trava de identidade levou a precisão de 26% para 100%. Mas a taxa de contato ficou em 10%, contra a meta de 25%.

**O que falta:** medir o índice reverso do Common Crawl (gratuito) e, se não bastar, o SerpApi (US$ 10 o milhar). E ligar o pipeline ao produto — hoje ele roda separado, em `pipeline/`.

**Sem isto resolvido, nada mais importa.** Um site bonito que devolve 2 empresas não vende.

### 6. Enviar os 13 commits

Nada do trabalho recente está publicado. O que está no ar ainda é ProspectX, com nove países e sem nenhuma das travas.

**O que fazer:** `git push`. Se a Vercel está ligada ao repositório, o site atualiza sozinho.

### 7. `inferir-segmentos-clientes` nunca foi publicada

Existe no repositório, não existe no Supabase. É a função que expande o ramo digitado nos segmentos que contratam aquele serviço — o coração do produto.

**Verificar:** se a busca hoje funciona sem ela, é porque o mapa local está sendo usado como alternativa. Precisa ser confirmado antes de publicar.

---

## P2 — Sem isto, não dá para vender

### 8. Não existe cobrança fora do Brasil

Estados Unidos e Reino Unido estão com `gateway: null`, e a tela mostra "pagamento em breve". Só o Mercado Pago está ligado, e ele é Brasil.

**O que fazer:** integrar o Stripe. É trabalho de backend real — não é configuração.

### 9. Domínio

Não existe. Sem ele não há e-mail profissional, não há remetente autenticado, e o relógio de aquecimento de reputação não começou — e ele leva de quatro a seis semanas que não aceleram.

**O que fazer:** comprar. É o item mais barato da lista e o único cujo atraso custa tempo que não volta.

### 10. Cobrança na entrega

Hoje o crédito é debitado na busca. Com 10% de acerto, isso é cobrar por 40 e entregar 4.

**O que fazer:** mover o débito para o momento da entrega do contato verificado.

### 11. Os 75 campos `[PREENCHER]` dos documentos jurídicos

Razão social, CNPJ, endereço, e-mail de contato, responsável. **Nenhum agente pode inventar isso.** Sem eles, Termos, Privacidade e Uso Aceitável não podem ser publicados — e sem os documentos não há venda.

### 12. E-mail de suporte

Está como `[PREENCHER]` na tela de ajuda, porque o endereço antigo apontava para um domínio que nunca foi nosso. Depende do item 9.

---

## P3 — Sem isto, não dá para vender no exterior

### 13. Advogado inglês e advogado americano

O inglês, sobretudo para o representante do artigo 27 do UK GDPR — que incide mesmo com o disparo bloqueado, porque indexar empresa britânica já é tratamento de dado. O americano, para o registro de data broker.

### 14. Contador, para VAT e GST

Definir se £ 77 é com ou sem imposto. Vale até 16,7% da receita no Reino Unido.

### 15. Coleta de número fiscal no checkout

VAT ID, EIN. É exigência fiscal e simplifica a apuração.

---

## Licenças — o levantamento

| O que | Situação | Ação |
|---|---|---|
| **Companies House** | Open Government Licence 3.0 — uso comercial livre, **sem** *share-alike*, exige atribuição na tela | ✅ pode usar |
| **OpenStreetMap** | ODbL — exige atribuição **e tem *share-alike*** que alcança nossa classificação de segmento | ⚠️ obriga publicar a camada derivada enquanto for a base. **Some sozinho quando o Companies House assumir** |
| **Google Places** | Proíbe armazenar nome, endereço e telefone | ❌ descartado — mas a função continua no ar (item 1) |
| **Brave Search API** | Proíbe armazenar resultados no plano padrão | ❌ descartada |
| **Google Custom Search** | Fechada a novos clientes, encerra em 01/01/2027 | ❌ descartada |
| **SerpApi** | Permite, com proteção legal declarada | ✅ opção paga |
| **Nominatim** (geocodificação) | Uso aceitável exige limite de requisições e identificação | ⚠️ conferir se respeitamos o limite |
| **Dependências npm** | 30 de produção, 15 de desenvolvimento | ⚠️ nunca auditadas — vale rodar uma verificação de licença |
| **O próprio projeto** | `license` **não declarada** no package.json | ⚠️ declarar como privado, para não parecer código aberto por omissão |

---

## A ordem que eu seguiria

**Hoje, e custa quase nada:**
1. Apagar a função do Google Places do Supabase *(item 1)*
2. Corrigir os `revoke` das funções sensíveis *(item 3)*
3. Ligar a proteção de senha vazada *(item 4)*
4. Enviar os 13 commits *(item 6)*
5. Publicar o disparo de e-mail com a trava *(item 2)*
6. Declarar a licença do projeto

**Esta semana:**
7. Comprar o domínio — o relógio de aquecimento precisa começar *(item 9)*
8. Você preencher os dados da empresa *(item 11)*

**O trabalho principal:**
9. Resolver a fonte de dados *(item 5)* — Common Crawl primeiro, SerpApi se preciso
10. Ligar o pipeline ao produto
11. Cobrança na entrega *(item 10)*

**Antes de vender fora:**
12. Stripe *(item 8)*, advogados *(item 13)*, contador *(item 14)*

---

## O que eu quero deixar claro

Dos quinze itens, **oito não dependem de dinheiro nem de terceiros** — são trabalho, e a maior parte é rápida. Os itens 1 a 6 juntos levam menos de uma hora.

Mas o item 5 continua sendo o único que decide se existe produto. Duas construtoras em São Paulo não é um problema de acabamento; é o produto não fazendo o que o nome promete.
