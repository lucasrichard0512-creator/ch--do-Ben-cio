-- Chá do Benício V8: cole no SQL Editor do Supabase e execute uma única vez.
-- IMPORTANTE: rode isso num projeto próprio; o script cria tabelas para o convite.
create table if not exists public.gift_inventory (
  gift_id text primary key,
  total integer not null check (total >= 1),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= total)
);
create table if not exists public.gift_reservations (
  id bigint generated always as identity primary key,
  gift_id text not null references public.gift_inventory(gift_id),
  guest_name text not null check (char_length(btrim(guest_name)) between 2 and 80),
  quantity integer not null check (quantity between 1 and 50),
  created_at timestamptz not null default now()
);
create table if not exists public.rsvp (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(btrim(guest_name)) between 2 and 80),
  observation text not null default '' check (char_length(observation) <= 400),
  created_at timestamptz not null default now()
);
insert into public.gift_inventory(gift_id,total) values
('fraldas-rn',2),('fraldas-p',8),('fraldas-m',14),('fraldas-g',10),('fraldas-xg',5),
('lencos',15),('pomada',5),('sabonete',5),('shampoo',3),('bodies',4),('macacao',4),
('manta',3),('toalha',3),('paninhos',6),('lencol',3),('babadores',3),('mamadeira',2),
('escova',1),('banheira',1),('trocador',1),('berco',1),('carrinho',1),
('bebe-conforto',1),('comoda',1),('ps5',1)
on conflict (gift_id) do nothing;
alter table public.gift_inventory enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.rsvp enable row level security;
-- Usuários anônimos veem apenas as quantidades, nunca nomes de quem reservou.
drop policy if exists "public inventory read" on public.gift_inventory;
create policy "public inventory read" on public.gift_inventory for select to anon using (true);
drop policy if exists "rsvp anonymous insert" on public.rsvp;
create policy "rsvp anonymous insert" on public.rsvp for insert to anon with check (true);
-- Anon não tem permissão de UPDATE/INSERT direto na tabela gift_reservations.
-- A função é SECURITY DEFINER e faz UPDATE condicional atômico para evitar reservas duplicadas.
create or replace function public.reserve_gift(p_gift_id text,p_guest_name text,p_quantity integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare remaining int;
begin
 if p_gift_id is null or char_length(btrim(coalesce(p_guest_name,''))) not between 2 and 80 or p_quantity is null or p_quantity not between 1 and 50 then
    raise exception 'Dados inválidos para reservar o presente';
 end if;
 update public.gift_inventory set reserved=reserved+p_quantity
 where gift_id=p_gift_id and reserved+p_quantity<=total
 returning total-reserved into remaining;
 if not found then raise exception 'Este presente está indisponível na quantidade selecionada'; end if;
 insert into public.gift_reservations(gift_id,guest_name,quantity) values(p_gift_id,btrim(p_guest_name),p_quantity);
 return jsonb_build_object('success',true,'remaining',remaining);
end $$;
revoke all on function public.reserve_gift(text,text,integer) from public;
grant usage on schema public to anon;
grant select on public.gift_inventory to anon;
grant insert on public.rsvp to anon;
grant execute on function public.reserve_gift(text,text,integer) to anon;
