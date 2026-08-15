# Custos, alíquotas e preço para venda internacional

**Data de referência:** 15 de agosto de 2026
**Estrutura societária considerada:** CNPJ brasileiro no Simples Nacional, exportando serviço. A LLC em Wyoming foi descartada.
**Estado do negócio:** zero assinantes.

---

## 1. Conclusão executiva

Três achados, em ordem de impacto:

**O imposto não é o problema.** Vender para fora do Brasil paga *menos* imposto que vender dentro: 3,054% contra 6,000% no Anexo III. A margem de contribuição internacional fica em 90%, contra 86% no Brasil. A estratégia de focar Estados Unidos, Reino Unido e Austrália está certa também pelo lado fiscal.

**O preço é o problema.** A ProspectX cobra hoje o equivalente a **US$ 92 a US$ 98 por mês** em todos os mercados. Isso é o dobro do Hunter Starter (US$ 49) e mais caro que o Apollo no plano anual (US$ 79 por assento) — com uma base de dados que hoje é pior que a dos dois. Preço acima do concorrente exige produto superior em algo visível, e ainda não temos.

**O que falta não custa dinheiro, custa decisão.** O custo fixo mensal real é de cerca de R$ 208. Dois assinantes fundadores semestrais pagam a operação inteira. O gargalo não é caixa — é a qualidade da base e a definição de posicionamento.

---

## 2. Alíquotas — as quatro que passam a valer

O painel financeiro projetava 6% fixos. Isso estava errado por dois motivos ao mesmo tempo.

**Primeiro:** SaaS por assinatura só cai no Anexo III se o fator "r" fechar 28% (folha ÷ receita dos últimos 12 meses, LC 123, art. 18, §5º-M). Sem pró-labore, o enquadramento é o **Anexo V, a 15,5%** — 9,5 pontos acima do que o modelo mostrava.

**Segundo:** receita de exportação de serviço paga menos. A LC 123, art. 18, §14 manda desconsiderar PIS, Cofins e ISS no cálculo do DAS.

| | Mercado interno | Exportação |
|---|---|---|
| **Anexo III** (com pró-labore) | 6,000% | **3,054%** |
| **Anexo V** (sem pró-labore) | 15,500% | 10,672% |

*Alíquotas da primeira faixa de receita bruta. Mudam de faixa conforme o faturamento acumulado dos últimos 12 meses — confirme a faixa aplicável com o contador quando o faturamento começar.*

### O pró-labore compensa a partir de R$ 1.877/mês de receita

Manter o Anexo III custa pró-labore de 25,4% da receita, com piso no salário mínimo. Parece caro, mas **o pró-labore não é dinheiro perdido — é o dono se pagando**. O que evapora de fato é o INSS de 11% sobre ele, cerca de 2,8% da receita. Contra 9,5 pontos de economia de imposto, o Anexo III ganha com folga.

| Receita mensal | Anexo III (imposto + INSS) | Anexo V (imposto) | Vantagem do III |
|---|---|---|---|
| R$ 1.000 | R$ 238 | R$ 155 | −R$ 83 |
| R$ 1.877 | R$ 291 | R$ 291 | empate |
| R$ 3.000 | R$ 358 | R$ 465 | +R$ 107 |
| R$ 10.000 | R$ 879 | R$ 1.550 | +R$ 671 |

**Ação:** abrir o pró-labore quando a receita passar de R$ 1.900/mês. Antes disso, ficar no Anexo V.

**Ressalva declarada:** o modelo aplica o INSS de 11% sem teto, o que superestima o custo em receitas altas. Existe teto de contribuição — confirme o valor vigente com o contador.

### O requisito frágil da exportação

A tese de exportação exige três coisas ao mesmo tempo: tomador no exterior, ingresso de divisas, e **resultado verificado no exterior**. O terceiro é o que pode ser contestado: se um assinante americano usar a ferramenta para achar empresas em São Paulo, cabe o argumento de que o resultado ocorreu no Brasil — e a receita dele inteira é reclassificada, com imposto retroativo e multa.

**Já resolvido no código:** a migration `024_restricao_fiscal_exportacao.sql` impede, no banco, que assinante de fora do Brasil busque empresas brasileiras. A trava mora na função que debita crédito, que é o único ponto do fluxo com usuário autenticado e verificado.

---

## 3. Custos reais

### Custo fixo mensal

