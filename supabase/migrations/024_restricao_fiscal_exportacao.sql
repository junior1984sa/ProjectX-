-- ═══════════════════════════════════════════════════════════
-- RESTRIÇÃO FISCAL DA EXPORTAÇÃO DE SERVIÇO
--
-- O PROBLEMA
-- Receita de exportação de serviço paga alíquota muito menor no
-- Simples Nacional: a LC 123, art. 18, §14 manda desconsiderar PIS,
-- Cofins e ISS no cálculo do DAS. Na primeira faixa isso derruba o
-- imposto de 6,000% para 3,054% no Anexo III, e de 15,500% para
-- 10,672% no Anexo V.
--
-- Mas a tese de exportação exige TRÊS requisitos cumulativos:
--   1. tomador domiciliado no exterior
--   2. ingresso de divisas no país
--   3. RESULTADO do serviço verificado no exterior
--
-- Os dois primeiros a operação cumpre sozinha. O terceiro é frágil:
-- se um assinante americano usa a ferramenta para encontrar empresas
-- em São Paulo, cabe o argumento fiscal de que o resultado do serviço
-- ocorreu no Brasil — e aí a receita inteira dele é reclassificada
-- como mercado interno, com o imposto retroativo e multa.
--
-- A SOLUÇÃO
-- Assinante com país de atuação fora do Brasil não busca empresas
-- brasileiras. A trava mora aqui, dentro da função que debita o
-- crédito, porque este é o único ponto do fluxo em que existe
-- usuário autenticado e verificado pelo banco. Validar isso no
-- navegador seria decoração: o navegador é do usuário.
--
-- CONSEQUÊNCIA COMERCIAL, DECLARADA
-- Isso reduz o produto para o assinante estrangeiro. É uma troca
-- deliberada: a diferença de alíquota (2,95 pontos da receita no
-- Anexo III) vale mais que o caso de uso de um americano procurando
-- cliente no Brasil, que é raro. Se algum dia essa demanda aparecer
-- em volume, a saída é fiscal, não técnica — conversar com o
-- contador sobre segregar a receita, e não afrouxar a trava.
-- ═══════════════════════════════════════════════════════════

-- A assinatura muda (ganha p_pais), então a versão antiga sai de
-- cena. Deixar as duas conviverem criaria uma porta sem tranca:
-- bastaria chamar a função antiga para pular a validação.
drop function if exists public.consumir_creditos(uuid, integer, text, text, text, integer);

create or replace function public.consumir_creditos(
  p_profile_id uuid,
  p_quantidade_empresas integer,
  p_segmento text,
  p_cidade text,
  p_estado text,
  p_raio_km integer,
  p_pais text default 'BR'
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
  v_pais_assinante text;
  v_teto_diario constant integer := 20;
begin
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'Nao e permitido consumir creditos de outro usuario';
  end if;

  -- ── Trava fiscal ────────────────────────────────────────────
  -- Vem antes de qualquer cálculo de custo: recusar depois de
  -- debitar seria devolver crédito, e devolução tem bug.
  select pais_foco into v_pais_assinante
  from public.profiles where id = p_profile_id;

  if coalesce(v_pais_assinante, 'BR') <> 'BR'
     and upper(coalesce(p_pais, 'BR')) = 'BR' then
    return query select false, 0, 0, 'restricao_exportacao';
    return;
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

  select creditos_disponiveis into v_saldo_atual
  from public.creditos_usuario where id = p_profile_id;

  return query select true, v_saldo_atual, v_custo, 'ok'::text;
end;
$$;

revoke all on function public.consumir_creditos(uuid, integer, text, text, text, integer, text) from anon;
grant execute on function public.consumir_creditos(uuid, integer, text, text, text, integer, text) to authenticated;

comment on function public.consumir_creditos(uuid, integer, text, text, text, integer, text) is
  'Debita créditos de forma atômica. Recusa com motivo "restricao_exportacao" '
  'quando assinante de fora do Brasil tenta buscar empresas brasileiras — a '
  'tese de exportação de serviço exige que o resultado ocorra no exterior '
  '(LC 123, art. 18, §14).';
