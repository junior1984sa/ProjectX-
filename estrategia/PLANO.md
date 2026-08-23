# O plano

**Data:** 16 de agosto de 2026
**Estado:** zero assinantes, produto no ar, custo fixo de R$ 208/mês, operação de uma pessoa.

Este documento é a fonte de verdade sobre o que fazer e em que ordem. Os outros documentos de `estrategia/` e `juridico/` são o material de apoio; quando divergirem deste, este vence.

---

## 1. O estado real, em números medidos

Nada aqui é estimativa.

| | |
|---|---|
| Empresas do Companies House que chegam com e-mail verificável | **8%** (IC 95%: 4,1–15,0%) |
| Precisão da descoberta de site — quantos dos "encontrados" eram da empresa | **26%** (9 de 35) |
| Endereços que são do contador, não da empresa | **38%** |
| Sondagens de verificação recusadas por bloqueio do nosso IP | **36%** |
| Custo por registro entregue | US$ 0,028 a 0,100 |
| Receita por registro (plano mensal britânico) | US$ 0,740 |
| Preço atual, em qualquer mercado | US$ 92 a 98/mês |
| Preço de entrada do concorrente mais próximo (Hunter Starter) | US$ 49/mês |

**A margem não é o problema.** O custo do dado consome entre 3,8% e 13,5% da receita. O problema é que **8% não sustenta uma assinatura**: nesse patamar, um assinante de construção em Manchester esgota a cidade inteira em 4,3 meses e cancela. A 30%, dura 16 meses.

A taxa de entrega não define só o que se entrega hoje. **Ela define o churn.** É essa a razão de tudo neste plano girar em torno dela.

---

## 2. A cadeia, e onde ela vaza

```
100 empresas do registro
    ↓  registro oficial: cobertura praticamente total
100 com nome, endereço e código de atividade
    ↓  descoberta de site: encontra 35
 35 "com site"
    ↓  ← O VAZAMENTO ESTÁ AQUI: só 9 eram da empresa (26%)
  9 com site correto
    ↓  extração do contato publicado
  8 com e-mail
```

Perder 26 dos 35 na etapa de identidade é o maior vazamento isolado da cadeia. E é o mais barato de consertar, porque não depende de comprar dado nenhum.

---

## 3. O princípio que ordena as fases

**Começa primeiro o que tem custo de calendário, não o que tem custo de trabalho.**

Reputação de domínio leva semanas para construir e não acelera com esforço. Código leva o tempo que leva, mas é comprimível. Por isso o domínio é a Fase 0, mesmo sem nada para enviar ainda: o relógio dele precisa estar correndo enquanto o resto é construído.

O segundo princípio: **nenhuma fase começa antes de a anterior passar no portão**. Portão é um número, não uma sensação.

---

## FASE 0 — Domínio e reputação de envio

**Começa hoje. Não depende de nada.**

### O que comprar

Um domínio `.com`, curto, pronunciável em inglês. Ele é a cara do produto para americanos e britânicos, e `.com` ainda é o que transmite empresa de verdade.

**Estrutura de subdomínios — e isto não é detalhe:**

| Subdomínio | Uso |
|---|---|
| `dominio.com` | site e produto |
| `go.dominio.com` (ou `mail.`) | **envio de e-mail em nome dos assinantes** |
| `dominio.com` | e-mail interno da empresa |

**Nunca envie prospecção pelo domínio principal.** Se ele for para uma lista de bloqueio, o site continua no ar, o e-mail da empresa continua funcionando, e só o subdomínio de envio queima. Sem essa separação, um disparo mal calibrado derruba o negócio inteiro.

### O que configurar, na ordem

1. **SPF, DKIM e DMARC** no subdomínio de envio. DMARC começa em `p=none` (só observa e recebe relatório), evolui para `quarantine` e depois `reject`.
2. **Registro reverso e MX coerentes.**
3. **Página de descadastro** já funcionando, sem login — já existe no código.
4. **Cabeçalho de descadastro em um clique.**

### O aquecimento

Domínio novo tem reputação **zero**, não neutra. O aquecimento é gradual e leva de quatro a seis semanas, no mínimo. Critério de parada: se a taxa de abertura cair ou a de spam subir, **recue o volume em vez de manter**.

Prioridade no início: enviar para quem provavelmente vai abrir e responder. Engajamento positivo constrói reputação mais rápido que volume.

### O problema de IP que a medição achou

36% das sondagens de verificação foram recusadas por listas de bloqueio contra o **nosso** endereço — não por defeito do e-mail. Isso significa duas coisas:

