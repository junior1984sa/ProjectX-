-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — ÁREA ADMINISTRATIVA (controle de custos e métricas)
-- Execute após 001 a 011 no SQL Editor do Supabase
--
-- Cria a base para o dono do negócio ter controle total:
--   • quem são os associados e em que situação estão
--   • quanto entra (receita recorrente)
--   • quanto sai (custos de infra, APIs, ads, lojas de apps)
--   • quanto sobra (lucro) e onde vale investir mais
--
-- SEGURANÇA: tudo aqui é restrito a perfis marcados como admin.
-- Um usuário comum não consegue ler custos nem métricas globais,
-- mesmo se tentar chamar as funções diretamente pela API.
-- ═══════════════════════════════════════════════════════════

-- ═══ 1. Marcar quem é administrador ═══

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Acesso à área administrativa (custos, métricas globais, lista de associados)';

-- Função auxiliar reutilizada pelas políticas de segurança abaixo
create or replace function public.usuario_eh_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$ language sql stable security definer;

-- ═══ 2. Tabela de custos operacionais ═══

create table if not exists public.custos_operacionais (
  id uuid primary key default uuid_generate_v4(),
  categoria text not null check (categoria in (
    'infraestrutura',   -- Vercel, Supabase
    'api',              -- Google Places, Anthropic, CNPJ
    'marketing',        -- Google Ads, Meta Ads, influenciadores
    'lojas_apps',       -- Google Play, Apple App Store
    'dominio',          -- registro e renovação de domínio
    'ferramentas',      -- e-mail transacional, analytics, design
    'pessoal',          -- freelancers, equipe
    'impostos',
    'outros'
  )),
  descricao text not null,
  valor numeric(12,2) not null check (valor >= 0),
  moeda text not null default 'BRL' check (moeda in ('BRL', 'USD', 'EUR')),
  recorrencia text not null check (recorrencia in ('mensal', 'anual', 'unico')),
  -- Para custos únicos, a data em que aconteceu. Para recorrentes,
  -- a data em que a assinatura começou.
  data_referencia date not null default current_date,
  ativo boolean not null default true,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.custos_operacionais is
  'Todos os custos do negócio, para cálculo de lucro real e decisão de onde investir';

create index if not exists idx_custos_categoria on public.custos_operacionais (categoria);
create index if not exists idx_custos_ativo on public.custos_operacionais (ativo);

-- ═══ 3. Cotação do dólar (para normalizar custos em USD) ═══
-- Guardada manualmente pelo admin; evita depender de API externa
-- para um número que muda pouco e que ele pode querer travar.

create table if not exists public.configuracao_financeira (
  id integer primary key default 1,
  cotacao_dolar numeric(8,4) not null default 5.50,
  atualizado_em timestamptz not null default now(),
  constraint singleton_config check (id = 1)
);

insert into public.configuracao_financeira (id, cotacao_dolar)
values (1, 5.50)
on conflict (id) do nothing;

-- ═══ 4. FUNÇÃO: custo mensal normalizado ═══
-- Converte tudo para BRL/mês: anual vira /12, único não entra no
-- recorrente (é mostrado à parte), USD é convertido pela cotação.

create or replace function public.custo_mensal_total()
returns numeric as $$
declare
  v_cotacao numeric;
  v_total numeric;
begin
  if not public.usuario_eh_admin() then
    raise exception 'Acesso restrito a administradores';
  end if;

  select cotacao_dolar into v_cotacao from public.configuracao_financeira where id = 1;

  select coalesce(sum(
    case
      when moeda = 'USD' then valor * v_cotacao
      when moeda = 'EUR' then valor * v_cotacao * 1.08
      else valor
    end
    *
    case recorrencia
      when 'mensal' then 1.0
      when 'anual'  then 1.0 / 12.0
      else 0                      -- custos únicos não entram no mensal
    end
  ), 0) into v_total
  from public.custos_operacionais
  where ativo = true;

  return round(v_total, 2);
end;
$$ language plpgsql security definer;

-- ═══ 5. FUNÇÃO: receita recorrente mensal (MRR) ═══
-- Cada assinatura ativa contribui com (valor_total / meses_do_plano).

create or replace function public.receita_mensal_recorrente()
returns numeric as $$
declare
  v_total numeric;
begin
  if not public.usuario_eh_admin() then
    raise exception 'Acesso restrito a administradores';
  end if;

  select coalesce(sum(
    a.valor / case a.plano
      when 'anual'      then 12.0
      when 'semestral'  then 6.0
      when 'trimestral' then 3.0
      else 1.0
    end
  ), 0) into v_total
  from public.assinaturas a
  join public.profiles p on p.id = a.profile_id
  where a.status = 'aprovada'
    and a.cancelado_em is null
    and p.status_assinatura = 'ativa'
    and a.valor > 0;              -- ignora cortesias e acesso vitalício

  return round(v_total, 2);
end;
$$ language plpgsql security definer;

-- ═══ 6. FUNÇÃO: painel completo de métricas ═══
-- Retorna tudo que o dashboard precisa em uma única chamada.

create or replace function public.painel_administrativo()
returns json as $$
declare
  v_resultado json;
  v_mrr numeric;
  v_custo numeric;
begin
  if not public.usuario_eh_admin() then
    raise exception 'Acesso restrito a administradores';
  end if;

  v_mrr := public.receita_mensal_recorrente();
  v_custo := public.custo_mensal_total();

  select json_build_object(
    -- ── Associados ──
    'associados', json_build_object(
      'total',      (select count(*) from public.profiles),
      'ativos',     (select count(*) from public.profiles where status_assinatura = 'ativa'),
      'em_trial',   (select count(*) from public.profiles where status_assinatura = 'trial'),
      'em_atraso',  (select count(*) from public.profiles where status_assinatura = 'atraso'),
      'cancelados', (select count(*) from public.profiles where status_assinatura = 'cancelada'),
      'pendentes',  (select count(*) from public.profiles where status_assinatura = 'pendente'),
      'novos_30_dias', (select count(*) from public.profiles where criado_em >= now() - interval '30 days')
    ),

    -- ── Financeiro ──
    'financeiro', json_build_object(
      'receita_mensal', v_mrr,
      'custo_mensal',   v_custo,
      'lucro_mensal',   round(v_mrr - v_custo, 2),
      'margem_pct',     case when v_mrr > 0
                          then round(((v_mrr - v_custo) / v_mrr) * 100, 1)
                          else 0 end,
      'receita_anual_projetada', round(v_mrr * 12, 2),
      'custos_unicos_total', (
        select coalesce(sum(valor), 0) from public.custos_operacionais
        where recorrencia = 'unico' and ativo = true
      ),
      -- Quantos assinantes são necessários só para cobrir os custos
      'ponto_equilibrio_assinantes', case
        when v_mrr > 0 and (select count(*) from public.profiles where status_assinatura = 'ativa') > 0
        then ceil(v_custo / (v_mrr / (select count(*) from public.profiles where status_assinatura = 'ativa')))
        else null
      end
    ),

    -- ── Distribuição por plano ──
    'planos', (
      select coalesce(json_agg(json_build_object(
        'plano', plano,
        'quantidade', qtd,
        'receita_total', receita
      )), '[]'::json)
      from (
        select a.plano, count(*) as qtd, sum(a.valor) as receita
        from public.assinaturas a
        join public.profiles p on p.id = a.profile_id
        where a.status = 'aprovada' and a.cancelado_em is null
          and p.status_assinatura = 'ativa' and a.valor > 0
        group by a.plano
      ) sub
    ),

    -- ── Custos por categoria (para saber onde cortar) ──
    'custos_por_categoria', (
      select coalesce(json_agg(json_build_object(
        'categoria', categoria,
        'total_mensal', total
      ) order by total desc), '[]'::json)
      from (
        select c.categoria,
          round(sum(
            (case when c.moeda = 'USD'
                  then c.valor * (select cotacao_dolar from public.configuracao_financeira where id = 1)
                  else c.valor end)
            * (case c.recorrencia when 'mensal' then 1.0 when 'anual' then 1.0/12.0 else 0 end)
          ), 2) as total
        from public.custos_operacionais c
        where c.ativo = true and c.recorrencia <> 'unico'
        group by c.categoria
      ) sub
      where total > 0
    ),

    -- ── Uso da plataforma ──
    'uso', json_build_object(
      'buscas_30_dias', (
        select count(*) from public.historico_buscas
        where criado_em >= now() - interval '30 days'
      ),
      'creditos_consumidos_30_dias', (
        select coalesce(sum(creditos_gastos), 0) from public.historico_buscas
        where criado_em >= now() - interval '30 days'
      ),
      'perfis_publicados_diretorio', (
        select count(*) from public.perfis_diretorio where publicado = true
      )
    )
  ) into v_resultado;

  return v_resultado;
end;
$$ language plpgsql security definer;

-- ═══ 7. FUNÇÃO: lista de associados para a área admin ═══

create or replace function public.listar_associados()
returns table (
  id uuid,
  nome_empresa text,
  email_contato text,
  cidade text,
  estado text,
  segmento text,
  status_assinatura text,
  plano text,
  valor numeric,
  criado_em timestamptz,
  creditos_disponiveis integer
) as $$
begin
  if not public.usuario_eh_admin() then
    raise exception 'Acesso restrito a administradores';
  end if;

  return query
  select
    p.id,
    p.nome_empresa,
    p.email_contato,
    p.cidade,
    p.estado,
    p.segmento,
    p.status_assinatura::text,
    a.plano,
    a.valor,
    p.criado_em,
    c.creditos_disponiveis
  from public.profiles p
  left join lateral (
    select plano, valor from public.assinaturas
    where profile_id = p.id and cancelado_em is null
    order by criado_em desc limit 1
  ) a on true
  left join public.creditos_usuario c on c.id = p.id
  order by p.criado_em desc;
end;
$$ language plpgsql security definer;

-- ═══ 8. SEGURANÇA (RLS) ═══

alter table public.custos_operacionais enable row level security;
alter table public.configuracao_financeira enable row level security;

create policy "Apenas admin lê custos"
  on public.custos_operacionais for select
  using (public.usuario_eh_admin());

create policy "Apenas admin insere custos"
  on public.custos_operacionais for insert
  with check (public.usuario_eh_admin());

create policy "Apenas admin atualiza custos"
  on public.custos_operacionais for update
  using (public.usuario_eh_admin());

create policy "Apenas admin remove custos"
  on public.custos_operacionais for delete
  using (public.usuario_eh_admin());

create policy "Apenas admin lê configuração financeira"
  on public.configuracao_financeira for select
  using (public.usuario_eh_admin());

create policy "Apenas admin atualiza configuração financeira"
  on public.configuracao_financeira for update
  using (public.usuario_eh_admin());

grant execute on function public.painel_administrativo() to authenticated;
grant execute on function public.listar_associados() to authenticated;
grant execute on function public.custo_mensal_total() to authenticated;
grant execute on function public.receita_mensal_recorrente() to authenticated;

-- ═══ 9. Custos iniciais já conhecidos ═══
-- Valores de referência levantados na pesquisa. Ajuste conforme
-- for realmente contratando cada serviço.

insert into public.custos_operacionais (categoria, descricao, valor, moeda, recorrencia, ativo, observacao)
values
  ('infraestrutura', 'Vercel Pro (hospedagem do site)',        20.00, 'USD', 'mensal', false, 'Obrigatório para uso comercial — o plano Hobby proíbe'),
  ('infraestrutura', 'Supabase Pro (banco, login, storage)',   25.00, 'USD', 'mensal', false, 'Elimina a pausa por inatividade e adiciona backup diário'),
  ('api',            'Google Places API (busca de empresas)',   0.00, 'USD', 'mensal', false, 'Variável conforme volume — ver estimativa por faixa'),
  ('api',            'Anthropic API (IA de segmentos)',         0.00, 'USD', 'mensal', false, 'Só dispara em segmento fora da tabela — custo baixo'),
  ('dominio',        'Domínio .com',                           15.00, 'USD', 'anual',  false, 'Renovação anual'),
  ('lojas_apps',     'Google Play (taxa de desenvolvedor)',     25.00, 'USD', 'unico',  false, 'Pagamento único, vitalício'),
  ('lojas_apps',     'Apple App Store (taxa de desenvolvedor)', 99.00, 'USD', 'anual',  false, 'Recorrente todo ano'),
  ('marketing',      'Google Ads',                              0.00, 'BRL', 'mensal', false, 'Definir orçamento ao iniciar campanhas'),
  ('marketing',      'Meta Ads (Instagram/Facebook)',           0.00, 'BRL', 'mensal', false, 'Definir orçamento ao iniciar campanhas')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════
-- COMO SE TORNAR ADMIN (rode uma vez, com o seu e-mail):
--
--   update public.profiles set is_admin = true
--   where email_contato = 'seu@email.com';
--
-- Depois disso, o menu "Administração" aparece no app para você.
-- ═══════════════════════════════════════════════════════════
