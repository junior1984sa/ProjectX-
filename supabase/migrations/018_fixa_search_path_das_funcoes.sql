-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — FIXA O search_path DE TODAS AS FUNÇÕES
-- Execute após 001 a 017 no SQL Editor do Supabase
--
-- POR QUE ISSO IMPORTA:
-- Uma função SECURITY DEFINER roda com os privilégios de quem a criou.
-- Se o `search_path` não estiver fixo, um atacante com permissão de
-- criar objetos pode plantar uma tabela ou função de mesmo nome em
-- outro schema que venha antes na busca — e a função privilegiada
-- passa a chamar o objeto dele, executando código com privilégios
-- elevados. Fixar o search_path elimina essa classe de ataque.
--
-- É a recomendação `function_search_path_mutable` do linter do
-- Supabase, que acusava 10 funções neste projeto.
--
-- SEGURANÇA DA MUDANÇA:
-- `ALTER FUNCTION ... SET search_path` apenas anexa uma configuração
-- à função. Não reescreve o corpo, não altera assinatura e não muda
-- comportamento. O bloco abaixo é idempotente: pode rodar quantas
-- vezes for, pois só toca em quem ainda não tem a configuração.
-- ═══════════════════════════════════════════════════════════

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as assinatura
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1
        from unnest(coalesce(p.proconfig, '{}')) as cfg
        where cfg like 'search_path=%'
      )
  loop
    execute format('alter function %s set search_path = public', r.assinatura);
    raise notice 'search_path fixado em %', r.assinatura;
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════
-- CONFERÊNCIA (deve retornar ainda_sem = 0):
--
--   select
--     count(*) filter (where     exists (select 1 from unnest(coalesce(p.proconfig,'{}')) c where c like 'search_path=%')) as com_fixo,
--     count(*) filter (where not exists (select 1 from unnest(coalesce(p.proconfig,'{}')) c where c like 'search_path=%')) as ainda_sem
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.prokind = 'f';
-- ═══════════════════════════════════════════════════════════
