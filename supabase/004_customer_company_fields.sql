-- 004: Add Malaysian company registration fields to customers.

alter table public.customers add column if not exists company_full_name text;
alter table public.customers add column if not exists ssm_number text;
alter table public.customers add column if not exists sst_number text;
alter table public.customers add column if not exists tin_number text;
