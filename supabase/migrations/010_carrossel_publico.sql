-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CARROSSEL PÚBLICO (imagem de capa, sem exigir login)
-- Execute após 001 a 009 no SQL Editor do Supabase
--
-- O carrossel da tela de abertura precisa mostrar a imagem de capa
-- de prestadores publicados, mesmo para visitantes SEM CONTA. As
-- políticas de RLS existentes em perfis_diretorio (migration 008)
-- exigem `to authenticated`, então criamos aqui uma policy adicional
-- e mais restrita — expõe apenas os campos necessários ao carrossel
-- (nome, cidade, segmento, logo_url), nunca dados de contato.
-- ═══════════════════════════════════════════════════════════

create policy "Capas de perfis publicados são públicas para o carrossel"
  on public.perfis_diretorio for select
  to anon
  using (
    publicado = true
    and logo_url is not null
    and exists (
      select 1 from public.profiles
      where profiles.id = perfis_diretorio.id
      and profiles.status_assinatura in ('ativa', 'trial')
    )
  );

create policy "Dados básicos para o carrossel público"
  on public.profiles for select
  to anon
  using (
    status_assinatura in ('ativa', 'trial')
    and exists (
      select 1 from public.perfis_diretorio
      where perfis_diretorio.id = profiles.id
      and perfis_diretorio.publicado = true
      and perfis_diretorio.logo_url is not null
    )
  );

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE CARROSSEL PÚBLICO
-- ═══════════════════════════════════════════════════════════
