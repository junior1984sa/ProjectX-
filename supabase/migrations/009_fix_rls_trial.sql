-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CORREÇÃO: RLS de profiles não incluía status 'trial'
-- Execute após 001 a 008 no SQL Editor do Supabase
--
-- BUG ENCONTRADO: a policy original de leitura pública de profiles
-- (migration 001) só liberava status_assinatura = 'ativa'. Como o
-- sistema de trial (migration 004) foi adicionado depois, perfis em
-- período de teste ficavam INVISÍVEIS no diretório e na busca, mesmo
-- a função temAcessoLiberado() do código já considerar 'trial' como
-- acesso válido. Esta migration corrige a policy para acompanhar essa
-- mesma regra de negócio.
-- ═══════════════════════════════════════════════════════════

drop policy if exists "Perfis ativos são públicos" on public.profiles;

create policy "Perfis ativos ou em trial são públicos"
  on public.profiles for select
  using (status_assinatura in ('ativa', 'trial'));

-- Mesmo bug encontrado na policy de arquivos_portfolio (portfólio do
-- prestador usado no disparo de panfleto) — também só liberava 'ativa'.
drop policy if exists "Arquivos de perfis ativos são públicos" on public.arquivos_portfolio;

create policy "Arquivos de perfis ativos ou em trial são públicos"
  on public.arquivos_portfolio for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = arquivos_portfolio.profile_id
      and profiles.status_assinatura in ('ativa', 'trial')
    )
  );

-- ═══════════════════════════════════════════════════════════
-- FIM DA CORREÇÃO
-- ═══════════════════════════════════════════════════════════
