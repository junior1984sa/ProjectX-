-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CORRIGE RECURSÃO INFINITA NAS POLÍTICAS DO CARROSSEL
-- Execute após 001 a 014 no SQL Editor do Supabase
--
-- SINTOMA:
-- A página inicial pública quebrava para qualquer visitante não
-- logado, com o erro no console do navegador:
--
--   Erro ao buscar itens do carrossel:
--   infinite recursion detected in policy for relation "profiles"
--
-- CAUSA:
-- A migration 010 criou duas políticas que se consultavam mutuamente:
--
--   profiles         → "Dados básicos para o carrossel público"
--                      consultava perfis_diretorio
--   perfis_diretorio → "Capas de perfis publicados são públicas..."
--                      consultava profiles
--
-- Ler uma tabela disparava a política da outra, que disparava a
-- política da primeira, indefinidamente. O Postgres detecta o ciclo e
-- aborta a consulta — derrubando o carrossel da home.
--
-- SOLUÇÃO:
-- Funções SECURITY DEFINER como intermediárias. Elas rodam com os
-- privilégios do dono da tabela e por isso NÃO reavaliam RLS, o que
-- interrompe o ciclo. É o padrão recomendado pelo próprio Supabase
-- para políticas que precisam olhar outra tabela.
--
-- `set search_path = public` é obrigatório aqui: sem ele, uma função
-- SECURITY DEFINER fica vulnerável a sequestro de resolução de nomes.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Intermediárias que leem sem reavaliar RLS ═══

create or replace function public.perfil_ativo_ou_trial(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_id
      and status_assinatura in ('ativa', 'trial')
  );
$$;

create or replace function public.diretorio_publicado_com_logo(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis_diretorio
    where id = p_id
      and publicado = true
      and logo_url is not null
  );
$$;

-- ═══ 2. Reescreve as duas políticas que formavam o ciclo ═══

drop policy if exists "Dados básicos para o carrossel público" on public.profiles;
create policy "Dados básicos para o carrossel público"
  on public.profiles for select to anon
  using (
    status_assinatura in ('ativa', 'trial')
    and public.diretorio_publicado_com_logo(id)
  );

drop policy if exists "Capas de perfis publicados são públicas para o carrossel" on public.perfis_diretorio;
create policy "Capas de perfis publicados são públicas para o carrossel"
  on public.perfis_diretorio for select to anon
  using (
    publicado = true
    and logo_url is not null
    and public.perfil_ativo_ou_trial(id)
  );

-- ═══ 3. Mesma troca na política de usuários logados ═══
-- Não participa do ciclo hoje (profiles não tem política equivalente
-- para `authenticated`), mas usa o mesmo subselect e voltaria a
-- recursar caso essa política fosse criada no futuro.

drop policy if exists "Perfis publicados de assinantes são visíveis a usuários loga" on public.perfis_diretorio;
create policy "Perfis publicados de assinantes são visíveis a usuários loga"
  on public.perfis_diretorio for select to authenticated
  using (
    publicado = true
    and public.perfil_ativo_ou_trial(id)
  );

grant execute on function public.perfil_ativo_ou_trial(uuid)        to anon, authenticated;
grant execute on function public.diretorio_publicado_com_logo(uuid) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════
-- COMO CONFERIR QUE FUNCIONOU (deve retornar sem erro):
--
--   set local role anon;
--   select count(*) from public.perfis_diretorio;
--   select count(*) from public.profiles;
-- ═══════════════════════════════════════════════════════════
