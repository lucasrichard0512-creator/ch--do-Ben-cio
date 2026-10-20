-- Execute no SQL Editor do seu projeto Supabase.
-- Para a lista compartilhar a mesma disponibilidade com TODOS os convidados,
-- configurar config.js com URL e chave PUBLICA anon/publishable.
-- A funcao reserve_gift usa bloqueio de linha para impedir dupla reserva do ultimo item.

create extension if not exists pgcrypto;
create table if not exists public.gifts (
  id text primary key,
  title text not null,
  capacity integer not null check (capacity >= 0)
);
create table if not exists public.gift_reservations (
  id uuid primary key default gen_random_uuid(),
  gift_id text not null references public.gifts(id),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 80),
  quantity integer not null check (quantity between 1 and 100),
  created_at timestamptz not null default now()
);
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 80),
  attending boolean not null,
  guest_count integer not null check (guest_count between 0 and 10),
  message text not null default '' check (char_length(message) <= 250),
  created_at timestamptz not null default now(),
  constraint valid_guest_count check ((attending and guest_count between 1 and 10) or (not attending and guest_count = 0))
);
insert into public.gifts (id,title,capacity) values
 ('berco','Berço',1),('comoda','Cômoda para bebê',1),
 ('carrinho','Carrinho de bebê',1),('bebe-conforto','Bebê conforto',1),
 ('banheira','Banheira',1),('trocador','Trocador',1),
 ('mamadeira','Mamadeira',2),('escova','Kit escova e pente',1),
 ('fraldas-rn','Fraldas RN',2),('fraldas-p','Fraldas P',8),
 ('fraldas-m','Fraldas M',14),('fraldas-g','Fraldas G',10),
 ('fraldas-xg','Fraldas XG',5),('lencos','Lenços umedecidos',15),
 ('pomada','Pomada para assaduras',5),('sabonete','Sabonete líquido infantil',5),
 ('shampoo','Shampoo infantil',3),('bodies','Kit de bodies',4),
 ('macacao','Macacão para bebê',4),('manta','Manta para bebê',3),
 ('toalha','Toalha com capuz',3),('paninhos','Kit de paninhos de boca',6),
 ('lencol','Jogo de lençol para berço',3),('babadores','Kit de babadores',3),
 ('ps5','PlayStation 5 Pro',1)
on conflict (id) do update set title=excluded.title, capacity=excluded.capacity;

alter table public.gifts enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.rsvps enable row level security;
revoke all on public.gifts from anon, authenticated;
revoke all on public.gift_reservations from anon, authenticated;
revoke all on public.rsvps from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Publicamente exponha APENAS as quantidades, nunca os nomes dos convidados.
create or replace view public.gift_status
with (security_invoker = false)
as select g.id, g.capacity,
  greatest(0, g.capacity - coalesce(sum(r.quantity), 0)::integer) as remaining
from public.gifts g
left join public.gift_reservations r on r.gift_id = g.id
group by g.id, g.capacity;
grant select on public.gift_status to anon, authenticated;

create or replace function public.reserve_gift(p_gift_id text, p_guest_name text, p_quantity integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity integer;
  v_taken integer;
begin
  if p_guest_name is null or char_length(trim(p_guest_name)) not between 2 and 80 then
    raise exception 'Nome inválido';
  end if;
  if p_quantity is null or p_quantity not between 1 and 100 then
    raise exception 'Quantidade inválida';
  end if;
  select g.capacity into v_capacity
  from public.gifts as g
  where g.id = p_gift_id
  for update;
  if not found then
    raise exception 'Presente não encontrado';
  end if;
  select coalesce(sum(quantity),0)::integer into v_taken
  from public.gift_reservations where gift_id = p_gift_id;
  if v_taken + p_quantity > v_capacity then
    raise exception 'Quantidade insuficiente';
  end if;
  insert into public.gift_reservations(gift_id, guest_name, quantity)
  values(p_gift_id, trim(p_guest_name), p_quantity);
  return jsonb_build_object('ok',true,'gift_id',p_gift_id,'remaining',v_capacity-v_taken-p_quantity);
end;
$$;
revoke all on function public.reserve_gift(text,text,integer) from public;
grant execute on function public.reserve_gift(text,text,integer) to anon, authenticated;

-- Permite receber presenças, mas não permite que convidados leiam a lista.
grant insert on public.rsvps to anon, authenticated;
drop policy if exists "Public can send rsvp" on public.rsvps;
create policy "Public can send rsvp" on public.rsvps
for insert to anon, authenticated with check (true);

-- Para ver reservas/RSVPs, use o painel privado do Supabase (com sua conta).
-- NUNCA exponha a chave secreta service_role no site.
