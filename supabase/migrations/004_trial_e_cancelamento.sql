-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — PERÍODO DE TESTE (TRIAL) E CANCELAMENTO
-- Execute após 001, 002 e 003 no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════

-- ═══ Novos campos em profiles: controle de trial ═══
alter table public.profiles
  add column if not exists trial_inicio timestamptz,
  add column if not exists trial_fim timestamptz,
  add column if not exists em_trial boolean not null default false;

comment on column public.profiles.em_trial is 'true durante os 5 dias de teste gratuito, antes da primeira cobrança';

-- Adiciona o novo status possível para status_assinatura: 'trial'
alter table public.profiles drop constraint if exists profiles_status_assinatura_check;
alter table public.profiles add constraint profiles_status_assinatura_check
  check (status_assinatura in ('pendente', 'trial', 'ativa', 'atraso', 'cancelada'));

-- ═══ Novos campos em assinaturas: vínculo com o preapproval do Mercado Pago ═══
alter table public.assinaturas
  add column if not exists mercadopago_preapproval_id text,
  add column if not exists trial_dias integer not null default 5,
  add column if not exists cancelado_em timestamptz;

comment on column public.assinaturas.mercadopago_preapproval_id is 'ID da assinatura recorrente (preapproval) no Mercado Pago — usado para cancelar';

-- ═══ FUNÇÃO: inicia o trial de um perfil (chamada ao criar a assinatura) ═══
create or replace function public.iniciar_trial(
  p_profile_id uuid,
  p_dias integer default 5
)
returns void as $$
begin
  update public.profiles
  set status_assinatura = 'trial',
      em_trial = true,
      trial_inicio = now(),
      trial_fim = now() + (p_dias || ' days')::interval
  where id = p_profile_id;

  -- Concede um saldo reduzido de créditos válido só durante o trial
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

-- ═══ FUNÇÃO: marca cancelamento solicitado pelo usuário ═══
-- O cancelamento em si na API do Mercado Pago é feito pela Edge Function
-- (que tem o Access Token); esta função só registra o estado no nosso banco.
create or replace function public.registrar_cancelamento(
  p_profile_id uuid
)
returns void as $$
begin
  update public.profiles
  set status_assinatura = 'cancelada'
  where id = p_profile_id;

  update public.assinaturas
  set status = 'cancelada',
      cancelado_em = now()
  where profile_id = p_profile_id
    and status in ('aprovada', 'pendente')
    and cancelado_em is null;
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION DE TRIAL E CANCELAMENTO
-- ═══════════════════════════════════════════════════════════
