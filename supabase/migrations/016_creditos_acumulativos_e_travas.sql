-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CRÉDITOS ACUMULATIVOS + TRAVAS DE SEGURANÇA
-- Execute após 001 a 015 no SQL Editor do Supabase
--
-- MUDANÇA DE REGRA DE NEGÓCIO:
-- Os créditos deixam de ser "use ou perca". O que sobrar no ciclo
-- permanece com o assinante e soma à franquia do ciclo seguinte.
-- Quem usar 50 de 100 num mês entra no mês seguinte com 150.
-- Cada empresa decide o próprio ritmo de prospecção.
--
-- POR QUE ISSO EXIGE UMA TRAVA DE DUPLICIDADE:
-- O Mercado Pago reenvia o mesmo aviso de pagamento mais de uma vez
-- (retentativas e múltiplos tipos de notificação). Com a regra antiga
-- isso era inofensivo: o saldo era SOBRESCRITO, então creditar duas
-- vezes dava o mesmo resultado. Somando, cada reenvio passaria a valer
-- uma franquia inteira de graça. Daí a coluna `ultimo_credito_ref`.
--
-- ONDE O SALDO ERA ZERADO (os dois pontos precisavam mudar):
--   1. inicializar_creditos_por_plano — renovação por pagamento
--   2. consumir_creditos — reset automático na virada de ciclo
-- Alterar só o primeiro não teria efeito: o segundo apagaria o
-- acumulado na primeira busca do mês seguinte.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Marca de idempotência ═══

alter table public.creditos_usuario
  add column if not exists ultimo_credito_ref text;

comment on column public.creditos_usuario.ultimo_credito_ref is
  'Referencia (payment id) do ultimo credito concedido. Impede que um webhook repetido credite duas vezes.';

-- ═══ 2. Renovação por pagamento: acumula em vez de zerar ═══
-- A versão de 2 argumentos precisa sair antes: convivendo com a de 3
-- (que tem default no 3º), uma chamada com 2 argumentos ficaria
-- ambígua e o Postgres recusaria com "function is not unique".

drop function if exists public.inicializar_creditos_por_plano(uuid, text);

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

  -- Se esta mesma referência já concedeu crédito, não repete
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
    (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim, ultimo_credito_ref)
  values
    (p_profile_id, v_total, v_total, now(), now() + interval '30 days', p_referencia)
  on conflict (id) do update set
    -- ACUMULA: o saldo não usado no ciclo anterior permanece
    creditos_disponiveis  = public.creditos_usuario.creditos_disponiveis + v_total,
    creditos_totais_ciclo = v_total,
    ciclo_inicio          = now(),
    ciclo_fim             = now() + interval '30 days',
    ultimo_credito_ref    = p_referencia,
    atualizado_em         = now();
end;
$$;

comment on function public.inicializar_creditos_por_plano(uuid, text, text) is
  'Concede creditos do plano SOMANDO ao saldo existente. p_referencia evita credito duplicado por webhook repetido.';

