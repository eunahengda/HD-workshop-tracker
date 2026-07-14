-- 003: Rework work order intake fields, relax old requirements,
-- and switch order numbers to YYMM-NNN (resets every month).

-- Old fields are no longer mandatory from the app, relax constraints
-- but keep the columns for backward compatibility with existing rows.
alter table public.work_orders alter column title drop not null;
alter table public.work_orders alter column work_type drop not null;
alter table public.work_orders alter column description drop not null;
alter table public.work_orders alter column priority drop not null;

alter table public.work_orders drop constraint if exists work_orders_work_type_check;
alter table public.work_orders add constraint work_orders_work_type_check
  check (work_type is null or work_type in ('Lathe', 'Turning', 'Milling', 'Welding', 'Repair Works'));

alter table public.work_orders drop constraint if exists work_orders_priority_check;
alter table public.work_orders add constraint work_orders_priority_check
  check (priority is null or priority in ('Low', 'Medium', 'High'));

-- New intake fields
alter table public.work_orders add column if not exists order_date date not null default current_date;
alter table public.work_orders add column if not exists job_category text;
alter table public.work_orders drop constraint if exists work_orders_job_category_check;
alter table public.work_orders add constraint work_orders_job_category_check
  check (job_category is null or job_category in ('Repair', 'Make'));

alter table public.work_orders add column if not exists work_types text[] not null default '{}';
alter table public.work_orders add column if not exists qty numeric(12, 2);
alter table public.work_orders add column if not exists material text;
alter table public.work_orders add column if not exists size text;
alter table public.work_orders add column if not exists sample text;
alter table public.work_orders add column if not exists urgent boolean not null default false;
alter table public.work_orders add column if not exists remark text;

-- Supplier detail
alter table public.work_orders add column if not exists supplier_name text;
alter table public.work_orders add column if not exists supplier_material text;
alter table public.work_orders add column if not exists supplier_size text;
alter table public.work_orders add column if not exists supplier_qty numeric(12, 2);

-- Delivery detail
alter table public.work_orders add column if not exists driver text;
alter table public.work_orders add column if not exists delivery_datetime timestamptz;

-- Order number generator: YYMM-NNN, sequence resets automatically each
-- month because it counts existing rows that share the current YYMM prefix.
create or replace function public.set_work_order_no()
returns trigger
language plpgsql
as $$
declare
  ym text := to_char(now(), 'YYMM');
  next_seq int;
begin
  if new.order_no is null or new.order_no = '' then
    select coalesce(max(substring(order_no from '-(\d+)$')::int), 0) + 1
      into next_seq
      from public.work_orders
      where order_no like ym || '-%';
    new.order_no := ym || '-' || lpad(next_seq::text, 3, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_work_order_no on public.work_orders;
create trigger trg_set_work_order_no
  before insert on public.work_orders
  for each row execute function public.set_work_order_no();
