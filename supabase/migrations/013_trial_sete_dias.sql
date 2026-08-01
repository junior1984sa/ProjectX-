-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — PERÍODO DE TESTE PASSA DE 5 PARA 7 DIAS
-- Execute após 001 a 012 no SQL Editor do Supabase
--
-- MOTIVO (jurídico, não estético):
-- O artigo 49 do Código de Defesa do Consumidor garante ao
-- consumidor 7 dias para desistir de qualquer contratação feita
-- pela internet, e assinaturas digitais estão expressamente
-- abrangidas. Oferecer 5 dias não reduz esse direito — apenas
-- cria conflito entre o que prometemos e o que a lei obriga.
--
-- Além disso, a lei considera abusiva qualquer cobrança de
-- "taxa de devolução", "desconto por uso" ou "estorno parcial".
-- Ou seja: se o cliente desistir dentro do prazo, o reembolso é
-- integral, mesmo que ele tenha consumido créditos de busca.
--
-- Por isso o trial concede créditos LIMITADOS (20), e não o saldo
-- cheio do plano: limita a exposição sem violar a lei.
-- ═══════════════════════════════════════════════════════════

create or replace function public.iniciar_trial(
  p_profile_id uuid,
  p_dias integer default 7
)
returns void as $$
begin
  update public.profiles
  set status_assinatura = 'trial',
      em_trial = true,
      trial_inicio = now(),
      trial_fim = now() + (p_dias || ' days')::interval
  where id = p_profile_id;

  -- Saldo reduzido durante o teste: suficiente para avaliar a
  -- ferramenta, limitado o bastante para não virar prejuízo caso
  -- o cliente exerça o direito de arrependimento.
  insert into public.creditos_usuario (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim)
  values (p_profile_id, 20, 20, now(), now() + (p_dias || ' days')::interval)
  on conflict (id) do update set
    creditos_disponiveis = 20,
    creditos_totais_ciclo = 20,
    ciclo_inicio = now(),
    ciclo_fim = now() + (p_dias || ' days')::interval,
    atualizado_em = now();
end;
$$ language plpgsql security definer;

comment on column public.profiles.em_trial is
  'true durante os 7 dias de teste (prazo mínimo do art. 49 do CDC)';

-- ═══════════════════════════════════════════════════════════
-- FIM
-- ═══════════════════════════════════════════════════════════
