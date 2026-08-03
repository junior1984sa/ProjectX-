-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CACHE DE BUSCAS
-- Execute após 001 a 019 no SQL Editor do Supabase
--
-- Guarda o resultado bruto de cada busca por um período, para não
-- gastar chamada de API com a mesma pergunta duas vezes.
--
-- O ganho é COLETIVO: a busca por "marmoraria, Curitiba" feita por um
-- assinante serve todos os outros até expirar. Num produto onde gente
-- da mesma região procura os mesmos segmentos, isso se repete muito.
--
-- Vale para as duas fontes, por motivos diferentes:
--   Google Places  → cobra por chamada, e o gratuito é ~1.000/mês
--   OpenStreetMap  → gratuito, mas bloqueia sob uso intenso, e o
--                    bloqueio atinge todos os assinantes de uma vez
--
-- POR QUE FICA NO SERVIDOR:
-- No navegador, cada cliente teria o próprio cache e a economia seria
-- quase nenhuma. Aqui, uma busca paga serve todo mundo.
-- ═══════════════════════════════════════════════════════════

create table if not exists public.cache_buscas (
  id uuid primary key default uuid_generate_v4(),

  -- Normalizada na Edge Function: minúsculas, sem acento, sem espaço
  -- extra. Inclui tudo que muda o resultado: segmento, cidade, estado,
  -- raio, país, quantidade e fonte. Faltando qualquer um deles, duas
  -- buscas diferentes colidiriam e a segunda receberia resposta errada.
  chave text not null unique,

  fonte text not null check (fonte in ('google', 'openstreetmap')),
  resposta jsonb not null,

  -- Quantas vezes esta entrada evitou uma chamada de API. Serve para
  -- medir se o cache está valendo a pena de verdade.
  reaproveitamentos integer not null default 0,

  criado_em timestamptz not null default now(),
  expira_em timestamptz not null
);

comment on table public.cache_buscas is
  'Resultados de busca guardados por periodo, para economizar chamadas de API. Escrito apenas pelas Edge Functions.';

create index if not exists idx_cache_chave  on public.cache_buscas (chave);
create index if not exists idx_cache_expira on public.cache_buscas (expira_em);

-- ═══ Leitura com contagem de uso ═══
-- Devolve a resposta guardada e já incrementa o contador, numa única
-- ida ao banco. Retorna vazio se não existir ou se tiver expirado.

create or replace function public.ler_cache_busca(p_chave text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resposta jsonb;
begin
  update public.cache_buscas
  set reaproveitamentos = reaproveitamentos + 1
  where chave = p_chave and expira_em > now()
  returning resposta into v_resposta;

  return v_resposta;
end;
$$;

-- ═══ Gravação ═══

create or replace function public.gravar_cache_busca(
  p_chave text,
  p_fonte text,
  p_resposta jsonb,
  p_dias_validade integer default 30
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cache_buscas (chave, fonte, resposta, expira_em)
  values (p_chave, p_fonte, p_resposta, now() + (p_dias_validade || ' days')::interval)
  on conflict (chave) do update set
    resposta = excluded.resposta,
    fonte = excluded.fonte,
    expira_em = excluded.expira_em,
    criado_em = now(),
    reaproveitamentos = 0;

  -- Limpeza oportunista: remove expirados de vez em quando, sem
  -- precisar de tarefa agendada. O sorteio evita fazer isso a cada
  -- gravação, o que seria desperdício.
  if random() < 0.02 then
    delete from public.cache_buscas where expira_em < now();
  end if;
end;
$$;

-- ═══ Segurança ═══
-- O cache é escrito e lido SÓ pelas Edge Functions, com service_role.
-- Nenhum cliente precisa acessá-lo: expor permitiria a alguém ler
-- resultados de buscas que não pagou.

alter table public.cache_buscas enable row level security;

revoke all on function public.ler_cache_busca(text) from public, anon, authenticated;
grant execute on function public.ler_cache_busca(text) to service_role;

revoke all on function public.gravar_cache_busca(text, text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.gravar_cache_busca(text, text, jsonb, integer) to service_role;

-- ═══════════════════════════════════════════════════════════
-- PARA MEDIR SE ESTÁ VALENDO A PENA:
--
--   select fonte,
--          count(*)                    as entradas,
--          sum(reaproveitamentos)      as chamadas_economizadas,
--          round(avg(reaproveitamentos), 1) as media_por_entrada
--   from public.cache_buscas
--   group by fonte;
--
-- Buscas vazias também são guardadas (com validade menor): um segmento
-- sem resultados custaria uma chamada a cada tentativa, que é o caso
-- mais desperdiçado de todos.
-- ═══════════════════════════════════════════════════════════
