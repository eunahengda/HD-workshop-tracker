create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text not null,
  role text not null check (role in ('Owner', 'Manager', 'Production', 'Driver')),
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles
set role = case
  when role = 'Workshop Manager' then 'Manager'
  when role = 'Production Supervisor' then 'Production'
  when role in ('Owner', 'Manager', 'Production', 'Driver') then role
  else 'Production'
end;
alter table public.profiles
  add constraint profiles_role_check check (role in ('Owner', 'Manager', 'Production', 'Driver'));

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer text not null,
  phone text,
  title text not null,
  work_type text not null check (work_type in ('Lathe', 'Turning', 'Milling', 'Welding', 'Repair Works')),
  description text not null,
  status text not null check (status in ('New Order', 'Material Ordering', 'Machining', 'Ready To Deliver', 'Delivered')),
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  due_date date,
  delivery_address text,
  material_cost numeric(12,2) not null default 0,
  labor_cost numeric(12,2) not null default 0,
  other_cost numeric(12,2) not null default 0,
  quoted_price numeric(12,2) not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_orders add column if not exists updated_by uuid references public.profiles(id);

create table if not exists public.work_order_status_history (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.work_order_images (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  image_url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_person text,
  phone text,
  email text,
  industry text,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  materials text,
  phone text,
  email text,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null,
  skills text,
  status text not null default 'Available',
  active_order_id uuid references public.work_orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_history (
  id uuid primary key default gen_random_uuid(),
  quote_no text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  title text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'Draft',
  quote_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.repair_case_library (
  id uuid primary key default gen_random_uuid(),
  problem text not null unique,
  work_type text not null,
  category text,
  solution text not null,
  created_at timestamptz not null default now()
);

create or replace view public.work_order_profit as
select
  id,
  order_no,
  customer,
  title,
  status,
  material_cost + labor_cost + other_cost as total_cost,
  quoted_price,
  quoted_price - material_cost - labor_cost - other_cost as estimated_profit
from public.work_orders;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_work_order_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
    new.updated_by = auth.uid();
  elsif tg_op = 'UPDATE' then
    new.created_by = old.created_by;
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.set_status_history_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case
      when new.raw_user_meta_data ->> 'role' in ('Owner', 'Manager', 'Production', 'Driver')
      then new.raw_user_meta_data ->> 'role'
      else 'Production'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;
  return new;
end;
$$;

drop trigger if exists work_orders_set_updated_at on public.work_orders;
create trigger work_orders_set_updated_at
before update on public.work_orders
for each row execute function public.set_updated_at();

drop trigger if exists work_orders_set_audit_fields on public.work_orders;
create trigger work_orders_set_audit_fields
before insert or update on public.work_orders
for each row execute function public.set_work_order_audit_fields();

drop trigger if exists work_order_status_history_set_audit_fields on public.work_order_status_history;
create trigger work_order_status_history_set_audit_fields
before insert on public.work_order_status_history
for each row execute function public.set_status_history_audit_fields();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_status_history enable row level security;
alter table public.work_order_images enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.workers enable row level security;
alter table public.quote_history enable row level security;
alter table public.repair_case_library enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Authenticated users can insert their profile" on public.profiles;
drop policy if exists "Authenticated users can update their profile" on public.profiles;
drop policy if exists "Authenticated users can manage work orders" on public.work_orders;
drop policy if exists "Authenticated users can manage status history" on public.work_order_status_history;
drop policy if exists "Authenticated users can manage work order images" on public.work_order_images;
drop policy if exists "Authenticated users can manage customers" on public.customers;
drop policy if exists "Authenticated users can manage suppliers" on public.suppliers;
drop policy if exists "Authenticated users can manage workers" on public.workers;
drop policy if exists "Authenticated users can manage quote history" on public.quote_history;
drop policy if exists "Authenticated users can manage repair library" on public.repair_case_library;

create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Authenticated users can insert their profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Authenticated users can update their profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Authenticated users can manage work orders"
on public.work_orders for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage status history"
on public.work_order_status_history for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage work order images"
on public.work_order_images for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage customers"
on public.customers for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage suppliers"
on public.suppliers for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage workers"
on public.workers for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage quote history"
on public.quote_history for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage repair library"
on public.repair_case_library for all
to authenticated
using (true)
with check (true);

drop policy if exists "MVP anon users can manage customers" on public.customers;
drop policy if exists "MVP anon users can manage suppliers" on public.suppliers;
drop policy if exists "MVP anon users can manage workers" on public.workers;
drop policy if exists "MVP anon users can manage quote history" on public.quote_history;
drop policy if exists "MVP anon users can manage repair library" on public.repair_case_library;
drop policy if exists "MVP anon users can manage work orders" on public.work_orders;
drop policy if exists "MVP anon users can manage status history" on public.work_order_status_history;
drop policy if exists "MVP anon users can manage work order images" on public.work_order_images;

insert into storage.buckets (id, name, public)
values ('work-order-images', 'work-order-images', false)
on conflict (id) do nothing;

update storage.buckets
set public = false
where id = 'work-order-images';

drop policy if exists "Public work order image reads" on storage.objects;
drop policy if exists "MVP work order image uploads" on storage.objects;
drop policy if exists "MVP work order image updates" on storage.objects;
drop policy if exists "MVP work order image deletes" on storage.objects;
drop policy if exists "Authenticated work order image reads" on storage.objects;
drop policy if exists "Authenticated work order image uploads" on storage.objects;
drop policy if exists "Authenticated work order image updates" on storage.objects;
drop policy if exists "Authenticated work order image deletes" on storage.objects;

create policy "Authenticated work order image reads"
on storage.objects for select
to authenticated
using (bucket_id = 'work-order-images');

create policy "Authenticated work order image uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'work-order-images');

create policy "Authenticated work order image updates"
on storage.objects for update
to authenticated
using (bucket_id = 'work-order-images')
with check (bucket_id = 'work-order-images');

create policy "Authenticated work order image deletes"
on storage.objects for delete
to authenticated
using (bucket_id = 'work-order-images');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'work_orders'
  ) then
    alter publication supabase_realtime add table
      public.customers,
      public.suppliers,
      public.workers,
      public.quote_history,
      public.repair_case_library,
      public.work_orders,
      public.work_order_status_history,
      public.work_order_images;
  end if;
end $$;
