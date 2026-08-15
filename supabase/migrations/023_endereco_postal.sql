-- ═══════════════════════════════════════════════════════════
-- ENDEREÇO POSTAL DO REMETENTE
--
-- O CAN-SPAM exige que toda mensagem comercial enviada a
-- destinatário nos Estados Unidos traga o endereço postal físico
-- válido do remetente. Sem esse campo, o disparo para os EUA é
-- irregular — e é justamente o mercado que a operação quer atacar
-- primeiro.
--
-- Fica NULO por padrão de propósito: exigir de todo mundo travaria
-- o cadastro de quem só vende no Brasil, onde a obrigação não
-- existe. A validação é condicional e mora no servidor de disparo:
-- só é exigido quando há destinatário em país que pede.
-- ═══════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists endereco_postal text;

comment on column public.profiles.endereco_postal is
  'Endereço postal físico completo da empresa. Obrigatório no rodapé '
  'de e-mail comercial enviado aos EUA (CAN-SPAM). Validado de forma '
  'condicional pela Edge Function enviar-email-lote.';
