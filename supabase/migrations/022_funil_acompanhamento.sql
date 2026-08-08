-- ═══════════════════════════════════════════════════════════
-- 022 · FUNIL DE ACOMPANHAMENTO
--
-- O produto entregava a lista e esquecia dela. O assinante abordava
-- 50 empresas, 3 respondiam, e não havia onde registrar nada — então,
-- na hora de renovar, ele não conseguia responder "isso me deu
-- cliente?". Quem não enxerga o retorno cancela.
--
-- A tabela prospeccao_contatos já guardava um `status`, mas faltavam
-- duas coisas para ela virar um funil de verdade:
--
--   1. Um estágio no MEIO. Sem ele, "respondeu" e "fechou" ficam
--      colados e o funil não mostra onde a venda trava.
--   2. O VALOR do negócio fechado. Sem isso o painel diz "3 fechados",
--      que não responde a pergunta que importa — quanto entrou.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Novo estágio: negociando ═══

alter table public.prospeccao_contatos
  drop constraint if exists prospeccao_contatos_status_check;

alter table public.prospeccao_contatos
  add constraint prospeccao_contatos_status_check
  check (status in (
    'pendente',      -- registrado, ainda não abordado
    'contatado',     -- mensagem enviada, aguardando
    'respondeu',     -- deu sinal de vida
    'negociando',    -- proposta em discussão
    'fechou',        -- virou cliente
    'sem_resposta',  -- desistiu de esperar
    'descartado'     -- não era perfil
  ));

-- ═══ 2. Valor do negócio ═══

alter table public.prospeccao_contatos
  add column if not exists valor_fechado numeric(12,2)
    check (valor_fechado is null or valor_fechado >= 0);

comment on column public.prospeccao_contatos.valor_fechado is
  'Quanto o assinante faturou com essa empresa. É o que permite comparar o retorno com o preço da assinatura.';

-- Data em que o estágio mudou pela última vez. Serve para mostrar
-- "parado há 12 dias" — um lead esquecido é a perda mais barata de
-- evitar que existe.
alter table public.prospeccao_contatos
  add column if not exists status_mudou_em timestamptz not null default now();

-- ═══ 3. Resumo do funil, calculado no banco ═══

/**
 * Devolve a contagem por estágio e o valor total fechado do assinante
 * logado. Fica no banco, e não no cliente, para não precisar baixar
 * todos os contatos só para contá-los — um assinante ativo acumula
 * milhares de linhas ao longo do ano.
 */
create or replace function public.resumo_funil()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'contatado',    count(*) filter (where status = 'contatado'),
    'respondeu',    count(*) filter (where status = 'respondeu'),
    'negociando',   count(*) filter (where status = 'negociando'),
    'fechou',       count(*) filter (where status = 'fechou'),
    'sem_resposta', count(*) filter (where status = 'sem_resposta'),
    'descartado',   count(*) filter (where status = 'descartado'),
    'total',        count(*),
    'valor_total',  coalesce(sum(valor_fechado) filter (where status = 'fechou'), 0)
  )
  from public.prospeccao_contatos
  where profile_id = auth.uid();
$$;

revoke all on function public.resumo_funil() from public, anon;
grant execute on function public.resumo_funil() to authenticated;

comment on function public.resumo_funil is
  'Resumo do funil do assinante logado. Usa auth.uid(), entao nunca devolve dado de outro perfil.';

-- ═══ 4. Mantém status_mudou_em coerente ═══

create or replace function public.marcar_mudanca_de_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Só carimba quando o estágio realmente mudou. Sem essa checagem,
  -- editar o valor fechado zeraria o "parado há X dias" e esconderia
  -- exatamente o lead que precisava de atenção.
  if new.status is distinct from old.status then
    new.status_mudou_em = now();
  end if;
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_status_mudou on public.prospeccao_contatos;
create trigger trg_status_mudou
  before update on public.prospeccao_contatos
  for each row execute function public.marcar_mudanca_de_status();
