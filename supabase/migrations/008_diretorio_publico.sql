-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — DIRETÓRIO PÚBLICO (busca direta de prestadores)
-- Execute após 001 a 007 no SQL Editor do Supabase
--
-- Cria um segundo perfil, mais rico, pensado para ser encontrado
-- por outras empresas que buscam um prestador diretamente — em
-- vez de só ser usado para prospecção ativa (sair buscando clientes).
--
-- Regra de negócio: só assinantes ATIVOS (ou em trial) aparecem
-- no diretório. Qualquer empresa com conta pode BUSCAR no diretório,
-- mesmo sem assinatura — mas só quem paga é encontrado.
-- ═══════════════════════════════════════════════════════════

-- ═══ TABELA: perfis_diretorio (perfil público, separado do de prospecção) ═══
create table public.perfis_diretorio (
  id uuid primary key references public.profiles(id) on delete cascade,
  titulo_publico text not null,
  descricao_completa text not null,
  area_atendimento text,
  anos_de_mercado integer,
  certificacoes text,
  tempo_resposta_estimado text,
  logo_url text,
  publicado boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.perfis_diretorio is 'Perfil público e mais completo, exibido no diretório de busca direta. Separado do perfil de prospecção (profiles).';

-- ═══ TABELA: fotos_trabalhos (galeria de fotos do prestador) ═══
create table public.fotos_trabalhos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url_foto text not null,
  legenda text,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

comment on table public.fotos_trabalhos is 'Galeria de fotos de trabalhos realizados, exibida no perfil público do diretório';

create index idx_fotos_trabalhos_profile on public.fotos_trabalhos (profile_id);

-- ═══ TRIGGER: atualizar timestamp ═══
create trigger trigger_perfis_diretorio_atualizado
  before update on public.perfis_diretorio
  for each row execute function public.atualizar_timestamp();

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.perfis_diretorio enable row level security;
alter table public.fotos_trabalhos enable row level security;

create policy "Perfis publicados de assinantes são visíveis a usuários logados"
  on public.perfis_diretorio for select
  to authenticated
  using (
    publicado = true
    and exists (
      select 1 from public.profiles
      where profiles.id = perfis_diretorio.id
      and profiles.status_assinatura in ('ativa', 'trial')
    )
  );

create policy "Usuário vê e edita o próprio perfil de diretório"
  on public.perfis_diretorio for select
  using (auth.uid() = id);

create policy "Usuário cria o próprio perfil de diretório"
  on public.perfis_diretorio for insert
  with check (auth.uid() = id);

create policy "Usuário atualiza o próprio perfil de diretório"
  on public.perfis_diretorio for update
  using (auth.uid() = id);

create policy "Fotos de perfis publicados e ativos são visíveis a usuários logados"
  on public.fotos_trabalhos for select
  to authenticated
  using (
    exists (
      select 1 from public.perfis_diretorio pd
      join public.profiles p on p.id = pd.id
      where pd.id = fotos_trabalhos.profile_id
      and pd.publicado = true
      and p.status_assinatura in ('ativa', 'trial')
    )
  );

create policy "Usuário vê as próprias fotos sempre"
  on public.fotos_trabalhos for select
  using (auth.uid() = profile_id);

create policy "Usuário insere as próprias fotos"
  on public.fotos_trabalhos for insert
  with check (auth.uid() = profile_id);

create policy "Usuário remove as próprias fotos"
  on public.fotos_trabalhos for delete
  using (auth.uid() = profile_id);

-- ═══════════════════════════════════════════════════════════
-- STORAGE: bucket para fotos de trabalhos do diretório
-- ═══════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('fotos-trabalhos', 'fotos-trabalhos', true)
on conflict (id) do nothing;

create policy "Fotos do bucket fotos-trabalhos são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'fotos-trabalhos');

create policy "Usuário envia foto na própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-trabalhos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Usuário remove foto da própria pasta"
  on storage.objects for delete
  using (
    bucket_id = 'fotos-trabalhos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE DIRETÓRIO PÚBLICO
-- ═══════════════════════════════════════════════════════════
