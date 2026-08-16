# Regime de e-mail comercial por país — Reino Unido

**Data de referência:** 16 de agosto de 2026
**Fonte:** orientação oficial do ICO, *Business-to-business marketing*, lida em ico.org.uk
**Escopo:** apenas Reino Unido. Os demais países ficam `[NÃO ANALISADO]` — ver seção 4.

---

## 1. A trava atual está bloqueando o Reino Unido sem necessidade

O arquivo `supabase/functions/enviar-email-lote/regimes.ts` classifica o Reino Unido como `optin` e recusa todo disparo. Isso foi construído errando para o lado seguro, tratando o país como bloco único. **A orientação do ICO mostra que a realidade é mais favorável.**

Citações da página oficial:

> "Businesses are classed as 'corporate subscribers' under PECR if they are a corporate body with separate legal status (eg companies, limited liability partnerships, Scottish partnerships, and some government bodies)."

> "In general the marketing rules in PECR apply equally to corporate subscribers and individual subscribers. **The main difference is that the rule on marketing by electronic mail (eg email or text message) doesn't apply to corporate subscribers.**"

> "So, for example, the email address or telephone number of an employee at a corporate body would constitute a corporate subscriber for the purposes of PECR because the 'subscriber' is their employer."

**Conclusão:** e-mail comercial não solicitado para uma *limited company* britânica não está sujeito à exigência de consentimento prévio da PECR.

## 2. As três condições que limitam isso

### 2.1 Autônomo e sociedade não incorporada continuam protegidos

> "However not all types of businesses are classed as corporate subscribers under PECR. Some are actually classed as individual subscribers. This includes: sole traders; certain types of partnerships (eg non-limited liability partnerships or other types of English, Welsh and Northern Irish partnerships); and other unincorporated bodies of individuals."

Para esses, vale a regra cheia: consentimento prévio.

**Consequência de produto:** liberar o Reino Unido exige que o sistema saiba distinguir sociedade incorporada de autônomo. **Com dado do OpenStreetMap isso é impossível** — o mapa colaborativo não registra forma societária.

Mas há uma convergência que resolve o problema sozinha: o **Companies House registra apenas entidades incorporadas**. Se a base britânica vier de lá, todo registro é, por construção, *corporate subscriber*. A fonte de dados certa e a conformidade legal são o mesmo movimento.

### 2.2 O UK GDPR continua incidindo

> "If you are processing personal data for direct marketing purposes, even in a business context, the UK GDPR applies."

> "If you want to use publicly available personal data to send marketing to an individual, even in a business context, you need to comply with the UK GDPR."

Ou seja: a PECR sai do caminho, o UK GDPR não. Continuam exigidos base legal, informação ao titular e direito de oposição. Some-se a isso a provável obrigação de representante do art. 27, já apontada no parecer dos documentos jurídicos.

**Consequência prática:** endereço genérico (`info@`, `sales@`, `contato@`) tem risco menor que endereço nominal (`joao.silva@empresa.com`), porque o segundo é dado pessoal de forma inequívoca.

### 2.3 A orientação está sob revisão

A própria página traz o aviso:

> "Due to changes made by the Data (Use and Access) Act, this guidance is under review and may be subject to change."

Não invalida a leitura atual, mas obriga a reconferir antes de publicar qualquer promessa comercial baseada nela.

## 3. Recomendação — o que fazer e quando

**Não desbloquear o Reino Unido agora.** A permissão legal existe, mas o produto ainda não consegue provar que o destinatário é *corporate subscriber*. Liberar antes de conseguir distinguir seria trocar uma trava conservadora por um risco real.

Sequência correta:

| Ordem | Ação |
|---|---|
| 1 | Integrar o Companies House como fonte britânica |
| 2 | Marcar cada registro com a forma societária, vinda do próprio registro |
| 3 | Liberar o disparo **apenas** para registro identificado como entidade incorporada |
| 4 | Manter a recusa para autônomo, sociedade não incorporada e registro sem forma societária conhecida |
| 5 | Confirmar com *solicitor* inglês — inclusive o representante do art. 27 |
| 6 | Só então mudar `regimes.ts` e o espelho `src/lib/regimeEmail.ts` |

O código **não foi alterado** por causa disso. A trava permanece como está até o passo 6.

## 4. Não analisado

Ficam pendentes, e continuam recusados por padrão no código: Austrália (consentimento inferido do Spam Act), Canadá (consentimento implícito da CASL), França (posição da CNIL sobre prospecção B2B), Alemanha, Espanha, Itália, Holanda, Portugal, Irlanda, Argentina, Colômbia, México, Chile, Nova Zelândia e Paraguai.

A hipótese que vale testar em cada um: a distinção entre pessoa jurídica e pessoa física provavelmente também existe, com desenhos diferentes. Recusar por padrão continua correto até que cada um seja verificado em fonte oficial.

## 5. Ressalva

Esta análise é uma leitura de orientação regulatória oficial feita para orientar decisão de engenharia e de mercado. **Não substitui parecer de advogado habilitado no Reino Unido**, que já consta como necessário no parecer dos documentos jurídicos.
