-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — QUATRO PLANOS (mensal, trimestral, semestral, anual)
-- Execute após 001 a 010 no SQL Editor do Supabase
--
-- Antes existiam só dois planos (mensal e anual). Esta migration
-- abre para quatro, com créditos progressivos: quanto maior o
-- compromisso, maior o desconto e mais créditos por mês.
--
--   Plano        Meses  Cobrado      Equiv/mês   Créditos/mês
--   ---------------------------------------------------------
--   Mensal        1     R$   497     R$ 497       100
--   Trimestral    3     R$ 1.341     R$ 447       120
--   Semestral     6     R$ 2.532     R$ 422       135
--   Anual        12     R$ 4.764     R$ 397       150
--
-- Os preços ficam no frontend (src/types/prestador.ts) e nos
-- secrets do Supabase. Aqui no banco guardamos apenas a regra
-- de créditos, que é o que o servidor precisa saber.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Liberar os novos planos nas constraints existentes ═══

alter table public.assinaturas drop constraint if exists assinaturas_plano_check;
alter table public.assinaturas add constraint assinaturas_plano_check
  check (plano in ('mensal', 'trimestral', 'semestral', 'anual'));

alter table public.planos_regiao drop constraint if exists planos_regiao_plano_check;
alter table public.planos_regiao add constraint planos_regiao_plano_check
  check (plano in ('mensal', 'trimestral', 'semestral', 'anual'));

-- ═══ 2. Nova função de créditos, por tipo de plano ═══
-- A versão antiga recebia um booleano (p_plano_anual). Agora recebe
-- o nome do plano, o que permite os quatro níveis. Mantemos a função
-- antiga funcionando (sobrecarga) para não quebrar chamadas legadas
-- enquanto as Edge Functions não são todas atualizadas.

create or replace function public.inicializar_creditos_por_plano(
  p_profile_id uuid,
  p_plano text default 'mensal'
)
returns void as $$
declare
  v_total integer;
begin
  v_total := case lower(trim(p_plano))
    when 'anual'      then 150
    when 'semestral'  then 135
    when 'trimestral' then 120
    else 100                      -- mensal ou valor desconhecido
  end;

  insert into public.creditos_usuario (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim)
  values (p_profile_id, v_total, v_total, now(), now() + interval '30 days')
  on conflict (id) do update set
    creditos_disponiveis = v_total,
    creditos_totais_ciclo = v_total,
    ciclo_inicio = now(),
    ciclo_fim = now() + interval '30 days',
    atualizado_em = now();
end;
$$ language plpgsql security definer;

comment on function public.inicializar_creditos_por_plano is
  'Concede créditos conforme o plano contratado. Substitui inicializar_creditos(uuid, boolean).';

-- ═══ 3. Compatibilidade: a função antiga passa a delegar para a nova ═══
-- Assim, qualquer Edge Function ainda não atualizada continua
-- funcionando (tratando true como anual, false como mensal).

create or replace function public.inicializar_creditos(
  p_profile_id uuid,
  p_plano_anual boolean default false
)
returns void as $$
begin
  perform public.inicializar_creditos_por_plano(
    p_profile_id,
    case when p_plano_anual then 'anual' else 'mensal' end
  );
end;
$$ language plpgsql security definer;

-- ═══ 4. Cadastrar os novos planos na tabela de preços por região ═══

insert into public.planos_regiao (pais, plano, moeda, preco, gateway, ativo)
values
  ('BR', 'trimestral', 'BRL', 1341.00, 'mercadopago', true),
  ('BR', 'semestral',  'BRL', 2532.00, 'mercadopago', true)
on conflict do nothing;

-- Atualiza os valores dos planos que já existiam
update public.planos_regiao set preco =  497.00 where pais = 'BR' and plano = 'mensal';
update public.planos_regiao set preco = 4764.00 where pais = 'BR' and plano = 'anual';

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE QUATRO PLANOS
-- ═══════════════════════════════════════════════════════════
