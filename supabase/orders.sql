-- Orders without online payment: customers place an order, the store contacts them.
-- Run once in the Supabase SQL Editor (safe to re-run).

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  city text,
  address text,
  note text,
  items jsonb not null,
  total numeric(10, 2) not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders
  for select using (public.is_admin());

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select using (user_id is not null and user_id = auth.uid());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
  for update using (public.is_admin());

-- No insert policy: orders are only created through place_order, which takes
-- prices from the products table so a client can't change what it pays.
create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_customer ->> 'name', ''));
  v_phone text := btrim(coalesce(p_customer ->> 'phone', ''));
  v_items jsonb := '[]'::jsonb;
  v_total numeric(10, 2) := 0;
  v_line record;
  v_order_id bigint;
begin
  if length(v_name) < 2 or length(v_name) > 100 then
    raise exception 'invalid_name';
  end if;
  if v_phone !~ '^\+?[0-9 ()-]{6,20}$' then
    raise exception 'invalid_phone';
  end if;
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 50 then
    raise exception 'invalid_items';
  end if;

  for v_line in
    select p.id, p.name, p.slug, p.image_url, p.price,
           (i ->> 'quantity')::int as quantity
    from jsonb_array_elements(p_items) as i
    join public.products p on p.id = (i ->> 'product_id')::bigint
  loop
    if v_line.quantity < 1 or v_line.quantity > 20 then
      raise exception 'invalid_quantity';
    end if;
    v_items := v_items || jsonb_build_object(
      'product_id', v_line.id,
      'name', v_line.name,
      'slug', v_line.slug,
      'image_url', v_line.image_url,
      'price', v_line.price,
      'quantity', v_line.quantity
    );
    v_total := v_total + v_line.price * v_line.quantity;
  end loop;

  if jsonb_array_length(v_items) <> jsonb_array_length(p_items) then
    raise exception 'product_unavailable';
  end if;

  insert into public.orders (user_id, customer_name, phone, email, city, address, note, items, total)
  values (
    auth.uid(),
    v_name,
    v_phone,
    nullif(left(btrim(coalesce(p_customer ->> 'email', '')), 200), ''),
    nullif(left(btrim(coalesce(p_customer ->> 'city', '')), 100), ''),
    nullif(left(btrim(coalesce(p_customer ->> 'address', '')), 300), ''),
    nullif(left(btrim(coalesce(p_customer ->> 'note', '')), 1000), ''),
    v_items,
    v_total
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
