-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — FUNDAÇÃO PARA INTERNACIONALIZAÇÃO (preparação)
-- Execute após 001 e 002 no SQL Editor do Supabase
--
-- Esta migration NÃO ativa nenhum idioma novo nem gateway novo.
-- Ela só prepara o banco para que, quando você decidir lançar a
-- versão internacional, não seja preciso migrar dados existentes.
-- ═══════════════════════════════════════════════════════════

-- ═══ Adiciona preferências de região/idioma ao perfil ═══
alter table public.profiles
  add column if not exists pais_foco text not null default 'BR',
  add column if not exists idioma text not null default 'pt-BR';

comment on column public.profiles.pais_foco is 'País de foco do prestador para prospecção (ex: BR, US). Define moeda e gateway de pagamento.';
comment on column public.profiles.idioma is 'Idioma de exibição da interface (ex: pt-BR, en-US).';

-- ═══ TABELA: planos_regiao (preços por país/moeda) ═══
create table if not exists public.planos_regiao (
  id uuid primary key default uuid_generate_v4(),
  pais text not null,              -- 'BR', 'US', etc.
  moeda text not null,             -- 'BRL', 'USD', etc.
  gateway text not null,           -- 'mercadopago', 'stripe', 'paypal'
  plano text not null check (plano in ('mensal', 'anual')),
  valor numeric(10,2) not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (pais, plano)
);

comment on table public.planos_regiao is 'Preços de assinatura por país/moeda/gateway. Permite cobrar valores diferentes por região (ex: R$99/mês no Brasil, US$29/mês nos EUA).';

-- Preço atual do Brasil (o único ativo de fato por enquanto)
insert into public.planos_regiao (pais, moeda, gateway, plano, valor, ativo)
values
  ('BR', 'BRL', 'mercadopago', 'mensal', 99.00, true),
  ('BR', 'BRL', 'mercadopago', 'anual', 950.00, true)
on conflict (pais, plano) do nothing;

-- Preço de exemplo para os EUA — fica cadastrado mas INATIVO até você
-- decidir lançar e configurar a integração com Stripe/PayPal de verdade
insert into public.planos_regiao (pais, moeda, gateway, plano, valor, ativo)
values
  ('US', 'USD', 'stripe', 'mensal', 29.00, false),
  ('US', 'USD', 'stripe', 'anual', 280.00, false)
on conflict (pais, plano) do nothing;

-- ═══ RLS: planos_regiao é tabela pública de leitura (preços) ═══
alter table public.planos_regiao enable row level security;

create policy "Qualquer um pode ver planos ativos"
  on public.planos_regiao for select
  using (ativo = true);

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE INTERNACIONALIZAÇÃO (FUNDAÇÃO)
-- ═══════════════════════════════════════════════════════════
