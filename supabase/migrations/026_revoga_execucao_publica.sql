-- ═══════════════════════════════════════════════════════════
-- REVOGA A EXECUÇÃO PÚBLICA DAS FUNÇÕES SENSÍVEIS
--
-- O ERRO QUE ESTA MIGRATION CONSERTA
--
-- Nas migrations 024 e 025 eu escrevi `revoke all ... from anon`
-- acreditando que isso fechava a função. Não fecha.
--
-- O Postgres concede EXECUTE ao papel PUBLIC por padrão em toda
-- função nova, e `anon` herda dessa concessão. Revogar de `anon`
-- não remove o que veio de PUBLIC — a permissão continua lá, por
-- baixo. O analisador do Supabase apontou isso, e estava certo.
--
-- A revogação que funciona é `from public`. Depois dela, só quem
-- recebe `grant` explícito consegue chamar.
--
-- IMPACTO REAL DE CADA UMA
--
-- `expurgo_retencao` é a mais grave: ela APAGA dados de retenção, e
-- estava ao alcance de qualquer requisição anônima. Não checa
-- usuário, porque foi escrita para o agendador — que roda como dono
-- do banco e não passa por aqui.
--
-- `excluir_minha_conta` e `consumir_creditos` checam `auth.uid()` e
-- falhariam para anônimo, então o dano seria menor. Mas depender da
-- checagem interna quando a permissão também pode ser fechada é
-- deixar uma tranca sobrando sem usar.
--
-- `abrir_pedido_titular` continua aberta ao anônimo DE PROPÓSITO: a
-- pessoa de uma empresa indexada precisa poder pedir exclusão sem
-- criar conta. Exigir cadastro de quem está pedindo para sair seria
-- coletar mais dado de quem quer menos.
-- ═══════════════════════════════════════════════════════════

-- ── Só o agendador chama. Ninguém mais, nem autenticado. ──
revoke all on function public.expurgo_retencao() from public;
revoke all on function public.expurgo_retencao() from anon, authenticated;

-- ── Exige sessão: fecha para público e libera só autenticado ──
revoke all on function public.excluir_minha_conta() from public;
grant execute on function public.excluir_minha_conta() to authenticated;

revoke all on function public.consumir_creditos(
  uuid, integer, text, text, text, integer, text
) from public;
grant execute on function public.consumir_creditos(
  uuid, integer, text, text, text, integer, text
) to authenticated;

revoke all on function public.registrar_aceite(text, text, inet, text) from public;
grant execute on function public.registrar_aceite(text, text, inet, text) to authenticated;

-- ── Aberta ao anônimo de propósito, mas declarada aqui para que a
--    intenção fique registrada e ninguém "conserte" isso depois ──
revoke all on function public.abrir_pedido_titular(text, text, text) from public;
grant execute on function public.abrir_pedido_titular(text, text, text) to anon, authenticated;

comment on function public.expurgo_retencao() is
  'Rotina de retencao, chamada pelo agendador pg_cron. Execucao revogada '
  'de PUBLIC, anon e authenticated: apaga dados e nao deve ser alcancavel '
  'por requisicao de usuario.';
