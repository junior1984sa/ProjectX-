# Configuração do Backend — Supabase + Mercado Pago

Este guia te leva do zero até o ProspectX funcionando com login, perfis de prestadores e cobrança recorrente.

---

## 1. Criar o schema do banco de dados

1. Abra seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** (menu lateral) → **New query**
3. Abra o arquivo `supabase/migrations/001_schema_inicial.sql` deste projeto
4. Copie todo o conteúdo, cole no editor e clique em **Run**

Isso cria:
- Tabela `profiles` (perfil do prestador)
- Tabela `arquivos_portfolio` (uploads)
- Tabela `assinaturas` (histórico de cobranças)
- Bucket de Storage `portfolios` (arquivos públicos)
- Todas as políticas de **Row Level Security** (RLS) necessárias

### 1.1. Aplicar o sistema de créditos

Repita o processo com o arquivo `supabase/migrations/002_sistema_creditos.sql`:

1. **SQL Editor** → **New query**
2. Cole o conteúdo do arquivo `002_sistema_creditos.sql`
3. Clique em **Run**

Isso cria:
- Tabela `creditos_usuario` (saldo mensal de créditos por prestador)
- Tabela `historico_buscas` (registro de cada busca realizada)
- Função `calcular_custo_creditos()` (define o custo por faixa de tamanho de busca)
- Função `inicializar_creditos()` (concede créditos quando a assinatura é ativada — chamada automaticamente pelo webhook)
- Função `consumir_creditos()` (debita créditos de forma atômica antes de cada busca, evitando condições de corrida)

**Como funciona o consumo de créditos:**

| Tamanho da busca | Custo em créditos |
|---|---|
| Até 10 empresas | 10 créditos |
| Até 20 empresas | 18 créditos |
| Até 30 empresas | 25 créditos |
| Até 40 empresas | 30 créditos |

- Plano **mensal**: 100 créditos/mês
- Plano **anual**: 150 créditos/mês (bônus por fidelidade)
- O saldo renova automaticamente a cada 30 dias a partir da ativação

---

## 2. Configurar autenticação por e-mail/senha

1. No Supabase Dashboard, vá em **Authentication > Providers**
2. Confirme que **Email** está habilitado (vem habilitado por padrão)
3. Em **Authentication > Settings**:
   - Se quiser testar rápido sem confirmar e-mail: desative "Confirm email" temporariamente
   - Para produção, recomendo manter a confirmação de e-mail ativada

---

## 3. Pegar as credenciais do Supabase para o frontend

1. Vá em **Project Settings > API**
2. Copie:
   - **Project URL** → cole em `VITE_SUPABASE_URL` no seu `.env`
   - **anon public key** → cole em `VITE_SUPABASE_ANON_KEY` no seu `.env`

---

## 4. Configurar o Mercado Pago

### 4.1. Criar aplicação

