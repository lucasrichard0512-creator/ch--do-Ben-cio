-- Chá do Benício • V12.1 (38 tipos / 225 unidades). SQL Editor do Supabase.
-- Reexecutar este arquivo mantém reservas existentes e corrige o catálogo.
-- Use apenas a chave PUBLISHABLE no navegador, NUNCA a secret/service_role.

create table if not exists public.gifts (
  id text primary key,
  name text not null,
  category text not null default 'especiais',
  total_qty integer not null check (total_qty >= 1),
  reserved_qty integer not null default 0 check (reserved_qty >= 0),
  sort_order integer not null,
  constraint reserved_below_limit check (reserved_qty <= total_qty)
);

-- Mantém compatibilidade com versões anteriores do projeto.
alter table public.gifts add column if not exists category text not null default 'especiais';

-- Compatibilidade com o catálogo da primeira versão (que já possuía categoria).
alter table public.gifts add column if not exists active boolean not null default true;
-- A coluna category já foi adicionada acima.

create table if not exists public.gift_reservations (
  id uuid primary key default gen_random_uuid(),
  gift_id text not null references public.gifts(id),
  guest_name text not null check (char_length(guest_name) between 2 and 80),
  quantity integer not null check (quantity >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(guest_name) between 2 and 80),
  attending boolean not null,
  guests_count integer not null check (guests_count between 0 and 15),
  message text not null default '' check (char_length(message) <= 300),
  created_at timestamptz not null default now(),
  constraint valid_attendance check ((attending and guests_count >= 1) or (not attending and guests_count = 0))
);

alter table public.gifts enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.rsvps enable row level security;

revoke all on table public.gifts from anon, authenticated;
revoke all on table public.gift_reservations from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;
grant select on table public.gifts to anon, authenticated;

