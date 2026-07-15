-- 008: Supplier order date & delivery date (date only, no time).

alter table public.work_orders add column if not exists supplier_order_date date;
alter table public.work_orders add column if not exists supplier_delivery_date date;
