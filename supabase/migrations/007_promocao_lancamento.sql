-- ═══════════════════════════════════════════════════════════
-- PROSPECTX — CONTADOR DE VAGAS DA PROMOÇÃO DE LANÇAMENTO
-- Execute após 001 a 006 no SQL Editor do Supabase
--
-- Controla quantas vagas da promoção (ex: "100 primeiros assinantes
-- com 50% de desconto") já foram usadas, de forma segura mesmo com
-- várias pessoas assinando ao mesmo tempo.
-- ═══════════════════════════════════════════════════════════

create table public.promocao_vagas (
  id integer primary key default 1,
  vagas_usadas integer not null default 0,
  vagas_totais integer not null default 100,
  ativa boolean not null default false,
  constraint singleton check (id = 1)
);

comment on table public.promocao_vagas is 'Linha única que controla o contador da promoção de lançamento. id sempre 1 (singleton).';

insert into public.promocao_vagas (id, vagas_usadas, vagas_totais, ativa)
values (1, 0, 100, false)
on conflict (id) do nothing;

-- ═══ FUNÇÃO: tenta reservar uma vaga da promoção (atômica) ═══
-- Retorna sucesso=false se a promoção estiver inativa ou esgotada.
create or replace function public.reservar_vaga_promocao()
returns table(sucesso boolean, vagas_restantes integer) as $$
declare
  v_registro record;
begin
  select * into v_registro from public.promocao_vagas where id = 1 for update;

  if not v_registro.ativa then
    return query select false, 0;
    return;
  end if;

  if v_registro.vagas_usadas >= v_registro.vagas_totais then
    return query select false, 0;
    return;
  end if;

  update public.promocao_vagas
  set vagas_usadas = vagas_usadas + 1
  where id = 1;

  return query select true, (v_registro.vagas_totais - v_registro.vagas_usadas - 1);
end;
$$ language plpgsql security definer;

grant execute on function public.reservar_vaga_promocao() to authenticated, anon;

-- ═══ RLS: qualquer um pode ver quantas vagas restam (sem expor dados sensíveis) ═══
alter table public.promocao_vagas enable row level security;

create policy "Qualquer um pode ver o status da promoção"
  on public.promocao_vagas for select
  using (true);

-- ═══════════════════════════════════════════════════════════
-- COMO ATIVAR A PROMOÇÃO (quando estiver pronto):
--
-- 1. No SQL Editor, rode:
--    update public.promocao_vagas set ativa = true, vagas_totais = 100 where id = 1;
--
-- 2. Na Vercel, em Settings > Environment Variables, adicione:
--    VITE_PROMOCAO_ATIVA = true
--    VITE_PROMOCAO_PRECO_MENSAL = 247.00
--    VITE_PROMOCAO_PRECO_ANUAL = 2499.00
--
-- 3. Redeploy o projeto na Vercel para a variável entrar em vigor.
--
-- Para DESATIVAR a promoção (esgotada ou encerrada por decisão sua):
--    update public.promocao_vagas set ativa = false where id = 1;
-- ═══════════════════════════════════════════════════════════
