-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — REGISTRO DE PROSPECÇÃO E LISTA DE DESCADASTRO
-- Execute após 001 a 018 no SQL Editor do Supabase
--
-- Base para o disparo em lote e para o controle de "já contatei".
--
-- POR QUE A LISTA DE DESCADASTRO É GLOBAL:
-- O opt-out NÃO é por assinante, de propósito. Se uma empresa pediu
-- para não ser mais contatada, nenhum usuário do ProspectX deve
-- contatá-la de novo. Um opt-out por assinante deixaria a mesma
-- empresa exposta a 100 abordagens diferentes — exatamente o que a
-- LGPD quer impedir, e o que destruiria a reputação do produto.
--
-- CONTEXTO LEGAL (Brasil):
-- E-mail frio B2B é lícito pelo Art. 7º, IX da LGPD (legítimo
-- interesse), desde que: e-mail corporativo, conteúdo relevante para
-- a atividade da empresa, identificação clara de quem envia e
-- descadastro funcionando. A ANPD passou a fiscalizar em 2025, com
-- multa de até 2% do faturamento (teto de R$ 50 milhões).
--
-- O registro de origem e data em `prospeccao_contatos` é justamente a
-- defesa exigida em caso de fiscalização — por isso ele não é apenas
-- uma conveniência de produto.
--
-- WHATSAPP É DIFERENTE:
-- Disparo em massa por ferramenta não oficial é detectável no
-- protocolo e resulta em banimento, não em aviso. A API oficial exige
-- opt-in prévio, que empresas prospectadas a frio nunca deram. Por
-- isso o WhatsApp aqui é sempre um a um, iniciado por clique humano —
-- o que esta tabela apenas registra, sem automatizar o envio.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Quem já foi abordado ═══

create table if not exists public.prospeccao_contatos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,

  empresa_nome text not null,
  empresa_telefone text,
  empresa_email text,
  cidade text,
  estado text,
  pais text not null default 'BR',

  -- Chave estável para deduplicar entre buscas diferentes. O
  -- OpenStreetMap nem sempre devolve um id utilizável, então
  -- normalizamos nome + cidade em minúsculas e sem espaços nas pontas.
  chave_empresa text not null,

  canal text not null default 'whatsapp'
    check (canal in ('whatsapp', 'email', 'telefone', 'outro')),

  status text not null default 'pendente'
    check (status in ('pendente', 'contatado', 'respondeu', 'sem_resposta', 'fechou', 'descartado')),

  contatado_em timestamptz,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  unique (profile_id, chave_empresa)
);

comment on table public.prospeccao_contatos is
  'Empresas que cada assinante ja abordou. Evita contato repetido e serve de registro para a LGPD.';

create index if not exists idx_prospeccao_perfil on public.prospeccao_contatos (profile_id, status);
create index if not exists idx_prospeccao_chave  on public.prospeccao_contatos (profile_id, chave_empresa);

-- ═══ 2. Descadastro, global ═══

create table if not exists public.prospeccao_optout (
  id uuid primary key default uuid_generate_v4(),
  email text,
  telefone text,
  motivo text,
  origem text not null default 'link_descadastro',
  criado_em timestamptz not null default now(),
  constraint pelo_menos_um_contato check (email is not null or telefone is not null)
);

comment on table public.prospeccao_optout is
  'Descadastros. Global de proposito: vale para todos os assinantes, nao so para quem recebeu o pedido.';

create unique index if not exists idx_optout_email    on public.prospeccao_optout (lower(email)) where email is not null;
create unique index if not exists idx_optout_telefone on public.prospeccao_optout (telefone)     where telefone is not null;

-- ═══ 3. Esta empresa pode ser abordada? ═══

create or replace function public.pode_abordar(
  p_email text default null,
  p_telefone text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.prospeccao_optout
    where (p_email    is not null and lower(email) = lower(p_email))
       or (p_telefone is not null and telefone     = p_telefone)
  );
$$;

-- ═══ 4. Registrar um contato feito ═══

create or replace function public.registrar_contato(
  p_empresa_nome text,
  p_chave_empresa text,
  p_canal text default 'whatsapp',
  p_telefone text default null,
  p_email text default null,
  p_cidade text default null,
  p_estado text default null,
  p_pais text default 'BR'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Necessario estar logado';
  end if;

  if not public.pode_abordar(p_email, p_telefone) then
    raise exception 'Esta empresa pediu para nao ser contatada';
  end if;

  insert into public.prospeccao_contatos (
    profile_id, empresa_nome, chave_empresa, canal,
    empresa_telefone, empresa_email, cidade, estado, pais,
    status, contatado_em
  ) values (
    auth.uid(), p_empresa_nome, p_chave_empresa, p_canal,
    p_telefone, p_email, p_cidade, p_estado, p_pais,
    'contatado', now()
  )
  on conflict (profile_id, chave_empresa) do update set
    status = 'contatado',
    canal = excluded.canal,
    contatado_em = now(),
    atualizado_em = now()
  returning id into v_id;

  return v_id;
end;
$$;

-- ═══ 5. Segurança ═══

alter table public.prospeccao_contatos enable row level security;
alter table public.prospeccao_optout   enable row level security;

drop policy if exists "Usuario ve os proprios contatos" on public.prospeccao_contatos;
create policy "Usuario ve os proprios contatos"
  on public.prospeccao_contatos for select to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Usuario atualiza os proprios contatos" on public.prospeccao_contatos;
create policy "Usuario atualiza os proprios contatos"
  on public.prospeccao_contatos for update to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Usuario remove os proprios contatos" on public.prospeccao_contatos;
create policy "Usuario remove os proprios contatos"
  on public.prospeccao_contatos for delete to authenticated
  using (auth.uid() = profile_id);

-- A lista de descadastro NÃO é legível pelo cliente: saber quem pediu
-- descadastro não ajuda a prospectar e exporia dados de terceiros. A
-- checagem acontece apenas através da função pode_abordar().

revoke all on function public.registrar_contato(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.registrar_contato(text, text, text, text, text, text, text, text) to authenticated, service_role;

revoke all on function public.pode_abordar(text, text) from public, anon;
grant execute on function public.pode_abordar(text, text) to authenticated, service_role;

-- ═══════════════════════════════════════════════════════════
-- COMO REGISTRAR UM DESCADASTRO MANUALMENTE (ex: pedido por telefone):
--
--   insert into public.prospeccao_optout (email, telefone, motivo, origem)
--   values ('contato@empresa.com', null, 'pediu por telefone', 'manual');
--
-- O link de descadastro no rodapé dos e-mails deve gravar aqui
-- automaticamente. Sem ele funcionando, o disparo em lote não é
-- lícito — não é opcional.
-- ═══════════════════════════════════════════════════════════
