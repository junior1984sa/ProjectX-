# O que dá para construir agora, e o que só depende de pagar

**Data:** 16 de agosto de 2026
**Decisão:** estruturar tudo o que não custa dinheiro, isolando o pago como encaixe pronto. Quando o pagamento acontecer, é ligar — não sobra construção.

---

## A regra de arquitetura que faz isso funcionar

Toda etapa que possa custar dinheiro vira **uma interface com duas implementações**:

- uma **gratuita**, que funciona hoje
- um **encaixe pago**, que ativa por variável de ambiente

**Ausência de chave paga nunca quebra o fluxo.** Ela só reduz a taxa de acerto. E o sistema registra qual implementação atendeu cada registro, para que a diferença seja medível em vez de suposta.

Sem essa regra, "deixar pendente" vira "deixar quebrado", e no dia do pagamento descobre-se que ainda falta construir.

---

## Resumo: quase tudo é construção, não dinheiro

| | Itens | Custo |
|---|---|---|
| **Construível agora** | 13 frentes | R$ 0 |
| **Depende de pagamento** | 6 itens | ver tabela abaixo |
| **Depende só de você** | 2 itens | seu tempo |

O gasto total para destravar o produto inteiro é menor que o custo fixo de dois meses de operação. **O gargalo nunca foi dinheiro — é construção e sequência.**

---

## Parte 1 — Construível agora, sem pagar nada

### Dados e busca

**1. Ingestão do Companies House.** O snapshot mensal em CSV é gratuito e a API tem chave gratuita — cadastro, não pagamento. Cobre nome, endereço, CEP, código SIC, situação e data de constituição de todas as sociedades incorporadas do Reino Unido.

**2. A trava de identidade.** É a maior alavanca do plano inteiro: leva a precisão de 26% para a meta de 90%. É pura lógica — comparar o número de registro, o CEP e os tokens do nome com o que está publicado no site. Não custa nada.

**3. Descoberta de site por meios gratuitos.** Heurística de domínio a partir do nome, validada pela trava de identidade — e é a trava que torna o palpite seguro, porque palpite errado é rejeitado em vez de entregue. Mais o índice do Common Crawl.

**4. Verificação sem custo e sem o nosso IP.** Sintaxe, existência de registro MX no domínio, detecção de domínio descartável e classificação de endereço genérico. Tudo por DNS, que não depende de reputação de IP — ao contrário da sondagem SMTP, que teve 36% de recusa contra o nosso endereço.

**5. Procedência e confiança em cada registro.** De qual fonte veio, quando foi coletado, qual sinal provou a identidade, que nível de verificação o contato recebeu.

### Produto

**6. Cobrança na entrega.** Mover o débito do crédito da busca para a entrega do contato verificado. É refatoração de backend e de interface. Custo zero, e é o que separa um produto vendável de um que não pode ser vendido com honestidade.

**7. Mostrar o mercado inteiro de graça.** O Companies House entrega o mapa com completude quase total. Exibir as 340 construtoras de Manchester e cobrar só pelas que vierem com contato é decisão de produto, não de orçamento.

**8. Sequências de abordagem por par de segmento.** Hoje o assistente escreve uma mensagem. Falta o gancho de "por que agora", a cadência de retomada, as três perguntas que qualificam e o erro clássico daquele ramo. Tudo sai do mapa de 1.187 pares que já existe.

*Observação:* a camada 1 do assistente (`src/lib/abordagem.ts`) funciona sem IA nenhuma e sem custo. A camada 2, com IA, é encaixe pago — e degrada em silêncio para a camada 1 quando não há chave.

**9. Lembretes do funil.** Ele já registra etapa, data da mudança e valor fechado. Falta usá-lo para empurrar: *"12 empresas abordadas há 9 dias, nenhuma retomada"*.

**10. O fluxo de indicação.** Tela no momento em que o assinante marca o contrato como fechado: quanto ele já fechou, quanto pagou de assinatura, e o convite para indicar. Recompensa em crédito, que não custa caixa.

### Conformidade

**11. Os itens de código que faltam do parecer jurídico.** Endereço postal obrigatório antes do primeiro disparo, aviso de renovação, coleta de número fiscal no checkout, página de subprocessadores, exportação completa dos dados do assinante, atribuição da fonte em toda exportação.

**12. Monitoramento de reclamação por assinante.** A Política de Uso Aceitável promete agir sobre limiar de reclamação e rejeição. Isso é código, e protege a reputação de envio de todos os assinantes.