drop policy if exists "Public can see gift availability" on public.gifts;
create policy "Public can see gift availability" on public.gifts
  for select to anon, authenticated using (true);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.reserve_gift_impl(
  p_gift_id text, p_guest_name text, p_quantity integer
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_gift public.gifts%rowtype;
begin
  if p_gift_id is null or p_guest_name is null or
     char_length(pg_catalog.btrim(p_guest_name)) not between 2 and 80 or
     p_quantity is null or p_quantity not between 1 and 50 then
    raise exception 'DADOS_INVALIDOS';
  end if;

  select * into v_gift from public.gifts where id = p_gift_id for update;
  if not found then raise exception 'PRESENTE_INEXISTENTE'; end if;
  if v_gift.reserved_qty + p_quantity > v_gift.total_qty then
    raise exception 'PRESENTE_ESGOTADO';
  end if;

  update public.gifts set reserved_qty = reserved_qty + p_quantity where id = p_gift_id;
  insert into public.gift_reservations(gift_id, guest_name, quantity)
  values(p_gift_id, pg_catalog.btrim(p_guest_name), p_quantity);
  return pg_catalog.jsonb_build_object('ok', true, 'remaining', v_gift.total_qty - v_gift.reserved_qty - p_quantity);
end;
$$;

create or replace function private.confirm_rsvp_impl(
  p_guest_name text, p_attending boolean, p_guests_count integer, p_message text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if p_guest_name is null or char_length(pg_catalog.btrim(p_guest_name)) not between 2 and 80
    or p_attending is null
    or p_guests_count is null or p_guests_count not between 0 and 15
    or (p_attending and p_guests_count < 1)
    or (not p_attending and p_guests_count <> 0)
    or char_length(coalesce(p_message, '')) > 300 then
    raise exception 'DADOS_INVALIDOS';
  end if;

  insert into public.rsvps(guest_name, attending, guests_count, message)
  values(pg_catalog.btrim(p_guest_name), p_attending, p_guests_count, pg_catalog.btrim(coalesce(p_message, '')));
  return pg_catalog.jsonb_build_object('ok', true);
end;
$$;

revoke all on function private.reserve_gift_impl(text, text, integer) from public, anon, authenticated;
revoke all on function private.confirm_rsvp_impl(text, boolean, integer, text) from public, anon, authenticated;
grant execute on function private.reserve_gift_impl(text, text, integer) to anon, authenticated;
grant execute on function private.confirm_rsvp_impl(text, boolean, integer, text) to anon, authenticated;

create or replace function public.reserve_gift(
  p_gift_id text, p_guest_name text, p_quantity integer
) returns jsonb language sql security invoker set search_path = ''
as $$
  select private.reserve_gift_impl(p_gift_id, p_guest_name, p_quantity);
$$;

create or replace function public.confirm_rsvp(
  p_guest_name text, p_attending boolean, p_guests_count integer, p_message text
) returns jsonb language sql security invoker set search_path = ''
as $$
  select private.confirm_rsvp_impl(p_guest_name, p_attending, p_guests_count, p_message);
$$;

revoke all on function public.reserve_gift(text, text, integer) from public, anon, authenticated;
revoke all on function public.confirm_rsvp(text, boolean, integer, text) from public, anon, authenticated;
grant execute on function public.reserve_gift(text, text, integer) to anon, authenticated;
grant execute on function public.confirm_rsvp(text, boolean, integer, text) to anon, authenticated;

insert into public.gifts (id, name, category, total_qty, sort_order, active) values
  ('fraldas-rn', 'Fralda RN', 'fraldas', 2, 1, true),
  ('fraldas-p', 'Fralda P', 'fraldas', 16, 2, true),
  ('fraldas-m', 'Fralda M', 'fraldas', 28, 3, true),
  ('fraldas-g', 'Fralda G', 'fraldas', 20, 4, true),
  ('fraldas-xg', 'Fralda XG', 'fraldas', 10, 5, true),
  ('lencos', 'Kit de lenços umedecidos', 'higiene', 30, 6, true),
  ('pomada', 'Kit de pomadas para assaduras', 'higiene', 10, 7, true),
  ('sabonete', 'Kit de sabonetes líquidos', 'higiene', 10, 8, true),
  ('shampoo', 'Kit de shampoo infantil', 'higiene', 6, 9, true),
  ('escova-pente', 'Kit escova e pente', 'higiene', 2, 10, true),
  ('kit-unhas', 'Kit de cuidados para unhas', 'higiene', 2, 11, true),
  ('bodies-p', 'Kit de bodies tamanho P', 'roupinhas', 2, 12, true),
  ('bodies-m', 'Kit de bodies tamanho M', 'roupinhas', 4, 13, true),
  ('bodies-g', 'Kit de bodies tamanho G', 'roupinhas', 2, 14, true),
  ('macacao-p', 'Macacão tamanho P', 'roupinhas', 2, 15, true),
  ('macacao-m', 'Macacão tamanho M', 'roupinhas', 4, 16, true),
  ('macacao-g', 'Macacão tamanho G', 'roupinhas', 2, 17, true),
  ('calcas-mijao', 'Kit de calças mijão', 'roupinhas', 6, 18, true),
  ('meias', 'Kit de meias para bebê', 'roupinhas', 4, 19, true),
  ('saida-maternidade', 'Saída de maternidade', 'roupinhas', 2, 20, true),
  ('manta', 'Manta para bebê', 'banho', 6, 21, true),
  ('toalha', 'Toalha com capuz', 'banho', 10, 22, true),
  ('paninhos', 'Kit de paninhos de boca', 'banho', 12, 23, true),
  ('lencol', 'Jogo de lençol para berço', 'banho', 6, 24, true),
  ('fraldas-pano', 'Kit de fraldas de pano', 'banho', 6, 25, true),
  ('cueiros', 'Kit de cueiros de algodão', 'banho', 4, 26, true),
  ('babadores', 'Kit de babadores', 'banho', 4, 27, true),
  ('protetor-colchao', 'Protetor impermeável para colchão', 'banho', 2, 28, true),
  ('mamadeira', 'Mamadeira', 'acessorios', 2, 29, true),
  ('bolsa-maternidade', 'Bolsa maternidade', 'acessorios', 1, 30, true),
  ('banheira', 'Banheira', 'especiais', 1, 31, true),
  ('trocador', 'Trocador', 'especiais', 1, 32, true),
  ('berco', 'Berço', 'especiais', 1, 33, true),
  ('colchao-berco', 'Colchão para berço', 'especiais', 1, 34, true),
  ('carrinho', 'Carrinho de bebê', 'especiais', 1, 35, true),
  ('bebe-conforto', 'Bebê conforto', 'especiais', 1, 36, true),
  ('comoda', 'Cômoda para bebê', 'especiais', 1, 37, true),
  ('ps5-pro', 'PS5 Pro', 'especiais', 1, 38, true)
on conflict (id) do update
  set name = excluded.name,
      category = excluded.category,
      active = true,
      total_qty = greatest(excluded.total_qty, public.gifts.reserved_qty),
      sort_order = excluded.sort_order;

-- Arquiva variantes antigas que saíram do catálogo sem apagar reservas históricas.
update public.gifts set active = false where id not in ('fraldas-rn', 'fraldas-p', 'fraldas-m', 'fraldas-g', 'fraldas-xg', 'lencos', 'pomada', 'sabonete', 'shampoo', 'escova-pente', 'kit-unhas', 'bodies-p', 'bodies-m', 'bodies-g', 'macacao-p', 'macacao-m', 'macacao-g', 'calcas-mijao', 'meias', 'saida-maternidade', 'manta', 'toalha', 'paninhos', 'lencol', 'fraldas-pano', 'cueiros', 'babadores', 'protetor-colchao', 'mamadeira', 'bolsa-maternidade', 'banheira', 'trocador', 'berco', 'colchao-berco', 'carrinho', 'bebe-conforto', 'comoda', 'ps5-pro');

-- V12: dados de contato, painel privado e histórico de notificações.
-- Execute novamente todo este arquivo após atualizar o projeto; mantém os dados já gravados.
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS reminder_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_phone_format
    CHECK (guest_phone IS NULL OR guest_phone ~ '^55[1-9][0-9]{9,10}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_guest_phone_unique ON public.rsvps(guest_phone);

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('gift','rsvp')),
  source_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted','failed','not_configured')),
  detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.reminder_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id uuid NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  reminder_key text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK(status IN ('processing','accepted','failed')),
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reminder_delivery_once UNIQUE (rsvp_id, reminder_key)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users, public.notification_logs, public.reminder_deliveries FROM PUBLIC, anon, authenticated;
-- Sem políticas de SELECT públicas. Leitura restrita a rotas servidoras que verificam o usuário administrador.

-- Na V12, as gravações passam pelo backend Vercel, nunca direto do navegador.
REVOKE EXECUTE ON FUNCTION public.reserve_gift(text,text,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_rsvp(text,boolean,integer,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION private.reserve_gift_impl(text,text,integer) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION private.confirm_rsvp_impl(text,boolean,integer,text) FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.reserve_gift_impl(text,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_gift(text,text,integer) TO service_role;

-- Devolve o id da reserva, permitindo controlar avisos duplicados por id.
CREATE OR REPLACE FUNCTION private.reserve_gift_impl(
  p_gift_id text, p_guest_name text, p_quantity integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_gift public.gifts%rowtype; v_id uuid;
BEGIN
  IF p_gift_id IS NULL OR p_guest_name IS NULL OR
     char_length(pg_catalog.btrim(p_guest_name)) NOT BETWEEN 2 AND 80 OR
     p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'DADOS_INVALIDOS';
  END IF;
  SELECT * INTO v_gift FROM public.gifts WHERE id = p_gift_id AND active = true FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PRESENTE_INEXISTENTE'; END IF;
  IF v_gift.reserved_qty + p_quantity > v_gift.total_qty THEN RAISE EXCEPTION 'PRESENTE_ESGOTADO'; END IF;
  UPDATE public.gifts SET reserved_qty=reserved_qty+p_quantity WHERE id=p_gift_id;
  INSERT INTO public.gift_reservations(gift_id,guest_name,quantity)
  VALUES (p_gift_id,pg_catalog.btrim(p_guest_name),p_quantity) RETURNING id INTO v_id;
  RETURN pg_catalog.jsonb_build_object('ok',true,'reservation_id',v_id,
     'remaining',v_gift.total_qty-v_gift.reserved_qty-p_quantity);
END;
$$;

-- A pessoa pode atualizar sua confirmação com o mesmo WhatsApp, sem dobrar acompanhantes.
CREATE OR REPLACE FUNCTION private.confirm_rsvp_v12_impl(
  p_guest_name text, p_guest_phone text, p_attending boolean, p_guests_count integer,
  p_message text, p_reminder_opt_in boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_id uuid; v_old uuid; v_updated boolean;
BEGIN
  IF p_guest_name IS NULL OR char_length(pg_catalog.btrim(p_guest_name)) NOT BETWEEN 2 AND 80
    OR p_guest_phone IS NULL OR p_guest_phone !~ '^55[1-9][0-9]{9,10}$'
    OR p_attending IS DISTINCT FROM true
    OR p_guests_count IS NULL OR p_guests_count NOT BETWEEN 1 AND 15
    OR char_length(coalesce(p_message,'')) > 300 THEN
    RAISE EXCEPTION 'DADOS_INVALIDOS';
  END IF;
  SELECT id INTO v_old FROM public.rsvps WHERE guest_phone=p_guest_phone;
  INSERT INTO public.rsvps(guest_name,guest_phone,attending,guests_count,message,reminder_opt_in,updated_at)
  VALUES (pg_catalog.btrim(p_guest_name),p_guest_phone,true,p_guests_count,
          pg_catalog.btrim(coalesce(p_message,'')),coalesce(p_reminder_opt_in,false),now())
  ON CONFLICT (guest_phone) DO UPDATE SET
    guest_name=EXCLUDED.guest_name, attending=EXCLUDED.attending,
    guests_count=EXCLUDED.guests_count,message=EXCLUDED.message,
    reminder_opt_in=EXCLUDED.reminder_opt_in,updated_at=now()
  RETURNING id INTO v_id;
  v_updated = v_old IS NOT NULL;
  RETURN pg_catalog.jsonb_build_object('ok',true,'id',v_id,'updated',v_updated,
      'version',pg_catalog.extract(epoch from clock_timestamp())::bigint);
END;
$$;
CREATE OR REPLACE FUNCTION public.confirm_rsvp_v12(
  p_guest_name text, p_guest_phone text, p_attending boolean, p_guests_count integer,
  p_message text, p_reminder_opt_in boolean
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$
  SELECT private.confirm_rsvp_v12_impl(p_guest_name,p_guest_phone,p_attending,
          p_guests_count,p_message,p_reminder_opt_in);
$$;
REVOKE ALL ON FUNCTION private.confirm_rsvp_v12_impl(text,text,boolean,integer,text,boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.confirm_rsvp_v12(text,text,boolean,integer,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.confirm_rsvp_v12_impl(text,text,boolean,integer,text,boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_rsvp_v12(text,text,boolean,integer,text,boolean) TO service_role;

-- 1) Criar usuário com email/senha em Authentication > Users no Supabase.
-- 2) Substituir <EMAIL_DO_ADMIN> e executar a linha abaixo separadamente no SQL Editor:
-- INSERT INTO public.admin_users(user_id)
-- SELECT id FROM auth.users WHERE email='<EMAIL_DO_ADMIN>'
-- ON CONFLICT (user_id) DO NOTHING;

-- Confirma que o backend com a chave secret do Supabase consegue operar estas tabelas.
GRANT ALL ON TABLE public.admin_users, public.notification_logs, public.reminder_deliveries TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.rsvps, public.gifts, public.gift_reservations TO service_role;
