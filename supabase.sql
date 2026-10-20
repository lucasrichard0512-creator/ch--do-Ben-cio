-- Chá do Benício • executar UMA VEZ no SQL Editor do Supabase.
-- Reexecutar este arquivo mantém reservas existentes e corrige o catálogo.
-- Use apenas a chave PUBLISHABLE no navegador, NUNCA a secret/service_role.

create table if not exists public.gifts (
  id text primary key,
  name text not null,
  category text not null,
  total_qty integer not null check (total_qty >= 1),
  reserved_qty integer not null default 0 check (reserved_qty >= 0),
  sort_order integer not null,
  constraint reserved_below_limit check (reserved_qty <= total_qty)
);

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

-- Não permitir escrita nas tabelas diretamente por quem visita o site.
revoke all on table public.gifts from anon, authenticated;
revoke all on table public.gift_reservations from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;
grant select on table public.gifts to anon, authenticated;

drop policy if exists "Public can see gift availability" on public.gifts;
create policy "Public can see gift availability" on public.gifts
  for select to anon, authenticated using (true);

-- Funções privilegiadas vivem no schema privado; as chamadas da API são invoker.
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

  -- Bloqueia a linha: duas reservas simultâneas nunca ocupam a última unidade.
  select * into v_gift from public.gifts where id = p_gift_id for update;
  if not found then raise exception 'PRESENTE_INEXISTENTE'; end if;
  if v_gift.reserved_qty + p_quantity > v_gift.total_qty then
    raise exception 'PRESENTE_ESGOTADO';
  end if;

  update public.gifts set reserved_qty = reserved_qty + p_quantity where id = p_gift_id;
  insert into public.gift_reservations(gift_id,guest_name,quantity)
  values(p_gift_id,pg_catalog.btrim(p_guest_name),p_quantity);
  return pg_catalog.jsonb_build_object('ok',true,'remaining',v_gift.total_qty-v_gift.reserved_qty-p_quantity);
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
    or char_length(coalesce(p_message,'')) > 300 then
    raise exception 'DADOS_INVALIDOS';
  end if;
  insert into public.rsvps(guest_name,attending,guests_count,message)
  values(pg_catalog.btrim(p_guest_name),p_attending,p_guests_count,pg_catalog.btrim(coalesce(p_message,'')));
  return pg_catalog.jsonb_build_object('ok',true);
end;
$$;

revoke all on function private.reserve_gift_impl(text,text,integer) from public, anon, authenticated;
revoke all on function private.confirm_rsvp_impl(text,boolean,integer,text) from public, anon, authenticated;
grant execute on function private.reserve_gift_impl(text,text,integer) to anon, authenticated;
grant execute on function private.confirm_rsvp_impl(text,boolean,integer,text) to anon, authenticated;

-- Somente wrappers abaixo aparecem na API REST pública.
create or replace function public.reserve_gift(
  p_gift_id text, p_guest_name text, p_quantity integer
) returns jsonb language sql security invoker set search_path = ''
as $$
  select private.reserve_gift_impl(p_gift_id,p_guest_name,p_quantity);
$$;

create or replace function public.confirm_rsvp(
  p_guest_name text, p_attending boolean, p_guests_count integer, p_message text
) returns jsonb language sql security invoker set search_path = ''
as $$
  select private.confirm_rsvp_impl(p_guest_name,p_attending,p_guests_count,p_message);
$$;

revoke all on function public.reserve_gift(text,text,integer) from public, anon, authenticated;
revoke all on function public.confirm_rsvp(text,boolean,integer,text) from public, anon, authenticated;
grant execute on function public.reserve_gift(text,text,integer) to anon, authenticated;
grant execute on function public.confirm_rsvp(text,boolean,integer,text) to anon, authenticated;

-- Lista oficial. Mantenha IDs sincronizados com app.js.
insert into public.gifts (id,name,category,total_qty,sort_order) values
  ('fraldas-rn','Fraldas RN','higiene',2,1),
  ('fraldas-p','Fraldas P','higiene',8,2),
  ('fraldas-m','Fraldas M','higiene',14,3),
  ('fraldas-g','Fraldas G','higiene',10,4),
  ('fraldas-xg','Fraldas XG','higiene',5,5),
  ('lencos','Lenços umedecidos','higiene',15,6),
  ('pomada','Pomada para assaduras','higiene',5,7),
  ('sabonete','Sabonete líquido infantil','higiene',5,8),
  ('shampoo','Shampoo infantil','higiene',3,9),
  ('bodies','Kit de bodies','enxoval',4,10),
  ('macacao','Macacão de bebê','enxoval',4,11),
  ('manta','Manta para bebê','enxoval',3,12),
  ('toalha','Toalha com capuz','enxoval',3,13),
  ('paninhos','Kit de paninhos de boca','enxoval',6,14),
  ('lencol','Jogo de lençol para berço','enxoval',3,15),
  ('babadores','Kit de babadores','enxoval',3,16),
  ('mamadeira','Mamadeira','acessorios',2,17),
  ('escova-pente','Kit escova e pente','acessorios',1,18),
  ('banheira','Banheira','acessorios',1,19),
  ('trocador','Trocador','acessorios',1,20),
  ('berco','Berço','especiais',1,21),
  ('carrinho','Carrinho de bebê','especiais',1,22),
  ('bebe-conforto','Bebê conforto','especiais',1,23),
  ('comoda','Cômoda para bebê','especiais',1,24),
  ('ps5-pro','PlayStation 5 Pro','especiais',1,25)
on conflict (id) do update
  set name = excluded.name, category = excluded.category,
      total_qty = greatest(excluded.total_qty, public.gifts.reserved_qty),
      sort_order = excluded.sort_order;