1. Acesse [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Clique em **Criar nova aplicação**
3. Nome: `ProspectX` (ou outro nome)
4. Tipo de pagamento: **Pagamentos online**
5. Produto: **Checkout Pro** (ou Assinaturas, se disponível na sua conta)

### 4.2. Copiar credenciais de teste

Na página da sua aplicação, você verá automaticamente:
- **Public Key** (teste) → vai no frontend
- **Access Token** (teste) → vai SÓ no backend (Edge Function), nunca no `.env` do React

### 4.3. Colocar a Public Key no frontend

No seu `.env`:
```env
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-sua-public-key-aqui
```

---

## 5. Publicar as Edge Functions

As Edge Functions rodam no servidor do Supabase e guardam a chave secreta do Mercado Pago em segurança.

### 5.1. Instalar a Supabase CLI (se ainda não tiver)

```bash
npm install -g supabase
```

### 5.2. Login e link do projeto

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
```//
> `SEU_PROJECT_REF` está na URL do seu projeto: `https://SEU_PROJECT_REF.supabase.co`

### 5.3. Configurar os secrets (variáveis seguras do backend)

```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-sua-access-token-secreta
supabase secrets set URL_BASE_APP=http://localhost:5173
supabase secrets set PRECO_PLANO_MENSAL=99.00
supabase secrets set PRECO_PLANO_ANUAL=950.00
supabase secrets set DIAS_TRIAL=5
```

> Quando for para produção, troque `URL_BASE_APP` pelo domínio real do seu site, e troque o `MERCADOPAGO_ACCESS_TOKEN` de teste pelo de produção (`APP_USR-...`).

### 5.4. Publicar as funções

```bash
supabase functions deploy criar-assinatura-mp
supabase functions deploy webhook-mercadopago --no-verify-jwt
supabase functions deploy cancelar-assinatura
```

> O `--no-verify-jwt` no webhook é necessário porque o Mercado Pago chama essa função diretamente (sem um token de usuário do Supabase). As outras duas funções exigem login normal do usuário, então não usam essa flag.

### 5.5. Aplicar a migration de trial e cancelamento

No SQL Editor do Supabase, rode também o arquivo `supabase/migrations/004_trial_e_cancelamento.sql` (mesmo processo: New query → colar → Run). Ele adiciona:
- Status `trial` ao perfil, com `trial_inicio` e `trial_fim`
- Função `iniciar_trial()` — concede 20 créditos válidos pelos 5 dias de teste
- Função `registrar_cancelamento()` — usada pela Edge Function de cancelamento

---

## 6. Configurar o webhook no Mercado Pago

1. No painel do Mercado Pago, vá até sua aplicação → **Webhooks**
2. Adicione a URL de notificação:
   ```
   https://SEU_PROJETO.supabase.co/functions/v1/webhook-mercadopago
   ```
3. Selecione os eventos **Pagamentos** (payments) E **Assinaturas** (subscription_preapproval)
4. Salve

Isso é o que faz o perfil do prestador ser ativado **automaticamente**, tanto no fim do trial (cobrança aprovada) quanto se a pessoa cancelar direto no painel do Mercado Pago — sem você precisar aprovar nada manualmente.

---

## 6.1. Aplicar a migration de códigos de cortesia

No SQL Editor, rode também `supabase/migrations/005_codigos_cortesia.sql`. Ele já vem com **3 códigos prontos**, cada um válido por 14 dias e uso único:

```
OBRIGADO-AMIGO1
OBRIGADO-AMIGO2
OBRIGADO-AMIGO3
```

Distribua um código para cada pessoa. A pessoa cria a própria conta normalmente (e-mail/senha), completa o cadastro de perfil, e na tela de planos clica em **"Tenho um código de cortesia"** — digitando o código, ela ganha 14 dias de acesso completo sem precisar de cartão.

Se quiser criar mais códigos depois, rode no SQL Editor:
```sql
insert into public.codigos_cortesia (codigo, dias_gratis, usos_maximos, observacao)
values ('MEU-CODIGO-NOVO', 14, 1, 'Descrição opcional');
```

## 7. Testar o fluxo completo

1. Rode o projeto: `npm run dev`
2. Clique em "Cadastrar empresa" → crie uma conta
3. Preencha o perfil (empresa, segmento, WhatsApp, e-mail, e envie um arquivo de teste)
4. Escolha um plano → você será redirecionado ao checkout do Mercado Pago
5. Use um [cartão de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards) para simular a aprovação
6. Após o pagamento, volte ao app — o webhook deve ter ativado seu perfil em poucos segundos (a tela mostra "Verificando status..." automaticamente)

---

## 8. Indo para produção

Quando estiver pronto para cobrar de verdade:

1. No Mercado Pago, ative as **credenciais de produção** (`APP_USR-...`)
2. Atualize o secret: `supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-sua-chave-de-producao`
3. Atualize `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env` de produção com a Public Key de produção
4. Atualize `URL_BASE_APP` para o domínio real
5. Reconfigure a URL do webhook no painel do Mercado Pago, se o domínio do Supabase mudar

---

## Resumo das variáveis

| Variável | Onde fica | Exposta no navegador? |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` do frontend | Sim (é pública por design) |
| `VITE_SUPABASE_ANON_KEY` | `.env` do frontend | Sim (protegida pelas políticas RLS) |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | `.env` do frontend | Sim (é feita para isso) |
| `MERCADOPAGO_ACCESS_TOKEN` | Supabase secrets | **Não, nunca** |
| `URL_BASE_APP` | Supabase secrets | Não |
| `PRECO_PLANO_MENSAL` / `ANUAL` | Supabase secrets | Não (mas espelhe no `.env` para exibir o preço na tela) |