**13. Preparar o DNS antes de ter o domínio.** Os registros de SPF, DKIM e DMARC, o cronograma de aquecimento semana a semana e o critério de recuo podem estar escritos e revisados antes da compra. No dia do domínio, é colar.

---

## Parte 2 — O que depende de pagamento

Ordenado por **quanto destrava por real gasto**.

### 1º — Domínio

| | |
|---|---|
| **Custo** | faixa de US$ 10 a 15 por ano para um `.com` |
| **Destrava** | envio de e-mail em nome dos assinantes, credibilidade, SEO, e o início do relógio de aquecimento |
| **Variável** | não é chave de API — é configuração de DNS e do remetente no Resend |

**É o primeiro por um motivo que não é preço: é o único item cujo benefício depende de tempo de calendário.** A reputação leva de quatro a seis semanas para construir, e não acelera com esforço. Cada semana sem domínio é uma semana que não volta.

Compre dois nomes de uma vez se puder: o principal e uma variação defensiva.

### 2º — Chave gratuita do Companies House

| | |
|---|---|
| **Custo** | **R$ 0** — mas exige cadastro seu |
| **Destrava** | dados ao vivo, além do snapshot mensal |

Não é pagamento, é cadastro. Está nesta lista só porque depende de você, não de mim.

### 3º — API de busca (SerpApi)

| | |
|---|---|
| **Custo** | cerca de US$ 10 por mil consultas, no plano com proteção legal declarada |
| **Destrava** | taxa de descoberta de site — e portanto a taxa final de contato |
| **Variável** | `SERPAPI_KEY` |

**Só pague depois de ver o número que os meios gratuitos alcançam.** Se a heurística mais a trava de identidade chegarem perto do portão, isto vira otimização em vez de necessidade.

Duas armadilhas já mapeadas, para não perder dinheiro: a **Brave Search API** proíbe armazenar resultados no plano padrão — é o Google Places com outro nome. A **Google Custom Search** está fechada a novos clientes e encerra em 01/01/2027.

### 4º — Verificador de e-mail

| | |
|---|---|
| **Custo** | por registro verificado, varia por fornecedor |
| **Destrava** | confiança do contato entregue — o pilar do modelo |
| **Variável** | `VERIFICADOR_EMAIL_KEY` |

Tem que ser fornecedor contratado, não código nosso: 36% das nossas sondagens foram recusadas por bloqueio contra o nosso IP. Sem verificação paga, o contato sai marcado com o nível de conferência que efetivamente recebeu — o que é honesto, mas entrega menos.

### 5º — Advogados

| | |
|---|---|
| **Custo** | honorários, os maiores desta lista |
| **Destrava** | publicar os documentos jurídicos e abrir o checkout internacional |

Dois, com prazo correndo: **solicitor inglês** — sobretudo o representante do art. 27 do UK GDPR, que incide mesmo com o disparo bloqueado, porque indexar empresa britânica já é tratamento de dado. E **advogado americano**, para o registro de data broker.

Pode esperar até haver produto pronto para vender, mas **não pode esperar até haver assinante**.

### 6º — Contador, para VAT e GST

| | |
|---|---|
| **Custo** | consulta pontual |
| **Destrava** | definir se £ 77 é com ou sem imposto — vale até 16,7% da receita no Reino Unido |

### Encaixe opcional — chave da Anthropic

Ativa a camada 2 do assistente de abordagem. Sem ela, a camada 1 funciona, é gratuita e não quebra nada. **Não é bloqueio de lançamento.**

---

## Parte 3 — O que depende só de você

**1. Os 75 campos `[PREENCHER]` dos documentos jurídicos.** Razão social, CNPJ, endereço, e-mail de contato, responsável. Nenhum agente pode inventar isso, e sem eles nada é publicável.

**2. Escolher o nome do domínio.** Posso verificar disponibilidade e preço quando você quiser.

---

## A ordem prática

```
HOJE           construção livre: ingestão, trava de identidade, cobrança na entrega
               ↓
QUANDO PUDER   comprar o domínio  →  relógio de aquecimento começa a correr
               ↓                      (4 a 6 semanas, em paralelo com a construção)
DEPOIS DA      olhar o número da trava de identidade
MEDIÇÃO        ↓
               se passou do portão  →  não precisa de API de busca ainda
               se não passou        →  aí sim, US$ 10 no SerpApi
               ↓
ANTES DE       advogados e contador
VENDER         ↓
               preencher os dados da empresa e publicar o jurídico
               ↓
               abrir o checkout
```

**O único item que não deve esperar é o domínio**, e é o mais barato de todos. Todo o resto pode ser decidido com número na mão, depois de ver o que a construção gratuita alcança sozinha.
