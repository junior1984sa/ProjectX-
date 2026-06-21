# ProspectX 🎯

**Não é propaganda esperando ser vista. É ir direto à fonte.**

A maioria das ferramentas de marketing espera o cliente aparecer. O ProspectX inverte isso: identifica diretamente as empresas que, agora, precisam de um serviço — e coloca o prestador na frente delas. Funciona para qualquer ramo: jateamento abrasivo, pintura industrial, aluguel de containers, caminhões, betoneiras, locação de equipamentos, ou qualquer outro tipo de prestação de serviço B2B no Brasil.

O resultado de cada busca é uma lista real de potenciais clientes — não uma garantia de fechamento. Só resta saber se a proposta que chega até eles vai agradar.

ProspectX tem duas frentes:
1. **Prospecção ativa**: o prestador busca, por segmento e cidade, as empresas que correspondem ao seu público-alvo — com mapa, gráficos e exportação (dados simulados nesta versão, prontos para conectar a APIs reais)
2. **Diretório nacional de prestadores**: qualquer prestador de serviço pode criar uma conta, montar seu perfil com WhatsApp/e-mail/portfólio, e assinar um plano mensal ou anual para aparecer no diretório e ser encontrado por quem precisa

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (banco de dados + autenticação + storage)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers) (cobrança recorrente)

### Passos

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais (veja SUPABASE_SETUP.md para o passo a passo completo)

# 3. Configure o backend (banco de dados + Edge Functions)
# Siga o guia completo em SUPABASE_SETUP.md

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em **http://localhost:5173**

> ⚠️ **Importante**: sem configurar o Supabase e o Mercado Pago (passo 2 e 3), o login, cadastro de prestadores e cobrança não vão funcionar. A busca de prospecção (dados simulados) funciona mesmo sem isso. Veja o guia completo em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Interface e tipagem |
| Vite | Build e dev server |
| Tailwind CSS | Estilização |
| shadcn/ui + Radix UI | Componentes de UI |
| React Router | Navegação entre telas |
| Recharts | Gráficos |
| Leaflet + react-leaflet | Mapa interativo |
| Zustand | Estado global |
| **Supabase** | Autenticação, banco de dados (Postgres), storage de arquivos |
| **Mercado Pago** | Cobrança recorrente (Pix, boleto, cartão) |
| date-fns | Formatação de datas |
| react-hot-toast | Notificações |

---

## 📦 Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                      # Componentes shadcn/ui
│   ├── auth/
│   │   └── TelaAuth.tsx         # Login e cadastro
│   ├── perfil/
│   │   ├── FormularioPerfil.tsx # Cadastro de prestador (dados + contato)
│   │   ├── UploadPortfolio.tsx  # Upload de portfólio/proposta/panfleto
│   │   ├── SelecaoPlano.tsx     # Escolha de plano mensal/anual
│   │   └── StatusAssinatura.tsx # Telas de retorno do checkout
│   ├── NavegacaoTopo.tsx        # Header com login/perfil/sair
│   ├── ContatoComPaywall.tsx    # Contato borrado para não-assinantes
│   ├── FormularioBusca.tsx
│   ├── Dashboard.tsx
│   ├── CardsMetricas.tsx
│   ├── MapaProspeccao.tsx
│   ├── GraficoCanais.tsx
│   ├── GraficoBairros.tsx
│   ├── FiltrosDashboard.tsx
│   ├── TabelaEmpresas.tsx
│   └── InstrucoesAPI.tsx
├── lib/
│   ├── supabase.ts              # Cliente Supabase
│   ├── storage.ts                # Upload/gestão de arquivos
│   ├── pagamento.ts              # Chamada à Edge Function de checkout
│   ├── utils.ts
│   └── dadosMock.ts
├── store/
│   ├── useAppStore.ts           # Estado da prospecção (busca, filtros)
│   └── useAuthStore.ts          # Estado de autenticação e perfil
├── types/
│   ├── empresa.ts
│   └── prestador.ts
├── App.tsx                       # Rotas da aplicação
├── main.tsx
└── index.css

supabase/
├── migrations/
│   └── 001_schema_inicial.sql   # Schema completo do banco + RLS
└── functions/
    ├── criar-assinatura-mp/     # Edge Function: cria cobrança no MP
    └── webhook-mercadopago/     # Edge Function: confirma pagamento e ativa perfil
```

---

## ✨ Funcionalidades

### Prospecção (dados simulados, conectável a APIs reais)
- Busca por segmento + cidade + raio
- Mapa interativo com marcadores por score
- Gráficos de canais de contato e top bairros
- Filtros, ordenação, paginação, exportação CSV
- **Contatos (telefone/e-mail) ficam borrados para visitantes sem assinatura ativa**

### Conta e perfil de prestador
- Cadastro com e-mail e senha (Supabase Auth)
- Perfil com nome da empresa, segmento (texto livre, cobre qualquer ramo: jateamento, pintura industrial, aluguel de containers/caminhões/betoneiras, etc.), cidade, descrição
- Dados de contato: nome do responsável, WhatsApp, e-mail
- Upload de portfólio, proposta comercial ou panfleto (PDF/imagem, até 10MB)

### Assinatura, teste grátis e créditos
- **Teste grátis de 5 dias**: cadastro de cartão sem cobrança imediata, com 20 créditos de teste
- Cobrança automática no cartão ao final do trial (a menos que o usuário cancele antes)
- Planos mensal (R$99/mês) e anual (R$950/ano, com bônus de créditos) — valores configuráveis via `.env`
- **Sistema de créditos mensais**: cada busca consome créditos conforme o tamanho (10 a 30 créditos por faixa), evitando uso ilimitado dentro do mesmo mês
- **Cancelamento em um clique**, sem formulário de motivo nem etapas de retenção, dentro da própria tela de perfil
- Tokenização seguro do cartão direto no navegador via SDK do Mercado Pago — número e CVV nunca passam pelo nosso backend
- **Ativação automática** do perfil via webhook, sem aprovação manual
- Perfil só aparece publicamente no diretório enquanto a assinatura estiver ativa ou em trial

### Disparo de portfólio para os leads
- Cada lead encontrado tem um botão "Enviar panfleto" que abre o WhatsApp já com uma mensagem pronta e o link do portfólio mais recente do prestador
- Funciona com ou sem o telefone do lead — se não houver número, abre o WhatsApp em modo "escolher contato"

---

## 🔌 Integrar APIs Reais de Prospecção

Por padrão, a busca usa **dados simulados**. Para usar dados reais, veja a seção correspondente no app (botão "Usar APIs reais" no dashboard) ou edite `src/lib/dadosMock.ts`.

---

## 🎨 Personalização

- **Cores**: edite `tailwind.config.js` (paleta `azul` e `verde`)
- **Tema**: variáveis CSS em `src/index.css`
- **Segmentos sugeridos**: edite `SEGMENTOS_SUGERIDOS` em `src/types/prestador.ts`
- **Preços dos planos**: edite `VITE_PRECO_PLANO_MENSAL` e `VITE_PRECO_PLANO_ANUAL` no `.env`

---

## 📋 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar TypeScript e ESLint
```

---

## 📝 Licença

Projeto pessoal — uso livre para fins comerciais e pessoais.
