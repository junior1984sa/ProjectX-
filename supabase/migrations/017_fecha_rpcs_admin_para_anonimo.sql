-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — FECHA AS RPCs ADMINISTRATIVAS PARA ANÔNIMOS
-- Execute após 001 a 016 no SQL Editor do Supabase
--
-- As quatro funções administrativas já bloqueiam por dentro, com
-- `if not usuario_eh_admin() then raise exception`. Ainda assim, um
-- visitante sem login conseguia CHAMÁ-LAS pela API pública e receber
-- a exceção — o dado nunca vazava, mas a porta ficava aberta.
--
-- Defesa em camadas: quem não está autenticado nem chega até a
-- checagem. Se um dia alguém remover por engano o `raise exception`
-- de dentro de uma delas, o dado continua protegido pelo grant.
--
-- O aplicativo só as usa com usuário autenticado
-- (src/lib/admin.ts), portanto nada muda no uso real.
-- ═══════════════════════════════════════════════════════════

revoke all on function public.painel_administrativo()     from public, anon;
revoke all on function public.listar_associados()         from public, anon;
revoke all on function public.custo_mensal_total()        from public, anon;
revoke all on function public.receita_mensal_recorrente() from public, anon;

grant execute on function public.painel_administrativo()     to authenticated, service_role;
grant execute on function public.listar_associados()         to authenticated, service_role;
grant execute on function public.custo_mensal_total()        to authenticated, service_role;
grant execute on function public.receita_mensal_recorrente() to authenticated, service_role;