- **Verificação de e-mail é fornecedor contratado**, não código nosso. Não insista em fazer da nossa infraestrutura.
- **O mesmo bloqueio vai atingir o disparo.** Por isso o envio sai pelo Resend, com domínio próprio autenticado, e nunca de um IP genérico.

### Portão para sair da Fase 0

- [ ] Domínio comprado e DNS propagado
- [ ] SPF, DKIM e DMARC verificados por consulta real (`dig`), não presumidos
- [ ] DMARC em `p=none` recebendo relatório
- [ ] Cronograma de aquecimento escrito, com volume por semana

---

## FASE 1 — Subir os 8%

**É o trabalho principal do produto. Tudo depende disto.**

### 1.1 A trava de identidade — a maior alavanca

O que fazer: **exigir prova de que o site pertence à empresa** antes de aceitar qualquer contato dele.

E existe uma prova barata e específica do Reino Unido. As regras de divulgação comercial obrigam sociedades incorporadas a exibir, no próprio site, o **nome registrado e o número de registro**. Ou seja: se o número do Companies House aparece na página, o site é daquela empresa — com certeza, não com heurística.

*(Confirmar o alcance exato da obrigação com o solicitor inglês que já está na lista. Mas mesmo sem confirmação jurídica, o sinal técnico funciona: número de registro na página é prova de identidade.)*

Regra de aceite, em ordem de força:

| Sinal | Força |
|---|---|
| Número de registro da empresa aparece no site | **prova** — aceita |
| CEP registrado aparece no site | forte — aceita |
| Nome da empresa bate por tokens **e** o domínio contém o nome | médio — aceita com confiança reduzida |
| Só o nome parecido | fraco — **rejeita** |

**Rejeitar é a decisão certa.** Um pipeline sem essa trava entrega 74% de contato errado com cara de certo — que é pior que não entregar, porque o assinante gasta o crédito e a reputação dele numa empresa que não é a que ele quis abordar.

### 1.2 Descoberta de site

O teste mais urgente que ficou pendente: **medir a taxa da API de busca**. O agente testou 7 empresas e achou 2 — isso é anedota, não medida. O teste cabe no plano gratuito do SerpApi.

Duas armadilhas de licença já mapeadas, para não perder tempo:
- **Brave Search API** proíbe armazenar resultados no plano padrão. É o Google Places com outro nome.
- **Google Custom Search** está fechada a novos clientes e encerra em 01/01/2027.

Resta o **SerpApi** (US$ 10 por mil, com proteção legal declarada) como caminho pago, e o índice do Common Crawl como caminho gratuito ainda não medido.

### 1.3 Extração e verificação

- Extrair da página de contato da empresa, **só endereço genérico** (`info@`, `contact@`, `sales@`).
- **Não perseguir e-mail nominal.** A razão é técnica antes de ser jurídica: em 9 sites corretos, apareceu **1 vez**. Não está publicado. E ainda carrega o UK GDPR inteiro junto.
- Verificação por fornecedor contratado, nunca da nossa infraestrutura.

### 1.4 O que o produto passa a mostrar

Cada registro entregue carrega:

- **Procedência** — de qual fonte veio
- **Data de coleta** — frescor
- **Confiança do contato** — e como foi verificado
- **Prova de identidade** — qual sinal confirmou que o site é da empresa

Isso não é enfeite: é o que transforma uma base imperfeita em produto honesto. O cliente que recebe "telefone não verificado desde 2023" confia mais que o que recebe um telefone morto sem aviso.

### Portão para sair da Fase 1

- [ ] Precisão da descoberta de site **acima de 90%** (hoje: 26%)
- [ ] Taxa de contato verificado **acima de 25%** (hoje: 8%)
- [ ] Custo por registro entregue medido e abaixo de US$ 0,15
- [ ] Medição refeita com a mesma semente, comparável com a linha de base

**Se a taxa não passar de 25%, não avance.** Reveja a fonte, não o discurso. Vender 8% é vender um produto que cancela em quatro meses.

---

## FASE 2 — Cobrar na entrega

Hoje o crédito é debitado **antes** da busca. Com 8% de acerto, isso significa cobrar por 40 e entregar 3 — e o cliente concluir que foi enganado, com razão.

### O que muda

| Hoje | Depois |
|---|---|
| Crédito debitado ao buscar | Crédito debitado ao **entregar contato verificado** |
| Cliente vê o que pagou | Cliente vê **o mercado inteiro** de graça, paga pelo verificado |
| Busca vazia consome crédito | Busca vazia não custa nada |

