# Escolha dos países-alvo

**Data:** 16 de agosto de 2026
**Critério do dono:** país desenvolvido, moeda forte, Europa / Oceania / América do Norte. Máximo de 3 a 4.

---

## O critério que decide, e por que ele não é a moeda

Moeda forte e mercado grande não servem de nada se o produto não puder rodar. A ProspectX responde "quais empresas do segmento X existem na cidade Y". Isso exige uma fonte com **três** coisas ao mesmo tempo:

1. **Nome da empresa** — sem isso não há registro para entregar
2. **Endereço** — sem isso não há busca por cidade
3. **Código de atividade** — sem isso não há busca por segmento, que é o produto inteiro

A maioria dos registros públicos entrega os dois primeiros. O terceiro é o que separa os países viáveis dos inviáveis.

---

## Os três escolhidos

### 1. Reino Unido — o primeiro, sem disputa

| | |
|---|---|
| **Registro** | Companies House |
| **Custo** | gratuito |
| **Acesso** | snapshot mensal em CSV (versão de 01/08/2026) + API ao vivo |
| **Código de atividade** | SIC |
| **Moeda** | GBP ≈ R$ 6,90 — a mais forte da lista |
| **Idioma** | inglês, que já temos |
| **E-mail B2B** | **permitido para sociedade incorporada** |

O e-mail é o diferencial verificado em fonte oficial. A orientação do ICO diz textualmente que a regra de consentimento da PECR *"doesn't apply to corporate subscribers"*. E o Companies House registra **apenas** entidades incorporadas — ou seja, a fonte de dados certa entrega, de brinde, a prova de que o destinatário está na categoria permitida.

Ressalvas: o UK GDPR continua incidindo, autônomos ficam de fora, e a orientação do ICO está sob revisão pelo Data (Use and Access) Act. Detalhes em `juridico/REGIME-EMAIL-POR-PAIS.md`.

### 2. Irlanda — o segundo, pelo custo marginal quase zero

| | |
|---|---|
| **Registro** | CRO Open Data Portal (`opendata.cro.ie`) |
| **Custo** | gratuito |
| **Acesso** | download em massa **e** API, atualização diária |
| **Licença** | CC BY 4.0 — reuso comercial permitido, sem *share-alike* |
| **Código de atividade** | NACE Rev. 2 |
| **Moeda** | EUR ≈ R$ 5,90 |
| **Idioma** | inglês — mesma copy, mesmo material, mesmo Instagram |

A razão de ser o segundo não é o tamanho — a Irlanda tem cerca de 5 milhões de habitantes. É que **o custo marginal de adicioná-la ao Reino Unido é quase zero**: mesma língua, mesma mensagem, e ainda coloca a operação dentro da União Europeia, o que abre o continente depois.

Atenção: o CRO tem *também* um produto pago de dados em massa, na casa de dezenas de milhares de euros por ano. **Não é esse que interessa** — o portal aberto entrega o que precisamos de graça.

### 3. França — o terceiro, e o maior mercado dos três

| | |
|---|---|
| **Registro** | Sirene / INSEE |
| **Custo** | gratuito |
| **Acesso** | arquivos mensais completos (ZIP e Parquet) + API |
| **Licença** | Licence Ouverte 2.0 — reuso comercial permitido |
| **Código de atividade** | NAF/APE |
| **Moeda** | EUR ≈ R$ 5,90 |
| **Idioma** | **francês — não temos** |

A Sirene é provavelmente o melhor registro aberto da Europa continental: cobre unidades legais e estabelecimentos, com histórico desde 1973.

Dois custos reais: o idioma é um quarto idioma a manter, e a base traz o *statut de diffusion* — registros com oposição do titular têm identidade e endereço mascarados, o que precisa ser respeitado na ingestão. O regime de e-mail B2B francês ainda **não foi verificado em fonte oficial**.

---

## O quarto lugar, condicional: Holanda

Fica de fora da lista principal por um detalhe que só aparece quando se lê a documentação: **o conjunto aberto do KVK é anonimizado** — traz localização, data de registro, atividade e forma jurídica, mas **não traz o nome da empresa**. Para estatística serve; para prospecção, não.

O caminho nomeado é a API paga: cerca de € 6,40 por mês mais € 0,02 por consulta. Não é proibitivo (€ 0,02 ≈ R$ 0,12 por registro), mas muda o custo variável do produto de zero para algo — e é a única da lista que faz isso.

Entra se e quando o produto já estiver pago pelos três primeiros.

---

## Os que eu recomendo descartar, e por quê

**Austrália** — o ABN Lookup **não publica código de atividade**. Sem ele não há como responder "construtoras em Sydney", que é o produto. Registro sem a dimensão de segmento é um catálogo de nomes.

**Canadá** — a pior combinação do mundo anglófono desenvolvido: registro fragmentado por província, sem base federal única, e a CASL, que é a lei de e-mail comercial mais severa do mundo em penalidade. Dois problemas graves ao mesmo tempo.

**Estados Unidos** — tem a melhor lei de e-mail (CAN-SPAM, opt-out) e o maior mercado, mas **não tem registro federal de empresas**: é estado por estado. É o oposto do Reino Unido — a lei ajuda e o dado atrapalha. Vale manter vendendo, porque já está implementado e não custa nada, mas **não é onde investir o esforço de integração agora**.

**Argentina e Colômbia** — reprovam no próprio critério de moeda forte que o dono estabeleceu.

---

## Resumo

| Ordem | País | Registro | Código de atividade | Moeda | Idioma | E-mail B2B |
|---|---|---|---|---|---|---|
| 1 | **Reino Unido** | Companies House | SIC | GBP 6,90 | inglês | **verificado: permitido** |
| 2 | **Irlanda** | CRO Open Data | NACE | EUR 5,90 | inglês | a verificar |
| 3 | **França** | Sirene/INSEE | NAF | EUR 5,90 | francês | a verificar |
| — | Holanda | KVK (pago) | SBI | EUR 5,90 | inglês alto | a verificar |
| ✗ | Austrália | ABN sem código | — | AUD 3,50 | inglês | restritivo |
| ✗ | Canadá | fragmentado | — | CAD 3,90 | inglês | CASL, o mais severo |
| ✗ | EUA | sem base federal | — | USD 5,40 | inglês | permissivo |

**Sequência recomendada:** Reino Unido sozinho até funcionar. Irlanda logo em seguida, porque custa quase nada. França como terceiro passo, quando houver receita para pagar o idioma.

## O que ainda precisa ser verificado antes do plano final

- Regime de e-mail B2B para pessoa jurídica na Irlanda e na França, em fonte oficial (autoridade nacional, não fonte secundária)
- Licença exata do Companies House (a página de download não a declara; a expectativa é Open Government Licence)
- Cobertura real de e-mail e telefone em cada registro — nenhum dos três publica contato de forma consistente, e **contatabilidade é a métrica que decide se o produto entrega valor**
