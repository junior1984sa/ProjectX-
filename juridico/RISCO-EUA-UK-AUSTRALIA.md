# Risco jurídico — EUA, Reino Unido e Austrália

Análise preliminar. **Não é parecer de advogado habilitado** em nenhuma
das três jurisdições. Data de referência: 15/08/2026.

## O QUE BLOQUEIA, EM UMA TABELA

| # | Risco | Severidade | Bloqueia? |
|---|---|---|---|
| 1 | Disparo em lote no Reino Unido para **sole trader e partnership** sem consentimento (PECR reg. 22) | CRÍTICO | SIM — UK |
| 2 | Austrália: consentimento inferido **não se sustenta** porque o OSM é colaborativo | CRÍTICO | SIM — AU |
| 3 | Rodapé CAN-SPAM incompleto: falta **endereço postal físico** e **rótulo de publicidade** | CRÍTICO | SIM — todos |
| 4 | **WhatsApp está sujeito à mesma regra do e-mail** em UK e AU. Manual não é defesa | CRÍTICO | SIM — UK e AU |
| 5 | ODbL 4.4/4.6 — base derivada usada publicamente sem atribuição nem oferta de acesso | CRÍTICO | Atribuição: SIM |
| 6 | Sem Termos de Uso, Política de Privacidade e Política de Uso Aceitável | CRÍTICO | SIM |
| 7 | **Google Places proíbe** guardar nome, endereço e telefone em banco próprio | ALTO | SIM — essa feature |
| 8 | Registro como **data broker na Califórnia** (DROP vigente desde 01/08/2026) | ALTO | prazo correndo |
| 9 | Isenção australiana de pequena empresa **não se aplica** (s. 6D(4)) | ALTO | SIM — AU |
| 10 | Direitos do titular incompletos: só existe descadastro | ALTO | SIM |

## OS TRÊS ACHADOS QUE MUDAM O PLANO

### 1. O disparo de e-mail é ilícito no Reino Unido para o nosso público

PECR reg. 22 separa **corporate subscriber** (Ltd, PLC, LLP) de
**individual subscriber** — e o ICO é explícito: **sole trader e
ordinary partnership são individual subscribers**.

O dono de serralheria e a empresa de limpeza que são nosso alvo declarado
são, na maioria, sole traders. Para eles, é exigido **consentimento
prévio** ou soft opt-in (que pressupõe venda anterior). Prospecção fria
não tem nenhum dos dois.

**Solução:** classificar o destinatário via **Companies House** (API
pública e gratuita). Com registro ativo → liberar. Sem registro →
bloquear os dois canais.

### 2. WhatsApp está no mesmo regime — e isso é maior do que parecia

O PECR define "electronic mail" incluindo mensageria instantânea, e o
ICO afirma isso expressamente. **O envio manual, um por vez, não é
defesa** — a regra olha o conteúdo (marketing direto não solicitado),
não o grau de automação. O mesmo vale para o Spam Act australiano.

**O problema é nos dois canais, não em um.**

### 3. A integração com Google Places viola os termos

Não é interpretação, está no texto: *"You must not pre-fetch, cache, or
store Places API content"*, e *"copy and save business names, addresses,
or user reviews"* está listado como proibido. A única exceção é o
`place_id`.

Nosso produto guarda nome, endereço e telefone em banco próprio — que é
exatamente a conduta descrita como proibida. E o Places **não retorna
e-mail**, então o valor marginal era baixo.

**Substitutos superiores, públicos e gratuitos:** Companies House (UK) e
ABN Lookup (Austrália). Servem também para a classificação exigida pelo
PECR.

## O RISCO EXISTENCIAL: ODbL

A licença do OpenStreetMap não é sobre multa. **Violá-la termina
automaticamente o direito de usar os dados.** O remédio é cessação.

Duas obrigações imediatas:
- **Atribuição visível** "© OpenStreetMap contributors" na tela de
  resultados, com link para a licença
- Avaliar se nossa base derivada aciona as cláusulas 4.4 e 4.6, que
  podem exigir oferecer acesso à derivada. Há divergência real na
  comunidade jurídica do OSM — exige advogado de open data

## ORDEM DE EXECUÇÃO

### Bloco 0 — antes de qualquer novo envio
1. Desligar disparo em lote para destinatários em **UK e Austrália**
2. Aplicar a mesma trava ao **WhatsApp**
3. Corrigir rodapé CAN-SPAM: endereço postal + rótulo de publicidade
4. **Atribuição OSM visível**

### Bloco 1 — antes do primeiro pagamento internacional
5. Publicar Política de Uso Aceitável → Termos → Privacidade
6. Canal de acesso/exclusão real, não só supressão de envio
7. Documentar LIA e DPIA
8. Redigir o "Founder Rate" com condições cumpríveis
9. Aplicar o vocabulário proibido ao conteúdo já escrito

### Bloco 2 — 30 a 60 dias
10. Classificação via Companies House → destrava o Reino Unido
11. Verificação de publicação no site próprio → destrava a Austrália
12. **Migrar envio para a caixa do próprio assinante via OAuth** — a
    mudança de maior alavancagem: tira a ProspectX da posição de
    "initiator" e transfere a maior parte do risco

## VOCABULÁRIO DE MARKETING

**Proibido:** verified · guaranteed · trusted by · X customers ·
compliant · qualified leads · hot leads · AI-powered (enquanto for
template) · lifetime/forever sem qualificação na mesma peça

**Liberado:** founding member · sourced from public listings · find
businesses that hire what you do · auto-drafted first message

**"Verified" é a palavra de maior risco.** Promete validação que não
existe: a base é OSM não validado, com registros criados por terceiros.

Humor **não neutraliza** claim implícito. Vídeo cômico mostrando o
telefone tocando sem parar é afirmação de resultado.

## SÓ ADVOGADO HABILITADO RESOLVE

- Texto vigente da Schedule 2 do Spam Act e o alcance real da publicação
  conspícua — advogado australiano
- Se nossa base derivada é "substancial" para a ODbL — advogado de open data
- Aplicabilidade do TCPA a mensagens WhatsApp — advogado americano
- Alcance da Australian Consumer Law sobre nossos Termos — advogado australiano
- Mapeamento estado a estado de registro de data broker — advogado americano
