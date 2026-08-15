# Estrutura tributária — LLC Wyoming vs CNPJ

Análise preliminar. **Não é parecer de contador habilitado.**
Data de referência: 15/08/2026.

## VEREDITO EM CINCO PONTOS

1. **A premissa de 6% do modelo estava errada.** SaaS por assinatura
   está sujeito ao fator "r". Sem folha, é **Anexo V a 15,50%**.

2. **A LLC não se paga.** Não por causa do Stripe — ele economiza mesmo
   ~3,9 p.p. Mas em **09/04/2026** a Receita publicou a **Solução de
   Consulta COSIT nº 56/2026**, que enquadra LLC transparente de sócio
   não residente como **regime fiscal privilegiado**. Consequência: o
   lucro passa a ser tributado **todo 31/12 a 15% na pessoa física**,
   mesmo sem repatriar. Isso é ~13% da receita, contra 3,05% do CNPJ
   exportando no Anexo III.

3. **O caminho superior é o que ficou por último:** CNPJ no Simples,
   Anexo III via fator "r", faturando o exterior como **exportação de
   serviços**. Na exportação o DAS cai para **3,054%**, porque PIS,
   Cofins e ISS são desconsiderados (LC 123, art. 18, §14).

4. **Form 5472:** confirmado, e pior que o descrito — US$ 25.000
   iniciais **mais US$ 25.000 a cada 30 dias** após 90 dias de
   intimação, sem teto.

5. **O plano ignora o risco mais caro:** IVA/GST/sales tax. No Reino
   Unido, vendedor não estabelecido tem **limite de registro ZERO** —
   VAT de 20% desde a primeira venda B2C.

## O ERRO QUE EU COMETI NOS DOIS SENTIDOS

Assumi 6% de imposto (errado para menos) **e** assumi INSS patronal de
20% no custo do pró-labore (errado para mais).

**Não existe INSS patronal em empresa do Anexo III ou V** — a CPP já
está dentro do DAS. Só incide os 11% do sócio. E desde 01/01/2026, com
a Lei 15.270/2025, pró-labore até R$ 5.000/mês tem **IRRF zero**.

Resultado: o pró-labore compensa muito antes do que eu calculei.

| Mercado | Receita de equilíbrio do pró-labore |
|---|---|
| Interno | **R$ 1.877/mês** — 4 assinantes brasileiros |
| Exportação | **R$ 2.341/mês** — 5 assinantes americanos |

## AS QUATRO ALÍQUOTAS QUE O MODELO PRECISA

| Tipo de receita | Alíquota efetiva (1ª faixa) |
|---|---|
| Brasil, Anexo III | 6,000% |
| Brasil, Anexo V | 15,500% |
| **Exportação, Anexo III** | **3,054%** |
| Exportação, Anexo V | 10,672% |

## COMPARAÇÃO POR US$ 100 DE RECEITA INTERNACIONAL

| Linha | LLC Wyoming | CNPJ Anexo III export |
|---|---|---|
| Taxa de pagamento | (3,21) | (8,06) |
| Manutenção da estrutura | (0,83) | 0,00 |
| DAS | 0,00 | (3,05) |
| IRPF Lei 14.754 (15% sobre o lucro) | (13,19) | 0,00 |
| **Líquido para o dono** | **74,77** | **80,89** |

**O CNPJ entrega US$ 6,12 a mais por US$ 100.** Não existe faturamento
a partir do qual a LLC compense tributariamente, desde que o CNPJ esteja
no Anexo III com exportação segregada.

A LLC só se justifica por razões **não tributárias**: aceitação de meios
de pagamento locais, contrato com cliente corporativo americano que
exige contraparte doméstica, e percepção de marca. Nenhuma delas importa
antes do primeiro cliente pagante.

## DOIS REQUISITOS DE PRODUTO COM EFEITO FISCAL

1. **Restringir busca de assinante internacional a cidades fora do
   Brasil.** A tese de exportação exige "resultado verificado no
   exterior". Se um assinante americano pedir empresas em São Paulo, um
   fiscal municipal tem argumento de que o resultado ocorreu no Brasil,
   e o ISS passa a ser devido.

2. **Coletar e validar número fiscal no checkout** — VAT ID no Reino
   Unido, ABN na Austrália, estado nos EUA. B2B com número válido vai
   para reverse charge e sai do regime de IVA/GST.

## A DECISÃO DE PREÇO QUE PRECISA SER TOMADA AGORA

£77 e A$147 são **com ou sem imposto**? Se forem tax-inclusive e o VAT
britânico for devido, a receita real no Reino Unido é **£64,17, não
£77** — 16,7% a menos.

## ORDEM RECOMENDADA

### Fase 0 — agora, faturamento zero
1. **Não abrir a LLC.** Custo certo, benefício zero antes do primeiro cliente
2. Abrir o **CNPJ antes do primeiro faturamento** — faturar como PF joga
   a receita no carnê-leão a até 27,5%
3. Definir CNAE e item da lista de serviços com o contador
4. **Iniciar pró-labore de 1 salário mínimo no mesmo mês da abertura.**
   O fator "r" olha os 12 meses anteriores — começar antes da receita
   garante o Anexo III desde o primeiro DAS
5. Registrar programa e marca no INPI
6. Protocolar **Solução de Consulta** na RFB sobre exportação de SaaS no
   Simples — trava o tratamento por escrito

### Fase 1 — primeiros clientes
7. Segregar receita de exportação no PGDAS-D
8. Documentar ingresso de divisas no CNPJ
9. Validar número fiscal no checkout
10. Restringir buscas internacionais a cidades fora do Brasil

### Fase 2 — a partir de ~R$ 30 mil/mês
11. Avaliar **Merchant of Record** (Paddle, Lemon Squeezy) em vez de LLC
    — assume a responsabilidade de VAT/GST/sales tax nas três
    jurisdições e elimina o argumento comercial da LLC

## SÓ PROFISSIONAL HABILITADO RESOLVE

- **Contador brasileiro:** CNAE e item da lista de serviços;
  proporcionalização do fator "r" no início de atividade; composição do
  RBT12 com exportação
- **Tributarista:** redação da Solução de Consulta; efeitos da Lei
  15.270/2025 sobre distribuição de lucros no Simples
- **CPA americano:** só se a LLC voltar à mesa
