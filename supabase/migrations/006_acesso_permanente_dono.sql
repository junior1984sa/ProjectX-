-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — ACESSO PERMANENTE DO PROPRIETÁRIO
-- Execute após 001, 002, 003, 004 e 005 no SQL Editor do Supabase
--
-- Concede acesso vitalício (sem prazo, sem cartão, sem disputar
-- código com parceiros) à conta do dono do produto.
-- ═══════════════════════════════════════════════════════════

-- ═══ FUNÇÃO: concede acesso permanente a um perfil ═══
-- Marca status_assinatura = 'ativa' diretamente (não 'trial'), sem
-- vínculo de expiração, e concede um saldo de créditos generoso que
-- se renova normalmente todo mês através do ciclo padrão.
create or replace function public.conceder_acesso_permanente(
  p_profile_id uuid,
  p_creditos_mensais integer default 300
)
returns void as $$
begin
  update public.profiles
  set status_assinatura = 'ativa',
      em_trial = false,
      trial_inicio = null,
      trial_fim = null
  where id = p_profile_id;

  insert into public.creditos_usuario (id, creditos_disponiveis, creditos_totais_ciclo, ciclo_inicio, ciclo_fim)
  values (p_profile_id, p_creditos_mensais, p_creditos_mensais, now(), now() + interval '3650 days')
  on conflict (id) do update set
    creditos_disponiveis = p_creditos_mensais,
    creditos_totais_ciclo = p_creditos_mensais,
    ciclo_inicio = now(),
    ciclo_fim = now() + interval '3650 days',
    atualizado_em = now();

  -- Registra uma "assinatura" simbólica com valor zero, só para manter
  -- consistência no histórico (não gera cobrança real nenhuma).
  insert into public.assinaturas (profile_id, plano, status, valor, data_inicio)
  values (p_profile_id, 'anual', 'aprovada', 0, now());
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════
-- COMO USAR (faça isso UMA VEZ, depois de já ter criado sua conta
-- normalmente pelo site e ter pelo menos o perfil cadastrado):
--
-- 1. Descubra o seu profile_id rodando:
--    select id, nome_empresa, email_contato from public.profiles;
--
-- 2. Copie o "id" da sua linha e rode (troque SEU-ID-AQUI):
--    select public.conceder_acesso_permanente('SEU-ID-AQUI');
--
-- Isso ativa sua conta permanentemente, com 300 créditos/mês que
-- se renovam sozinhos, sem nunca precisar de cartão ou expirar.
-- ═══════════════════════════════════════════════════════════
