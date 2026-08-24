-- ═══════════════════════════════════════════════════════════
-- COBRANÇA NA ENTREGA
--
-- O PROBLEMA QUE ISTO RESOLVE
--
-- Antes, o crédito era debitado ANTES da busca, pela quantidade
-- PEDIDA. A medição do Reino Unido mostrou que só cerca de 10% das
-- empresas chegam com contato utilizável. Na prática isso é cobrar por
-- 40 e entregar 4 — e o cliente conclui que foi enganado, com razão.
--
-- Invertendo: a busca não custa nada, o cliente vê o mercado inteiro,
-- e paga só pelos contatos que efetivamente recebeu. Se o funil
-- acertar 10%, ele paga 10%. A credibilidade passa a ser protegida por
-- construção, e não por promessa.
--
-- A DEFINIÇÃO QUE FALTAVA
--
-- Um crédito = um contato entregue. Uma frase, sem tabela de faixas,
-- sem "consulta", sem asterisco. A reclamação número um contra os
-- concorrentes deste mercado é não saber o que se está comprando.
--
-- CONSEQUÊNCIA COMERCIAL, DECLARADA
--
-- Com 100 créditos no plano mensal, o assinante passa a ter direito a
-- 100 CONTATOS por mês, e não a ~133 empresas listadas. O plano entrega
-- menos em número e mais em valor. Se o preço deve mudar por causa
-- disso é decisão de precificação, não de engenharia — mas o número
-- agora é honesto.
--
-- POR QUE O NOME DE SAÍDA NÃO É `creditos_disponiveis`
--
-- Na primeira versão era, igual ao nome da coluna de
-- `creditos_usuario`. Dentro de uma função plpgsql isso torna cada
-- leitura ambígua — e o Postgres ACEITA criar a função assim,
-- reclamando só na execução. A migration aplicou "com sucesso" e a
-- função quebrava na primeira chamada.
--
-- Descoberto por teste, não por leitura. O nome de saída virou
-- `saldo_creditos`, e toda referência à tabela leva alias.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Pode buscar? ─────────────────────────────────────────
--
-- Separada do débito porque as duas perguntas acontecem em momentos
-- diferentes agora: esta ANTES da busca (não adianta consultar a fonte
-- se o país é proibido ou o teto do dia estourou), o débito DEPOIS.
--
-- Não debita nada. Só responde.

drop function if exists public.pode_buscar(uuid, text);

