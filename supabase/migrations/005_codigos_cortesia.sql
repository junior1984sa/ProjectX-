-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CÓDIGOS DE CORTESIA (acesso gratuito por convite)
-- Execute após 001, 002, 003 e 004 no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════

-- ═══ TABELA: codigos_cortesia ═══
create table public.codigos_cortesia (
  id uuid primary key default uuid_generate_v4(),
  codigo text not null unique,
  dias_gratis integer not null default 14,
  usos_maximos integer not null default 1,
  usos_atuais integer not null default 0,
  ativo boolean not null default true,
  observacao text,
  criado_em timestamptz not null default now(),
  expira_em timestamptz
);

comment on table public.codigos_cortesia is 'Códigos de cortesia que liberam acesso gratuito por X dias, sem precisar de cartão. Usados para parceiros, testes, presentes.';

-- ═══ TABELA: codigos_cortesia_uso (registro de quem usou qual código) ═══
create table public.codigos_cortesia_uso (
  id uuid primary key default uuid_generate_v4(),
  codigo_id uuid not null references public.codigos_cortesia(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  usado_em timestamptz not null default now(),
  unique (codigo_id, profile_id)
);

comment on table public.codigos_cortesia_uso is 'Garante que cada usuário só usa um código de cortesia específico uma vez';

-- ═══ FUNÇÃO: aplica um código de cortesia ao perfil do usuário ═══
-- Retorna sucesso=false com uma mensagem de erro clara se o código for
-- inválido, expirado, esgotado, ou já usado por esse mesmo usuário.
create or replace function public.aplicar_codigo_cortesia(
  p_profile_id uuid,
  p_codigo text
)
returns table(sucesso boolean, mensagem text, dias_concedidos integer) as $$
declare
  v_codigo_registro record;
  v_ja_usou boolean;
begin
  -- Busca o código (case-insensitive, sem espaços nas pontas)
  select * into v_codigo_registro
  from public.codigos_cortesia
  where lower(trim(codigo)) = lower(trim(p_codigo))
  for update;

  if v_codigo_registro is null then
    return query select false, 'Código inválido.', 0;
    return;
  end if;

  if not v_codigo_registro.ativo then
    return query select false, 'Este código não está mais ativo.', 0;
    return;
  end if;

  if v_codigo_registro.expira_em is not null and now() > v_codigo_registro.expira_em then
    return query select false, 'Este código expirou.', 0;
    return;
  end if;

  if v_codigo_registro.usos_atuais >= v_codigo_registro.usos_maximos then
    return query select false, 'Este código já atingiu o limite de usos.', 0;
    return;
  end if;

  select exists(
    select 1 from public.codigos_cortesia_uso
    where codigo_id = v_codigo_registro.id and profile_id = p_profile_id
  ) into v_ja_usou;

  if v_ja_usou then
    return query select false, 'Você já usou este código antes.', 0;
    return;
  end if;

  -- Aplica o trial estendido no perfil (reaproveita a função iniciar_trial,
  -- que também concede os créditos proporcionais ao período)
  perform public.iniciar_trial(p_profile_id, v_codigo_registro.dias_gratis);

  -- Marca o uso e incrementa o contador
  insert into public.codigos_cortesia_uso (codigo_id, profile_id)
  values (v_codigo_registro.id, p_profile_id);

  update public.codigos_cortesia
  set usos_atuais = usos_atuais + 1
  where id = v_codigo_registro.id;

  return query select true, 'Código aplicado com sucesso!', v_codigo_registro.dias_gratis;
end;
$$ language plpgsql security definer;

-- Garante que qualquer usuário autenticado possa chamar esta função via RPC
grant execute on function public.aplicar_codigo_cortesia(uuid, text) to authenticated;

-- ═══ RLS ═══
alter table public.codigos_cortesia enable row level security;
alter table public.codigos_cortesia_uso enable row level security;

-- Ninguém lê a tabela de códigos diretamente (evita listar/descobrir códigos
-- válidos por consulta). A validação acontece só via a função acima.
-- (Nenhuma policy de SELECT é criada propositalmente — RLS sem policies
-- bloqueia todo acesso direto via cliente.)

create policy "Usuário vê os próprios usos de código"
  on public.codigos_cortesia_uso for select
  using (auth.uid() = profile_id);

-- ═══ Cria os 3 códigos de cortesia solicitados (14 dias, 1 uso cada) ═══
insert into public.codigos_cortesia (codigo, dias_gratis, usos_maximos, observacao)
values
  ('OBRIGADO-AMIGO1', 14, 1, 'Cortesia para colaborador/parceiro #1'),
  ('OBRIGADO-AMIGO2', 14, 1, 'Cortesia para colaborador/parceiro #2'),
  ('OBRIGADO-AMIGO3', 14, 1, 'Cortesia para colaborador/parceiro #3');

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE CÓDIGOS DE CORTESIA
-- ═══════════════════════════════════════════════════════════
