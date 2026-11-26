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

-- Catalog lines take prices from products. Estimate lines (AI photo quotes) keep the
-- quoted price; the shop always confirms by phone before payment.
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
  v_raw jsonb;
  v_quantity int;
  v_size text;
  v_stock int;
  v_product record;
  v_est_name text;
  v_est_price numeric(10, 2);
  v_est_image text;
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

  for v_raw in select value from jsonb_array_elements(p_items) as t(value)
  loop
    v_quantity := (v_raw ->> 'quantity')::int;
    if v_quantity is null or v_quantity < 1 or v_quantity > 20 then
      raise exception 'invalid_quantity';
    end if;

    if coalesce(v_raw ->> 'kind', '') = 'estimate' then
      v_est_name := left(btrim(coalesce(v_raw ->> 'name', '')), 120);
      v_est_price := (v_raw ->> 'price')::numeric(10, 2);
      v_est_image := nullif(left(btrim(coalesce(v_raw ->> 'image_url', '')), 500), '');
      if length(v_est_name) < 2 or v_est_price is null or v_est_price <= 0 or v_est_price > 20000 then
        raise exception 'invalid_estimate';
      end if;
      v_items := v_items || jsonb_build_object(
        'kind', 'estimate',
        'name', v_est_name,
        'slug', 'custom-estimate',
        'image_url', v_est_image,
        'price', v_est_price,
        'quantity', v_quantity,
        'size', null,
        'estimate', jsonb_build_object(
          'productPriceGEL', (v_raw #>> '{estimate,productPriceGEL}')::numeric,
          'shippingGEL', (v_raw #>> '{estimate,shippingGEL}')::numeric,
          'estimatedWeightKg', (v_raw #>> '{estimate,estimatedWeightKg}')::numeric
        )
      );
      v_total := v_total + v_est_price * v_quantity;
      continue;
    end if;

    select p.id, p.name, p.slug, p.image_url, p.price, p.sizes
      into v_product
    from public.products p
    where p.id = (v_raw ->> 'product_id')::bigint;

    if not found then
      raise exception 'product_unavailable';
    end if;

    v_size := null;
    if jsonb_array_length(v_product.sizes) > 0 then
      v_size := nullif(btrim(coalesce(v_raw ->> 'size', '')), '');
      if v_size is null then
        raise exception 'size_required';
      end if;
      select (s ->> 'stock')::int into v_stock
      from jsonb_array_elements(v_product.sizes) as s
      where s ->> 'size' = v_size
      limit 1;
      if not found then
        raise exception 'size_unavailable';
      end if;
      if coalesce(v_stock, 0) < v_quantity then
        raise exception 'not_enough_stock';
      end if;
    end if;

    v_items := v_items || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'slug', v_product.slug,
      'image_url', v_product.image_url,
      'price', v_product.price,
      'quantity', v_quantity,
      'size', v_size
    );
    v_total := v_total + v_product.price * v_quantity;
  end loop;

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

-- Same as place_order, but returns the saved order so the server can email a confirmation
-- without needing read access to other people's orders.
create or replace function public.place_order_with_details(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id bigint := public.place_order(p_customer, p_items);
begin
  return (
    select jsonb_build_object(
      'id', o.id,
      'customer_name', o.customer_name,
      'phone', o.phone,
      'email', o.email,
      'city', o.city,
      'address', o.address,
      'note', o.note,
      'items', o.items,
      'total', o.total,
      'created_at', o.created_at
    )
    from public.orders o
    where o.id = v_order_id
  );
end;
$$;

revoke all on function public.place_order_with_details(jsonb, jsonb) from public;
grant execute on function public.place_order_with_details(jsonb, jsonb) to anon, authenticated;