create function public.pode_buscar(
  p_profile_id uuid,
  p_pais text default 'BR'
)
returns table(pode boolean, motivo text, saldo_creditos integer, restante_hoje integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
  v_ciclo_fim timestamptz;
  v_status text;
  v_primeira timestamptz;
  v_gasto_hoje integer;
  v_dia date;
  v_pais_assinante text;
  v_teto_diario constant integer := 20;
  v_restante integer;
begin
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'Nao e permitido consultar creditos de outro usuario';
  end if;

  -- Trava fiscal: assinante de fora do Brasil não busca empresa
  -- brasileira. A tese de exportação de serviço exige que o resultado
  -- seja verificado no exterior (LC 123, art. 18, §14).
  select p.pais_foco into v_pais_assinante
  from public.profiles p where p.id = p_profile_id;

  if coalesce(v_pais_assinante, 'BR') <> 'BR'
     and upper(coalesce(p_pais, 'BR')) = 'BR' then
    return query select false, 'restricao_exportacao'::text, 0, 0;
    return;
  end if;

  select cu.creditos_disponiveis, cu.ciclo_fim, cu.primeira_cobranca_em,
         cu.gasto_hoje, cu.dia_referencia
    into v_saldo, v_ciclo_fim, v_primeira, v_gasto_hoje, v_dia
  from public.creditos_usuario cu
  where cu.id = p_profile_id;

  if v_saldo is null then
    return query select false, 'sem_creditos'::text, 0, 0;
    return;
  end if;

  select p.status_assinatura into v_status
  from public.profiles p where p.id = p_profile_id;

  -- Renova o ciclo se venceu, para o saldo refletir a realidade antes
  -- de responder. Sem isto, quem virou o mês veria zero e desistiria.
  if now() > v_ciclo_fim and v_status = 'ativa' then
    update public.creditos_usuario cu
    set creditos_disponiveis = cu.creditos_disponiveis + cu.creditos_totais_ciclo,
        ciclo_inicio = now(),
        ciclo_fim = now() + interval '30 days',
        atualizado_em = now()
    where cu.id = p_profile_id
    returning cu.creditos_disponiveis into v_saldo;
  end if;

  if v_dia is distinct from current_date then
    v_gasto_hoje := 0;
  end if;

  v_restante := v_saldo;

  -- Teto diário, só nos 7 dias seguintes à primeira cobrança
  if v_primeira is not null and now() < v_primeira + interval '7 days' then
    v_restante := least(v_saldo, v_teto_diario - coalesce(v_gasto_hoje, 0));
    if v_restante <= 0 then
      return query select false, 'limite_diario'::text, v_saldo, 0;
      return;
    end if;
  end if;

  if v_saldo <= 0 then
    return query select false, 'sem_creditos'::text, 0, 0;
    return;
  end if;

  return query select true, 'ok'::text, v_saldo, v_restante;
end;
$$;

revoke all on function public.pode_buscar(uuid, text) from public;
grant execute on function public.pode_buscar(uuid, text) to authenticated;

-- ── 2. Debita pelo que foi entregue ─────────────────────────
--
-- Chamada DEPOIS da busca, com a contagem de contatos que realmente
-- vieram. Devolve quantos foram efetivamente pagos: se o assinante
-- pediu 40 e tem saldo para 12, ele paga 12 e recebe 12 — em vez de
-- ser recusado por inteiro.
--
-- Entrega zero não custa nada, e é o ponto central da mudança: busca
-- que não achou contato não pode cobrar.

drop function if exists public.consumir_creditos_por_entrega(
  uuid, integer, text, text, text, integer, text
);

create function public.consumir_creditos_por_entrega(
  p_profile_id uuid,
  p_contatos_entregues integer,
  p_segmento text,
  p_cidade text,
  p_estado text,
  p_raio_km integer,
  p_pais text default 'BR'
)
returns table(cobrados integer, saldo_creditos integer, motivo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
  v_primeira timestamptz;
  v_gasto_hoje integer;
  v_dia date;
  v_teto_diario constant integer := 20;
  v_limite integer;
  v_cobrar integer;
begin
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'Nao e permitido consumir creditos de outro usuario';
  end if;

  -- Nada entregue, nada cobrado. Esta condição é a mudança inteira.
  if coalesce(p_contatos_entregues, 0) <= 0 then
    select cu.creditos_disponiveis into v_saldo
    from public.creditos_usuario cu where cu.id = p_profile_id;
    return query select 0, coalesce(v_saldo, 0), 'nada_entregue'::text;
    return;
  end if;

  select cu.creditos_disponiveis, cu.primeira_cobranca_em, cu.gasto_hoje, cu.dia_referencia
    into v_saldo, v_primeira, v_gasto_hoje, v_dia
  from public.creditos_usuario cu
  where cu.id = p_profile_id
  for update;

  if v_saldo is null then
    return query select 0, 0, 'sem_creditos'::text;
    return;
  end if;

  if v_dia is distinct from current_date then
    v_gasto_hoje := 0;
    update public.creditos_usuario cu
    set gasto_hoje = 0, dia_referencia = current_date
    where cu.id = p_profile_id;
  end if;

  v_limite := v_saldo;
  if v_primeira is not null and now() < v_primeira + interval '7 days' then
    v_limite := least(v_saldo, v_teto_diario - coalesce(v_gasto_hoje, 0));
  end if;

  -- Um crédito por contato, limitado ao que o assinante tem.
  v_cobrar := least(p_contatos_entregues, greatest(v_limite, 0));

  if v_cobrar <= 0 then
    return query select 0, v_saldo, 'sem_creditos'::text;
    return;
  end if;

  update public.creditos_usuario cu
  set creditos_disponiveis = cu.creditos_disponiveis - v_cobrar,
      gasto_hoje = coalesce(cu.gasto_hoje, 0) + v_cobrar,
      dia_referencia = current_date,
      atualizado_em = now()
  where cu.id = p_profile_id
  returning cu.creditos_disponiveis into v_saldo;

  insert into public.historico_buscas (
    profile_id, segmento, cidade, estado, raio_km, quantidade_empresas, creditos_gastos
  ) values (
    p_profile_id, p_segmento, p_cidade, p_estado, p_raio_km, v_cobrar, v_cobrar
  );

  return query select v_cobrar, v_saldo, 'ok'::text;
end;
$$;

revoke all on function public.consumir_creditos_por_entrega(
  uuid, integer, text, text, text, integer, text
) from public;
grant execute on function public.consumir_creditos_por_entrega(
  uuid, integer, text, text, text, integer, text
) to authenticated;

comment on function public.consumir_creditos_por_entrega(
  uuid, integer, text, text, text, integer, text
) is
  'Debita um credito por CONTATO ENTREGUE, depois da busca. Entrega zero '
  'nao custa nada. Substitui consumir_creditos, que cobrava pela quantidade '
  'PEDIDA antes de saber o que seria entregue.';

comment on function public.pode_buscar(uuid, text) is
  'Responde se o assinante pode buscar (pais, teto diario, saldo) SEM '
  'debitar nada. O debito acontece depois, por consumir_creditos_por_entrega.';
