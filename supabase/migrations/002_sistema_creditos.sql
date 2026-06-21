-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — SISTEMA DE CRÉDITOS DE BUSCA
-- Execute após o 001_schema_inicial.sql no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════

-- ═══ TABELA: creditos_usuario (saldo mensal de créditos) ═══
create table public.creditos_usuario (
  id uuid primary key references public.profiles(id) on delete cascade,
  creditos_disponiveis integer not null default 0,
  creditos_totais_ciclo integer not null default 100,
  ciclo_inicio timestamptz not null default now(),
  ciclo_fim timestamptz not null default (now() + interval '30 days'),
  atualizado_em timestamptz not null default now()
);

comment on table public.creditos_usuario is 'Saldo de créditos de busca por usuário, resetado a cada ciclo de cobrança';

-- ═══ TABELA: historico_buscas (registro de cada busca, para auditoria e relatórios) ═══
create table public.historico_buscas (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  segmento text not null,
  cidade text not null,
  estado text,
  raio_km integer not null,
  quantidade_empresas integer not null,
  creditos_gastos integer not null,
  criado_em timestamptz not null default now()
);

comment on table public.historico_buscas is 'Histórico de buscas realizadas, usado para auditoria de consumo de créditos';

create index idx_historico_buscas_profile on public.historico_buscas (profile_id);
create index idx_historico_buscas_data on public.historico_buscas (criado_em);

-- ═══ FUNÇÃO: custo em créditos por faixa de tamanho de busca ═══
create or replace function public.calcular_custo_creditos(quantidade integer)
returns integer as $$
begin
  if quantidade <= 10 then
    return 10;
  elsif quantidade <= 20 then
    return 18;
  elsif quantidade <= 30 then
    return 25;
  else
    return 30;
  end if;
end;
$$ language plpgsql immutable;

-- ═══ FUNÇÃO: inicializa créditos ao ativar assinatura ═══
-- Chamada pela Edge Function de webhook quando o pagamento é aprovado.
-- plano_anual = true concede 150 créditos/mês; caso contrário, 100/mês.
create or replace function public.inicializar_creditos(
  p_profile_id uuid,
  p_plano_anual boolean default false
)
returns void as $$
declare
  v_total integer;
begin
  v_total := case when p_plano_anual then 150 else 100 end;

  insert into public.creditos_usuario (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim)
  values (
    p_profile_id,
    v_total,
    v_total,
    now(),
    now() + interval '30 days'
  )
  on conflict (id) do update set
    creditos_disponiveis = v_total,
    creditos_totais_ciclo = v_total,
    ciclo_inicio = now(),
    ciclo_fim = now() + interval '30 days',
    atualizado_em = now();
end;
$$ language plpgsql security definer;

-- ═══ FUNÇÃO: consome créditos ao realizar uma busca (com trava atômica) ═══
-- Retorna true se havia créditos suficientes e a operação foi concluída.
-- Retorna false sem alterar nada se o saldo for insuficiente.
create or replace function public.consumir_creditos(
  p_profile_id uuid,
  p_quantidade_empresas integer,
  p_segmento text,
  p_cidade text,
  p_estado text,
  p_raio_km integer
)
returns table(sucesso boolean, creditos_restantes integer, custo integer) as $$
declare
  v_custo integer;
  v_saldo_atual integer;
  v_ciclo_fim timestamptz;
begin
  v_custo := public.calcular_custo_creditos(p_quantidade_empresas);

  -- Trava a linha para evitar condição de corrida em requisições simultâneas
  select creditos_disponiveis, ciclo_fim into v_saldo_atual, v_ciclo_fim
  from public.creditos_usuario
  where id = p_profile_id
  for update;

  -- Se não existe registro de créditos ainda, não pode buscar
  if v_saldo_atual is null then
    return query select false, 0, v_custo;
    return;
  end if;

  -- Se o ciclo já expirou, reseta automaticamente antes de cobrar
  if now() > v_ciclo_fim then
    update public.creditos_usuario
    set creditos_disponiveis = creditos_totais_ciclo,
        ciclo_inicio = now(),
        ciclo_fim = now() + interval '30 days',
        atualizado_em = now()
    where id = p_profile_id
    returning creditos_disponiveis into v_saldo_atual;
  end if;

  -- Verifica saldo suficiente
  if v_saldo_atual < v_custo then
    return query select false, v_saldo_atual, v_custo;
    return;
  end if;

  -- Debita os créditos
  update public.creditos_usuario
  set creditos_disponiveis = creditos_disponiveis - v_custo,
      atualizado_em = now()
  where id = p_profile_id;

  -- Registra no histórico
  insert into public.historico_buscas (
    profile_id, segmento, cidade, estado, raio_km, quantidade_empresas, creditos_gastos
  ) values (
    p_profile_id, p_segmento, p_cidade, p_estado, p_raio_km, p_quantidade_empresas, v_custo
  );

  return query select true, (v_saldo_atual - v_custo), v_custo;
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.creditos_usuario enable row level security;
alter table public.historico_buscas enable row level security;

-- O usuário só vê o próprio saldo de créditos
create policy "Usuário vê o próprio saldo de créditos"
  on public.creditos_usuario for select
  using (auth.uid() = id);

-- O usuário só vê o próprio histórico de buscas
create policy "Usuário vê o próprio histórico de buscas"
  on public.historico_buscas for select
  using (auth.uid() = profile_id);

-- Inserção/atualização de créditos e histórico é feita apenas via as funções
-- security definer acima (chamadas pelo backend), não diretamente pelo cliente.

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE CRÉDITOS
-- ═══════════════════════════════════════════════════════════
