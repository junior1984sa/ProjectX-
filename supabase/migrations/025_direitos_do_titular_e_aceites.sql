-- ═══════════════════════════════════════════════════════════
-- DIREITOS DO TITULAR, EXCLUSÃO DE CONTA E REGISTRO DE ACEITE
--
-- Os documentos jurídicos prometem três coisas que o código não
-- sabia executar. Publicar a política antes de construir isto
-- transformaria o documento em prova contra a própria empresa:
-- promete-se exclusão em 30 dias sem existir função de exclusão.
--
-- C2 — exclusão e anonimização de conta
-- C3 — pedidos de titular (acesso, correção, exclusão, oposição)
-- C4 — expurgo agendado, em vez de comando que ninguém chama
-- C7 — registro de aceite COM VERSÃO do documento
-- ═══════════════════════════════════════════════════════════

-- ── C7: aceite de documento, com versão ─────────────────────
--
-- "Uso continuado após alteração é aceitação" só se sustenta se
-- houver prova de A QUE VERSÃO o assinante aderiu. Guardar apenas
-- um booleano "aceitou" não prova nada quando o texto muda.

create table if not exists public.aceites_documentos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  documento text not null check (documento in ('termos', 'privacidade', 'uso_aceitavel')),
  versao text not null,
  aceito_em timestamptz not null default now(),
  -- Endereço de origem do aceite. É dado pessoal e entra na política
  -- de retenção como qualquer outro; existe para valer como prova.
  ip inet,
  user_agent text
);

create index if not exists idx_aceites_profile
  on public.aceites_documentos (profile_id, documento, aceito_em desc);

alter table public.aceites_documentos enable row level security;

-- O assinante lê os próprios aceites. Ninguém insere pelo cliente:
-- aceite gravado pelo navegador é aceite que o navegador pode forjar.
drop policy if exists "titular le os proprios aceites" on public.aceites_documentos;
create policy "titular le os proprios aceites"
  on public.aceites_documentos for select
  using (auth.uid() = profile_id);

create or replace function public.registrar_aceite(
  p_documento text,
  p_versao text,
  p_ip inet default null,
  p_user_agent text default null
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
    raise exception 'Aceite exige usuario autenticado';
  end if;

  insert into public.aceites_documentos (profile_id, documento, versao, ip, user_agent)
  values (auth.uid(), p_documento, p_versao, p_ip, p_user_agent)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.registrar_aceite(text, text, inet, text) from anon;
grant execute on function public.registrar_aceite(text, text, inet, text) to authenticated;

-- ── C3: pedidos de titular ──────────────────────────────────
--
-- Vale para DUAS populações diferentes, e é por isso que o
-- solicitante não é um `profile_id`:
--   1. o assinante, sobre os dados dele;
--   2. a PESSOA de uma empresa indexada, que nunca teve conta aqui
--      e mesmo assim tem direito de acesso, correção e exclusão.
-- A segunda é a que a maioria das implementações esquece.

create table if not exists public.pedidos_titular (
  id uuid primary key default gen_random_uuid(),
  -- Nulo quando quem pede não é assinante
  profile_id uuid references public.profiles(id) on delete set null,
  email_solicitante text not null,
  tipo text not null check (tipo in (
    'acesso', 'correcao', 'exclusao', 'oposicao', 'portabilidade', 'restricao'
  )),
  descricao text,
  status text not null default 'recebido'
    check (status in ('recebido', 'em_analise', 'atendido', 'recusado')),
  -- Prazo legal mais curto entre as jurisdições que atendemos.
  -- Nasce preenchido para que o atraso seja visível sem ninguém
  -- precisar lembrar de calcular.
  prazo_resposta timestamptz not null default (now() + interval '30 days'),
  respondido_em timestamptz,
  resposta text,
  criado_em timestamptz not null default now()
);

create index if not exists idx_pedidos_titular_pendentes
  on public.pedidos_titular (status, prazo_resposta)
  where status in ('recebido', 'em_analise');

alter table public.pedidos_titular enable row level security;

-- Sem política para `anon` e `authenticated`: o pedido entra por
-- função controlada, e a leitura é só do administrador. Um assinante
-- não pode ler o pedido de exclusão de outra pessoa.
drop policy if exists "admin le pedidos" on public.pedidos_titular;
create policy "admin le pedidos"
  on public.pedidos_titular for select
  using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true)
  );

