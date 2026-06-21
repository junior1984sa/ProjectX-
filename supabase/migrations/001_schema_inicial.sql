-- ═══════════════════════════════════════════════════════════
-- PROSPECTPRO — SCHEMA COMPLETO DO BANCO DE DADOS
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- (Project > SQL Editor > New query > cole tudo > Run)
-- ═══════════════════════════════════════════════════════════

-- Extensão para gerar UUIDs
create extension if not exists "uuid-ossp";

-- ═══ TABELA: profiles (perfil do prestador de serviço) ═══
-- Ligada 1:1 com auth.users (criada automaticamente no cadastro)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_empresa text not null,
  segmento text not null,
  cidade text not null,
  estado text not null,
  nome_contato text not null,
  whatsapp text not null,
  email_contato text not null,
  descricao text,
  website text,
  latitude double precision,
  longitude double precision,
  status_assinatura text not null default 'pendente'
    check (status_assinatura in ('pendente', 'ativa', 'atraso', 'cancelada')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público do prestador de serviço, um por usuário autenticado';
comment on column public.profiles.status_assinatura is 'pendente = nunca pagou; ativa = assinatura paga e em dia; atraso = pagamento falhou; cancelada = cancelou';

-- ═══ TABELA: arquivos_portfolio (uploads do prestador) ═══
create table public.arquivos_portfolio (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nome_arquivo text not null,
  url_storage text not null,
  tipo text not null default 'portfolio'
    check (tipo in ('portfolio', 'proposta', 'panfleto', 'outro')),
  tamanho_bytes bigint,
  criado_em timestamptz not null default now()
);

comment on table public.arquivos_portfolio is 'Arquivos enviados pelo prestador: portfólio, proposta comercial, panfleto, etc.';

-- ═══ TABELA: assinaturas (histórico de cobranças) ═══
create table public.assinaturas (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plano text not null check (plano in ('mensal', 'anual')),
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  mercadopago_subscription_id text,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovada', 'rejeitada', 'cancelada', 'em_atraso')),
  valor numeric(10,2) not null,
  data_inicio timestamptz,
  proxima_cobranca timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.assinaturas is 'Histórico de assinaturas e cobranças via Mercado Pago';

-- ═══ ÍNDICES para performance de busca ═══
create index idx_profiles_segmento on public.profiles (segmento);
create index idx_profiles_cidade on public.profiles (cidade);
create index idx_profiles_status on public.profiles (status_assinatura);
create index idx_arquivos_profile on public.arquivos_portfolio (profile_id);
create index idx_assinaturas_profile on public.assinaturas (profile_id);

-- ═══ TRIGGER: atualizar campo atualizado_em automaticamente ═══
create or replace function public.atualizar_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_profiles_atualizado
  before update on public.profiles
  for each row execute function public.atualizar_timestamp();

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — regras de quem pode ver/editar o quê
-- ═══════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.arquivos_portfolio enable row level security;
alter table public.assinaturas enable row level security;

-- ── PROFILES ──

-- Qualquer pessoa (logada ou não) pode VER perfis com assinatura ativa
-- Isso alimenta o diretório público de prestadores
create policy "Perfis ativos são públicos"
  on public.profiles for select
  using (status_assinatura = 'ativa');

-- O próprio usuário pode ver seu perfil mesmo se não estiver ativo ainda
create policy "Usuário vê o próprio perfil sempre"
  on public.profiles for select
  using (auth.uid() = id);

-- O próprio usuário pode criar seu perfil (só uma vez, id = seu auth.uid())
create policy "Usuário cria o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- O próprio usuário pode atualizar seu perfil
create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ── ARQUIVOS_PORTFOLIO ──

-- Arquivos de perfis ativos são visíveis publicamente (parte do perfil público)
create policy "Arquivos de perfis ativos são públicos"
  on public.arquivos_portfolio for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = arquivos_portfolio.profile_id
      and profiles.status_assinatura = 'ativa'
    )
  );

-- O dono pode ver seus próprios arquivos sempre
create policy "Usuário vê os próprios arquivos sempre"
  on public.arquivos_portfolio for select
  using (auth.uid() = profile_id);

-- O dono pode inserir arquivos no próprio perfil
create policy "Usuário insere arquivos no próprio perfil"
  on public.arquivos_portfolio for insert
  with check (auth.uid() = profile_id);

-- O dono pode deletar seus próprios arquivos
create policy "Usuário remove os próprios arquivos"
  on public.arquivos_portfolio for delete
  using (auth.uid() = profile_id);

-- ── ASSINATURAS ──

-- O dono só vê suas próprias assinaturas (dados financeiros são privados)
create policy "Usuário vê as próprias assinaturas"
  on public.assinaturas for select
  using (auth.uid() = profile_id);

-- Inserção de assinaturas é feita via Edge Function com service_role
-- (não expomos insert/update para o usuário comum por segurança)

-- ═══════════════════════════════════════════════════════════
-- STORAGE: bucket para upload de portfólio/proposta/panfleto
-- ═══════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

-- Qualquer um pode visualizar arquivos do bucket (já que o perfil é público)
create policy "Arquivos do bucket portfolios são públicos para leitura"
  on storage.objects for select
  using (bucket_id = 'portfolios');

-- Usuário autenticado pode enviar arquivo na própria pasta (nomeada com seu uid)
create policy "Usuário envia arquivo na própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuário autenticado pode deletar arquivo da própria pasta
create policy "Usuário remove arquivo da própria pasta"
  on storage.objects for delete
  using (
    bucket_id = 'portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ═══════════════════════════════════════════════════════════
-- FIM DO SCHEMA
-- ═══════════════════════════════════════════════════════════
