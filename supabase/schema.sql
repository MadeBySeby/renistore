-- Renistore database setup. Run once in a new Supabase project:
-- Dashboard -> SQL Editor -> New query -> paste this file -> Run.

-- Profiles: one row per user, created automatically on signup.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Products: anyone can browse, only admins can change.
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  price numeric(10, 2) not null default 0,
  image_url text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone reads products" on public.products;
create policy "Anyone reads products" on public.products
  for select using (true);

drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products" on public.products
  for insert with check (public.is_admin());

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products" on public.products
  for update using (public.is_admin());

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products
  for delete using (public.is_admin());

-- Product images: public bucket, admins upload.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Anyone reads product images" on storage.objects;
create policy "Anyone reads product images" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

-- After you sign up on the site, make yourself admin (replace the email):
-- update public.profiles set role = 'admin' where email = 'you@example.com';
