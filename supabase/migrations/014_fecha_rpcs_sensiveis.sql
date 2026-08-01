-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — FECHA RPCs SENSÍVEIS AO ACESSO PÚBLICO
-- Execute após 001 a 013 no SQL Editor do Supabase
--
-- PROBLEMA:
-- O Supabase publica toda função do schema `public` como endpoint
-- REST em /rest/v1/rpc/<nome>. Quatro funções privilegiadas estavam
-- acessíveis sem autenticação alguma:
--
--   • conceder_acesso_permanente  → dava assinatura vitalícia grátis
--   • iniciar_trial               → reiniciava o período de teste
--   • inicializar_creditos        → resetava o saldo de créditos
--   • inicializar_creditos_por_plano → idem, com saldo por plano
--
-- Nenhuma delas verifica quem está chamando. Bastava conhecer (ou
-- adivinhar) um UUID de perfil para se conceder acesso vitalício ou
-- recarregar créditos de qualquer conta.
--
-- POR QUE REVOGAR DE `public` E NÃO SÓ DE `anon`/`authenticated`:
-- No Postgres, `create function` concede EXECUTE ao papel PUBLIC por
-- padrão, e anon/authenticated herdam dele. Revogar apenas de
-- anon/authenticated não teria efeito nenhum — o privilégio herdado
-- de PUBLIC continuaria valendo.
--
-- POR QUE O FLUXO DE PAGAMENTO NÃO QUEBRA:
-- As Edge Functions usam SUPABASE_SERVICE_ROLE_KEY (papel
-- service_role), que recebe o grant explícito no fim deste arquivo:
--   • criar-assinatura-mp    chama iniciar_trial
--   • webhook-mercadopago    chama inicializar_creditos_por_plano
-- Nenhuma das quatro é chamada pelo navegador.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Remover o acesso público ═══

revoke all on function public.conceder_acesso_permanente(uuid, integer)   from public, anon, authenticated;
revoke all on function public.iniciar_trial(uuid, integer)                from public, anon, authenticated;
revoke all on function public.inicializar_creditos(uuid, boolean)         from public, anon, authenticated;
revoke all on function public.inicializar_creditos_por_plano(uuid, text)  from public, anon, authenticated;

-- ═══ 2. Preservar o acesso das Edge Functions ═══

grant execute on function public.conceder_acesso_permanente(uuid, integer)   to service_role;
grant execute on function public.iniciar_trial(uuid, integer)                to service_role;
grant execute on function public.inicializar_creditos(uuid, boolean)         to service_role;
grant execute on function public.inicializar_creditos_por_plano(uuid, text)  to service_role;

-- ═══════════════════════════════════════════════════════════
-- AINDA EM ABERTO (avaliar antes de abrir ao público):
--
--   • registrar_cancelamento(uuid) — sem checagem de identidade e
--     acessível sem login: permite cancelar a assinatura de qualquer
--     perfil cujo UUID seja conhecido. Só é chamada pela Edge Function
--     cancelar-assinatura (service_role), então fechá-la é seguro:
--
--       revoke all on function public.registrar_cancelamento(uuid)
--         from public, anon, authenticated;
--       grant execute on function public.registrar_cancelamento(uuid)
--         to service_role;
--
--   • consumir_creditos(...) — acessível sem login. É chamada pelo
--     navegador (src/store/useCreditosStore.ts), logo precisa
--     continuar liberada para `authenticated`, mas não para `anon`:
--
--       revoke all on function public.consumir_creditos(uuid, integer, text, text, text, integer)
--         from public, anon;
--       grant execute on function public.consumir_creditos(uuid, integer, text, text, text, integer)
--         to authenticated, service_role;
--
--     Convém ainda validar dentro dela que p_profile_id = auth.uid(),
--     senão um usuário logado pode gastar créditos de outro.
-- ═══════════════════════════════════════════════════════════