create or replace function public.abrir_pedido_titular(
  p_email text,
  p_tipo text,
  p_descricao text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'E-mail invalido';
  end if;

  insert into public.pedidos_titular (profile_id, email_solicitante, tipo, descricao)
  values (auth.uid(), lower(trim(p_email)), p_tipo, p_descricao)
  returning id into v_id;

  return v_id;
end;
$$;

-- Aberto ao anônimo DE PROPÓSITO: quem foi indexado sem nunca ter
-- conta precisa conseguir exercer o direito sem criar uma. Exigir
-- cadastro para pedir exclusão seria coletar mais dado de quem está
-- justamente pedindo para sair.
grant execute on function public.abrir_pedido_titular(text, text, text) to anon, authenticated;

-- ── C2: exclusão e anonimização de conta ────────────────────

create or replace function public.excluir_minha_conta()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_email text;
begin
  if v_id is null then
    raise exception 'Exclusao exige usuario autenticado';
  end if;

  select email_contato into v_email from public.profiles where id = v_id;

  -- Registra o pedido ANTES de apagar. Sem isso não há como provar
  -- ao regulador que a exclusão foi solicitada e cumprida.
  insert into public.pedidos_titular (
    profile_id, email_solicitante, tipo, descricao, status, respondido_em, resposta
  ) values (
    null, coalesce(v_email, 'desconhecido@exclusao'), 'exclusao',
    'Exclusao solicitada pelo proprio assinante na interface',
    'atendido', now(), 'Conta anonimizada'
  );

  -- ANONIMIZA em vez de apagar a linha.
  --
  -- Apagar quebraria as referências do histórico de créditos e das
  -- buscas, que a contabilidade precisa reter. O que a lei exige é
  -- que o dado deixe de ser atribuível a uma pessoa — e um perfil
  -- sem nome, sem contato e sem endereço não é mais.
  update public.profiles set
    nome_empresa = 'Conta excluida',
    segmento = '',
    cidade = '',
    estado = '',
    endereco_postal = null,
    nome_contato = '',
    whatsapp = '',
    email_contato = concat('excluido+', v_id::text, '@invalido.local'),
    descricao = null,
    website = null,
    latitude = null,
    longitude = null,
    status_assinatura = 'cancelada',
    atualizado_em = now()
  where id = v_id;

  -- Conteúdo do assinante sai de vez: histórico de quem ele abordou
  -- é dado de terceiro que não temos motivo para reter depois que a
  -- conta acaba.
  delete from public.prospeccao_contatos where profile_id = v_id;
  delete from public.aceites_documentos where profile_id = v_id;

  -- A LISTA DE SUPRESSÃO NÃO É TOCADA.
  --
  -- Este é o paradoxo do opt-out: se apagássemos as supressões junto
  -- com a conta, todo mundo que pediu para nunca mais ser contatado
  -- voltaria a ser contatável. Preservar a supressão é o que protege
  -- o titular — mesmo custando um dado guardado a mais.

  return jsonb_build_object('sucesso', true, 'anonimizado_em', now());
end;
$$;

revoke all on function public.excluir_minha_conta() from anon;
grant execute on function public.excluir_minha_conta() to authenticated;

-- ── C4: expurgo agendado ────────────────────────────────────
--
-- O comando de limpeza do cache existia, mas nada o chamava. Uma
-- política de retenção que depende de alguém lembrar de rodar não
-- é política de retenção — é intenção.

create extension if not exists pg_cron;

create or replace function public.expurgo_retencao()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.cache_buscas where expira_em < now();

  -- Aceites de contas já anonimizadas não têm mais função probatória
  delete from public.aceites_documentos a
  where not exists (select 1 from public.profiles p where p.id = a.profile_id);

  -- Pedidos encerrados há mais de 2 anos. O prazo existe para poder
  -- demonstrar atendimento em eventual fiscalização; passado isso,
  -- reter vira acúmulo sem finalidade.
  delete from public.pedidos_titular
  where status in ('atendido', 'recusado')
    and respondido_em < now() - interval '2 years';
end;
$$;

revoke all on function public.expurgo_retencao() from anon, authenticated;

select cron.schedule(
  'expurgo-retencao-diario',
  '17 4 * * *',
  $$select public.expurgo_retencao()$$
);

comment on table public.pedidos_titular is
  'Pedidos de direito do titular (LGPD art. 18, UK GDPR arts. 15-22, CCPA). '
  'Aceita pedido de quem NAO e assinante: empresa indexada tem direito '
  'sem nunca ter tido conta.';

comment on function public.excluir_minha_conta() is
  'Anonimiza o perfil e apaga o conteudo do assinante. NAO toca a lista '
  'de supressao: apagar as supressoes junto tornaria contatavel de novo '
  'todo mundo que pediu para sair.';