create or replace function public.inicializar_creditos(
  p_profile_id uuid,
  p_plano_anual boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.inicializar_creditos_por_plano(
    p_profile_id,
    case when p_plano_anual then 'anual' else 'mensal' end,
    null
  );
end;
$$;

-- ═══ 3. Consumo: acumula na virada e só credita quem está ativo ═══

create or replace function public.consumir_creditos(
  p_profile_id uuid,
  p_quantidade_empresas integer,
  p_segmento text,
  p_cidade text,
  p_estado text,
  p_raio_km integer
)
returns table(sucesso boolean, creditos_restantes integer, custo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_custo integer;
  v_saldo_atual integer;
  v_ciclo_fim timestamptz;
  v_status text;
begin
  -- Um usuário logado só pode gastar os próprios créditos. Sem isso,
  -- bastava trocar o UUID na chamada para drenar a conta de outro.
  -- auth.uid() nulo = chamada interna via service_role (Edge Function).
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'Nao e permitido consumir creditos de outro usuario';
  end if;

  v_custo := public.calcular_custo_creditos(p_quantidade_empresas);

  -- Trava a linha para evitar condição de corrida em buscas simultâneas
  select creditos_disponiveis, ciclo_fim into v_saldo_atual, v_ciclo_fim
  from public.creditos_usuario
  where id = p_profile_id
  for update;

  if v_saldo_atual is null then
    return query select false, 0, v_custo;
    return;
  end if;

  select status_assinatura into v_status
  from public.profiles where id = p_profile_id;

  -- Virada de ciclo: SOMA a franquia ao que sobrou, em vez de zerar.
  -- Só vale para assinatura ativa — antes, um trial vencido ou plano
  -- cancelado ganhava franquia nova de graça a cada 30 dias. O saldo
  -- já acumulado continua utilizável; o que não vem é franquia nova.
  if now() > v_ciclo_fim and v_status = 'ativa' then
    update public.creditos_usuario
    set creditos_disponiveis = creditos_disponiveis + creditos_totais_ciclo,
        ciclo_inicio = now(),
        ciclo_fim = now() + interval '30 days',
        atualizado_em = now()
    where id = p_profile_id
    returning creditos_disponiveis into v_saldo_atual;
  end if;

  if v_saldo_atual < v_custo then
    return query select false, v_saldo_atual, v_custo;
    return;
  end if;

  update public.creditos_usuario
  set creditos_disponiveis = creditos_disponiveis - v_custo,
      atualizado_em = now()
  where id = p_profile_id;

  insert into public.historico_buscas (
    profile_id, segmento, cidade, estado, raio_km, quantidade_empresas, creditos_gastos
  ) values (
    p_profile_id, p_segmento, p_cidade, p_estado, p_raio_km, p_quantidade_empresas, v_custo
  );

  return query select true, (v_saldo_atual - v_custo), v_custo;
end;
$$;

-- ═══ 4. Fecha as funções ainda expostas ═══
-- registrar_cancelamento: sem login, dava para cancelar a assinatura
-- de qualquer perfil cujo UUID fosse conhecido. Só a Edge Function
-- cancelar-assinatura a utiliza, via service_role.
-- consumir_creditos: continua liberada para `authenticated`, porque o
-- navegador a chama de verdade (src/store/useCreditosStore.ts).

revoke all on function public.registrar_cancelamento(uuid) from public, anon, authenticated;
grant execute on function public.registrar_cancelamento(uuid) to service_role;

revoke all on function public.consumir_creditos(uuid, integer, text, text, text, integer) from public, anon;
grant execute on function public.consumir_creditos(uuid, integer, text, text, text, integer) to authenticated, service_role;

revoke all on function public.inicializar_creditos_por_plano(uuid, text, text) from public, anon, authenticated;
grant execute on function public.inicializar_creditos_por_plano(uuid, text, text) to service_role;

revoke all on function public.inicializar_creditos(uuid, boolean) from public, anon, authenticated;
grant execute on function public.inicializar_creditos(uuid, boolean) to service_role;

-- ═══════════════════════════════════════════════════════════
-- SE UM DIA QUISER LIMITAR O ACÚMULO
--
-- Acúmulo sem teto é uma responsabilidade em aberto: cada crédito
-- custa chamadas de API, e um assinante anual pode juntar 1.800 e
-- gastar tudo num único mês. Para limitar a, por exemplo, 3 ciclos,
-- troque a linha de acúmulo em inicializar_creditos_por_plano por:
--
--   creditos_disponiveis = least(
--     public.creditos_usuario.creditos_disponiveis + v_total,
--     v_total * 3
--   ),
--
-- Deixado SEM teto de propósito: é a regra pedida pelo dono, para que
-- cada empresa decida o próprio ritmo de uso.
-- ═══════════════════════════════════════════════════════════