| Item | Valor | Observação |
|---|---|---|
| Internet | R$ 100 | informado pelo dono |
| Claude Code (plano de US$ 20) | R$ 108 | ao câmbio de R$ 5,40 |
| Supabase | R$ 0 | plano gratuito ainda comporta |
| Vercel | R$ 0 | plano gratuito ainda comporta |
| Domínio | `[PREENCHER]` | ainda não contratado |
| Resend | R$ 0 | plano gratuito, 50 e-mails por disparo |
| **Total atual** | **R$ 208** | |

Se o plano do Claude Code subir para US$ 200, o custo fixo vai para **R$ 1.180**.

### Custo variável por assinante

| Item | Hoje | Quando a base melhorar |
|---|---|---|
| Consulta de dados | **R$ 0** — o OpenStreetMap não cobra | a definir pela fonte contratada |
| Reserva no modelo | R$ 0,20 por crédito | trocar por (preço por mil ÷ 1000) |
| E-mail | R$ 0 no plano gratuito do Resend | plano pago quando passar do teto |
| IA da abordagem | por chamada | medir custo por token antes de liberar |

**Nota importante:** a premissa de R$ 0,20 por crédito é uma *reserva deliberada*, não um custo real. Projetar com custo zero produziria margem que some assim que a base for contratada.

### Ponto de equilíbrio

Com custo fixo de R$ 208 e o mix padrão de planos:

| Enquadramento | Assinantes para empatar |
|---|---|
| Anexo V | **1** |
| Anexo III | **5** (o pró-labore entra como despesa) |

Com custo fixo de R$ 1.180 (Claude Max), sobe para cerca de 10 assinantes no Anexo III.

---

## 4. Margem por mercado

Números do modelo, com Anexo III, uso médio de 70% dos créditos e câmbio de R$ 5,40 por dólar:

| País | Plano mensal | Bruto BRL/mês | Gateway | Imposto | API | **Margem** | **%** |
|---|---|---|---|---|---|---|---|
| Brasil | R$ 497 | 497 | 25 | 30 | 14 | **R$ 428** | 86,2% |
| EUA | US$ 97 | 524 | 20 | 16 | 14 | **R$ 473** | 90,4% |
| Reino Unido | £ 77 | 531 | 21 | 16 | 14 | **R$ 480** | 90,4% |
| Austrália | A$ 147 | 515 | 20 | 16 | 14 | **R$ 465** | 90,3% |

**Um assinante britânico deixa R$ 52 a mais por mês que um brasileiro pelo mesmo produto.** Vem de duas fontes: imposto menor (3,054% contra 6%) e taxa de gateway menor (Stripe a 3,9% contra Mercado Pago a 4,99%).

---

## 5. VAT e GST — a conta que ainda não está fechada

Esta é a lacuna mais séria do modelo atual, e a que pode mudar o preço final.

### Reino Unido

O IVA britânico é de 20%. Em venda de serviço digital de fornecedor estrangeiro para **empresa** britânica registrada, aplica-se em regra o mecanismo de autoliquidação (*reverse charge*): quem recolhe é o cliente, não o fornecedor. Mas para cliente **não registrado** o tratamento é outro, e pode exigir registro do fornecedor no Reino Unido.

**A pergunta que precisa de resposta:** os £ 77 são com ou sem imposto? Se o assinante for pessoa jurídica registrada, provavelmente não muda nada. Se for autônomo não registrado — que é boa parte do nosso público-alvo — a diferença pode chegar a **16,7% da receita**.

### Austrália

O GST australiano é de 10%. Fornecedor não residente que vende serviço digital a consumidores australianos precisa se registrar ao ultrapassar o limiar de A$ 75.000 de faturamento anual naquele mercado. Venda a empresa registrada para GST tem tratamento distinto.

**Hoje não estamos perto do limiar**, mas a regra precisa estar clara antes do primeiro assinante, não depois de 100.

### Estados Unidos

Não há IVA federal. Existe *sales tax* estadual, e a tributação de SaaS **varia por estado** — alguns tributam, outros não. Há também limiares de nexo econômico que, se ultrapassados, obrigam ao registro no estado.

### ⚠️ Ressalva obrigatória

**Os três parágrafos acima descrevem a estrutura do problema, não a resposta.** As alíquotas de referência (20% no Reino Unido, 10% na Austrália) são as alíquotas gerais publicadas; a aplicação ao nosso caso concreto — se somos obrigados a registrar, quem recolhe, se o preço deve ser exibido com ou sem imposto — **exige confirmação de contador habilitado nas respectivas jurisdições** antes do primeiro pagamento internacional. Não tome nenhuma decisão de preço a partir desta seção sozinha.