O Companies House entrega o mapa do mercado com completude praticamente total. **Mostrar isso de graça é possível e é forte:** o assinante vê as 340 construtoras de Manchester, e paga só pelas que vierem com contato.

### O que precisa ser construído

- Debitar no momento da entrega, não da busca (padrão de reserva e confirmação, ou débito na exportação)
- Não existe RPC de estorno hoje — verificado nas migrações 002, 016, 021 e 024. Debitar depois é melhor que criar estorno
- Definir publicamente **o que é um crédito**, na página de preços

### Portão

- [ ] Nenhum caminho de código debita crédito sem entrega
- [ ] A página de preços diz o que um crédito compra, em uma frase

---

## FASE 3 — Tornar o jurídico publicável

Os documentos estão escritos (`juridico/documentos/`). Eles **prometem coisas que o código precisa cumprir**. Quatro dos onze itens bloqueantes já foram construídos — exclusão de conta, pedidos de titular, registro de aceite com versão e expurgo agendado.

### O que falta

| Item | O que é |
|---|---|
| **Dados da empresa** | 75 campos `[PREENCHER]`: razão social, CNPJ, endereço, contato. **Só o dono tem** |
| **Endereço postal obrigatório** | Hoje é opcional no perfil; precisa ser exigido antes do primeiro disparo |
| **Dump ODbL** | Deixa de ser necessário quando o OpenStreetMap sair da base. **A Fase 1 resolve isto de graça** |
| **Advogado inglês** | Sobretudo o representante do art. 27 do UK GDPR, que incide mesmo com o disparo bloqueado |
| **Advogado americano** | Registro de data broker |
| **VAT/GST** | Definir com contador se £ 77 é com ou sem imposto. Vale até 16,7% da receita no Reino Unido |

### Ordem de publicação

Política de Uso Aceitável → Termos → Privacidade. Mesma versão, mesma data.

**Não publicar antes de a Fase 2 fechar.** Uma política que promete o que o sistema não faz entrega ao regulador a prova pronta.

---

## FASE 4 — O primeiro assinante

Um país, um vertical, uma fonte: **Reino Unido, Companies House, um segmento industrial**.

### Por que um vertical só

Provar a cadeia inteira num segmento é mais valioso que cobrir dez pela metade. E permite a única prova social honesta que teremos: um assinante real, com um contrato real fechado.

### Preço

**Não mexer antes da Fase 1 fechar.** Baixar preço com base ruim atrai quem cancela no primeiro mês e queima a lista de fundadores — que é vitalícia e irreversível.

Depois da Fase 1, criar o degrau de entrada em torno de **US$ 29 a 39/mês**, que é a faixa que o mercado abandonou: quem precisa de 100 a 300 registros por mês não tem produto hoje.

### Portão

- [ ] Um assinante pagante
- [ ] Que registrou pelo menos um contrato fechado no funil

---

## FASE 5 — O laço: assinante que fecha contrato indica outro

Esta fase responde à pergunta que o dono levantou, e ela é mais importante do que parece: **é o único canal de aquisição que não custa dinheiro.**

### O raciocínio

Um assinante não indica a ferramenta porque a ferramenta é boa. Ele indica porque **fechou um contrato**. A cadeia é:

```
contato certo → abordagem que funciona → resposta →
relacionamento → contrato fechado → indicação
```

A Fase 1 cuida do primeiro elo. Esta cuida dos três do meio — e o último vem sozinho, se os outros funcionarem.

### 5.1 Deixar de entregar mensagem e passar a entregar sequência

Hoje o assistente escreve **uma** primeira mensagem. Isso é a menor parte do problema: quem presta serviço não perde o contrato na primeira mensagem, perde no silêncio depois dela.

O que construir, por par de segmento:

| Peça | O que é |
|---|---|
| **Primeira mensagem** | já existe |
| **Por que agora** | o gancho específico daquele par — o que faz uma construtora contratar jateamento *neste mês* |
| **Cadência de retomada** | quando insistir, quantas vezes, e com que ângulo diferente |
| **O que perguntar** | as três perguntas que qualificam aquele tipo de cliente |
| **O que não dizer** | o erro clássico de quem aborda aquele segmento |

Isso sai do mesmo mapa de 1.187 pares que já existe. Não é conteúdo genérico de vendas: é específico do par "quem eu sou → quem eu abordo".

### 5.2 O funil vira lembrete, não arquivo

O funil já registra etapa, data da mudança e valor fechado (migração 022). Falta usá-lo para **empurrar**:

