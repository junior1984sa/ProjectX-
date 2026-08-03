-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — TETO DIÁRIO NA JANELA DE ARREPENDIMENTO
-- Execute após 001 a 020 no SQL Editor do Supabase
--
-- MOTIVO (jurídico e financeiro):
-- O art. 49 do CDC dá 7 dias para desistir com reembolso INTEGRAL, e
-- cobrar "taxa de uso" ou descontar créditos consumidos é considerado
-- abusivo. A exposição real, portanto, é: quanto o cliente consegue
-- gastar dentro desses 7 dias.
--
-- O trial já concedia apenas 20 créditos (migration 013). O buraco
-- estava DEPOIS: ao virar cobrança, o cliente recebia 100 de uma vez.
-- Gastando tudo em dois dias e pedindo reembolso no quinto, o
-- reembolso é integral e a API já foi paga.
--
-- O teto de 20/dia fecha essa janela sem prejudicar quem fica: passados
-- os 7 dias, o saldo inteiro libera. Há um ganho extra de retenção —
-- limite diário força o cliente a voltar todo dia, e quem entra sete
-- dias seguidos converte muito mais do que quem gasta tudo e some.
--
-- SÓ VALE PARA A PRIMEIRA COBRANÇA: renovação de quem já é cliente não
-- reabre janela de arrependimento nem teto.
-- ═══════════════════════════════════════════════════════════

alter table public.creditos_usuario
  add column if not exists primeira_cobranca_em timestamptz,
  add column if not exists gasto_hoje integer not null default 0,
  add column if not exists dia_referencia date;

comment on column public.creditos_usuario.primeira_cobranca_em is
  'Quando a primeira cobranca foi confirmada. O teto diario vale por 7 dias a partir daqui.';

-- ═══ Renovação por pagamento, marcando a primeira cobrança ═══

create or replace function public.inicializar_creditos_por_plano(
  p_profile_id uuid,
  p_plano text default 'mensal',
  p_referencia text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_ja_creditado boolean;
begin
  v_total := case lower(trim(p_plano))
    when 'anual'      then 150
    when 'semestral'  then 135
    when 'trimestral' then 120
    else 100
  end;

  if p_referencia is not null then
    select (ultimo_credito_ref = p_referencia)
      into v_ja_creditado
      from public.creditos_usuario
     where id = p_profile_id;

    if coalesce(v_ja_creditado, false) then
      return;
    end if;
  end if;

  insert into public.creditos_usuario
    (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim,
     ultimo_credito_ref, primeira_cobranca_em)
  values
    (p_profile_id, v_total, v_total, now(), now() + interval '30 days',
     p_referencia, now())
  on conflict (id) do update set
    creditos_disponiveis  = public.creditos_usuario.creditos_disponiveis + v_total,
    creditos_totais_ciclo = v_total,
    ciclo_inicio          = now(),
    ciclo_fim             = now() + interval '30 days',
    ultimo_credito_ref    = p_referencia,
    -- coalesce garante que só a PRIMEIRA cobrança marca a data
    primeira_cobranca_em  = coalesce(public.creditos_usuario.primeira_cobranca_em, now()),
    atualizado_em         = now();
end;
$$;

-- ═══ Consumo com teto diário ═══
-- A assinatura muda (ganha `motivo`), por isso precisa recriar em vez
-- de usar CREATE OR REPLACE.

drop function if exists public.consumir_creditos(uuid, integer, text, text, text, integer);

create or replace function public.consumir_creditos(
  p_profile_id uuid,
  p_quantidade_empresas integer,
  p_segmento text,
  p_cidade text,
  p_estado text,
  p_raio_km integer
)
returns table(sucesso boolean, creditos_restantes integer, custo integer, motivo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_custo integer;
  v_saldo_atual integer;
  v_ciclo_fim timestamptz;
  v_status text;
  v_primeira timestamptz;
  v_gasto_hoje integer;
  v_dia date;
  v_teto_diario constant integer := 20;
begin
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'Nao e permitido consumir creditos de outro usuario';
  end if;

  v_custo := public.calcular_custo_creditos(p_quantidade_empresas);

  select creditos_disponiveis, ciclo_fim, primeira_cobranca_em, gasto_hoje, dia_referencia
    into v_saldo_atual, v_ciclo_fim, v_primeira, v_gasto_hoje, v_dia
  from public.creditos_usuario
  where id = p_profile_id
  for update;

  if v_saldo_atual is null then
    return query select false, 0, v_custo, 'sem_creditos';
    return;
  end if;

  select status_assinatura into v_status
  from public.profiles where id = p_profile_id;

  if now() > v_ciclo_fim and v_status = 'ativa' then
    update public.creditos_usuario
    set creditos_disponiveis = creditos_disponiveis + creditos_totais_ciclo,
        ciclo_inicio = now(),
        ciclo_fim = now() + interval '30 days',
        atualizado_em = now()
    where id = p_profile_id
    returning creditos_disponiveis into v_saldo_atual;
  end if;

  -- Zera o contador quando vira o dia
  if v_dia is distinct from current_date then
    v_gasto_hoje := 0;
    update public.creditos_usuario
    set gasto_hoje = 0, dia_referencia = current_date
    where id = p_profile_id;
  end if;

  -- Teto diário, só nos 7 dias seguintes à primeira cobrança
  if v_primeira is not null and now() < v_primeira + interval '7 days' then
    if coalesce(v_gasto_hoje, 0) + v_custo > v_teto_diario then
      -- Devolve quanto sobra NO DIA, não o saldo total: é o número que
      -- a tela precisa mostrar para não parecer que os créditos acabaram
      return query select false, (v_teto_diario - coalesce(v_gasto_hoje, 0)), v_custo, 'limite_diario';
      return;
    end if;
  end if;

  if v_saldo_atual < v_custo then
    return query select false, v_saldo_atual, v_custo, 'sem_creditos';
    return;
  end if;

  update public.creditos_usuario
  set creditos_disponiveis = creditos_disponiveis - v_custo,
      gasto_hoje = coalesce(gasto_hoje, 0) + v_custo,
      dia_referencia = current_date,
      atualizado_em = now()
  where id = p_profile_id;

  insert into public.historico_buscas (
    profile_id, segmento, cidade, estado, raio_km, quantidade_empresas, creditos_gastos
  ) values (
    p_profile_id, p_segmento, p_cidade, p_estado, p_raio_km, p_quantidade_empresas, v_custo
  );

  return query select true, (v_saldo_atual - v_custo), v_custo, 'ok';
end;
$$;

revoke all on function public.consumir_creditos(uuid, integer, text, text, text, integer) from public, anon;
grant execute on function public.consumir_creditos(uuid, integer, text, text, text, integer) to authenticated, service_role;

revoke all on function public.inicializar_creditos_por_plano(uuid, text, text) from public, anon, authenticated;
grant execute on function public.inicializar_creditos_por_plano(uuid, text, text) to service_role;

-- ═══════════════════════════════════════════════════════════
-- PARA AJUSTAR O TETO: altere v_teto_diario acima e reexecute a função.
-- 20 foi escolhido por ser o custo de duas buscas pequenas por dia —
-- o suficiente para avaliar a ferramenta, pouco o bastante para não
-- virar prejuízo caso o cliente exerça o direito de arrependimento.
-- ═══════════════════════════════════════════════════════════