**Recomendação prática enquanto isso não fecha:** exibir os preços internacionais com a marcação de que são valores para **empresa** (B2B), e coletar o número de registro fiscal do assinante no checkout. Isso mantém a operação na hipótese mais simples e cria o registro que o contador vai pedir depois.

---

## 6. O problema de preço — e a recomendação

### Onde estamos no mercado

Preços de concorrentes conforme o relatório estratégico fornecido, consulta de 15/08/2026. **Preço de terceiro muda com frequência — reconfira antes de decidir.**

| Produto | Entrada mensal | Modelo |
|---|---|---|
| Hunter Free | US$ 0 | 50 créditos/mês |
| Hunter Starter | **US$ 49** (US$ 34 no anual) | 2.000 créditos/mês |
| Apollo | **US$ 79/assento** (anual) | assinatura + créditos |
| Hunter Growth | US$ 149 | 10.000 créditos/mês |
| LinkedIn Sales Navigator Core | US$ 119,99/licença | licença |
| ZoomInfo / Cognism | sob consulta | pacote enterprise |
| **ProspectX** | **US$ 92 a 98** | assinatura + créditos |

### O diagnóstico honesto

Estamos posicionados no meio da tabela em preço e no fundo em base de dados. Isso é a pior combinação possível: caro demais para quem compara com o Hunter, fraco demais para quem compara com o Apollo.

Há duas saídas, e elas são excludentes:

**Saída A — baixar o preço de entrada.** Criar um degrau em torno de **US$ 29 a 39/mês**, abaixo do Hunter Starter, mirando o profissional solo que os concorrentes abandonaram. O relatório estratégico recomenda exatamente essa faixa (Starter US$ 29–49). O preço atual vira o plano do meio.

**Saída B — justificar o preço com o que só nós temos.** O mapa de 1.187 pares "quem contrata quem" não existe em nenhum concorrente. Apollo e ZoomInfo entregam *contatos*; nenhum deles responde "quem contrataria o meu serviço". Se essa camada ficar visível e explicada, o preço se sustenta.

**Minha recomendação: fazer as duas, nesta ordem.** Primeiro B, depois A.

O motivo é que a Saída A sozinha nos coloca numa guerra de preço contra empresas com muito mais caixa, e o Hunter pode zerar o Starter amanhã. A Saída B constrói a única defesa que temos. Mas a Saída B só funciona se a base entregar dado real — por isso ela depende do trabalho de fonte de dados que está em curso.

**Sequência concreta:**

1. Resolver a fonte de dados (em andamento, relatório separado)
2. Tornar o "quem contrata quem" o centro da proposta, com explicação visível
3. Só então mexer no preço, com o degrau de entrada mais baixo

**Não mexer no preço agora.** Baixar preço com base ruim atrai cliente que cancela no primeiro mês e queima a lista de fundadores, que é irreversível — o preço fundador foi prometido como vitalício.

---

## 7. O que já foi implementado

| Item | Estado |
|---|---|
| Quatro alíquotas por anexo e destino | ✅ `src/lib/projecao.ts` |
| Pró-labore como despesa, com comparação honesta dos anexos | ✅ `src/lib/projecao.ts` |
| Ponto de equilíbrio por busca binária (o pró-labore escala com a receita) | ✅ |
| Seletor de anexo no painel financeiro | ✅ `src/components/admin/PainelFinanceiro.tsx` |
| Restrição fiscal: assinante estrangeiro não busca no Brasil | ✅ migration `024` |
| Trava por país no disparo de e-mail | ✅ `supabase/functions/enviar-email-lote/regimes.ts` |
| Endereço postal obrigatório para envio aos EUA (CAN-SPAM) | ✅ migration `023` |
| Google Places removido do produto e do roadmap | ✅ |

## 8. O que ainda falta

| Item | Bloqueia o quê | Dono |
|---|---|---|
| Confirmar VAT/GST com contador nas três jurisdições | primeiro pagamento internacional | dono + contador |
| Definir se £ 77 e A$ 147 são com ou sem imposto | até 16,7% da receita no Reino Unido | dono + contador |
| Termos de Uso, Política de Privacidade e Política de Uso Aceitável | primeira venda | em produção |
| Fonte de dados que cubra segmento B2B | tudo | em produção |
| Domínio próprio pago | credibilidade e entregabilidade de e-mail | dono |
| Coletar número de registro fiscal do assinante no checkout | simplificar a apuração | engenharia |