- "Você abordou 12 empresas há 9 dias e nenhuma teve retomada"
- "Esta empresa respondeu e parou. Retomada em 3 dias costuma funcionar melhor que em 10"
- "Você tem 4 oportunidades em negociação sem movimento há 2 semanas"

Disciplina de follow-up é o que separa quem fecha de quem não fecha, e é a coisa mais fácil de esquecer trabalhando sozinho.

### 5.3 O gatilho de indicação

**Quando o assinante marca um contrato como fechado, esse é o momento de maior satisfação que ele vai ter com o produto.** É ali que se pede a indicação — não num e-mail mensal, não num banner permanente.

O que a tela faz nesse momento:
1. Mostra o valor total que ele já fechou usando a ferramenta
2. Compara com o que ele pagou de assinatura
3. **Só então** oferece: indique alguém do seu ramo

**A recompensa deve ser em crédito, não em dinheiro.** Dinheiro cria obrigação fiscal, exige contrato de comissão e atrai quem quer o prêmio, não quem acredita no produto. Crédito custa pouco para nós e vale muito para quem usa.

*Antes de lançar: validar com o jurídico o texto do programa de indicação e, se houver recompensa, o tratamento fiscal.*

### 5.4 O benefício escondido

Quando assinantes registram contratos fechados, **nós finalmente temos número real para publicar**. Hoje não podemos dizer nada sobre resultado, porque nada aconteceu ainda. Depois de dez contratos registrados, a página inicial pode parar de falar de funcionalidade e começar a falar de resultado — com número verdadeiro.

Esse é o momento em que o marketing deixa de ser promessa.

### Portão

- [ ] Pelo menos um assinante que veio por indicação de outro

---

## 6. O que NÃO fazer

Registrado para não voltar a ser discutido:

| Não fazer | Por quê |
|---|---|
| Virar marketplace bilateral | Problema de liquidez que exige operação de vendas em tempo integral, e joga fora o mapa de segmentos |
| Voltar ao Google Places | Termos proíbem armazenar nome, endereço e telefone |
| Perseguir e-mail nominal | Apareceu 1 vez em 9 sites; carrega o UK GDPR inteiro |
| Integrar Austrália | ABN Lookup não publica código de atividade |
| Integrar Canadá | Registro fragmentado + CASL, a lei mais severa do mundo |
| Baixar preço agora | Queima a lista de fundadores, que é vitalícia |
| Elasticsearch, Kafka, multi-cloud | Arquitetura para escala que não existe |
| API pública, SOC 2, dez idiomas | Engenharia sem cliente |
| Publicar qualquer número de tração | Não existe tração. Número inventado é o erro mais caro possível |

---

## 7. Os riscos, e o que fazer com cada um

| Risco | Probabilidade | O que fazer |
|---|---|---|
| **A taxa não passa de 25% mesmo com a trava de identidade** | média | O produto vira "mapa do mercado + contato onde existe", com preço menor. Ainda é vendável, mas é outro produto — e melhor saber antes de vender |
| **Domínio queima no aquecimento** | baixa, se seguir o cronograma | Subdomínio separado limita o dano ao envio |
| **Orientação do ICO muda com o Data (Use and Access) Act** | média | A trava por país já recusa por padrão; mudar é afrouxar, não apertar |
| **Assinante abusa e queima a reputação de todos** | média | Política de Uso Aceitável já escrita; falta o monitoramento por assinante (item C11) |
| **Fonte de dados muda de licença** | baixa | Companies House sob licença aberta de governo, sem *share-alike* |

---

## 8. Resumo de uma página

1. **Hoje:** compre o domínio e comece o aquecimento. O relógio dele não acelera depois.
2. **Em seguida:** conserte a trava de identidade. É 26% que precisa virar 90%, e é o maior vazamento da cadeia.
3. **Depois:** meça de novo. Se não passar de 25% de contato verificado, pare e reveja a fonte.
4. **Então:** mude a cobrança para o momento da entrega. Sem isso o produto não é vendável com honestidade.
5. **Então:** preencha os dados da empresa, consulte os advogados, publique o jurídico.
6. **Então:** venda para um vertical, num país, e acompanhe até alguém fechar um contrato.
7. **Aí sim:** transforme quem fechou em quem indica — e só então publique número de resultado, porque só então ele será verdadeiro.

O erro a evitar é o mesmo o tempo todo: **prometer antes de conseguir entregar.** Foi o que aconteceu com o OpenStreetMap, e é o único jeito de perder a credibilidade que ainda não foi gasta.
