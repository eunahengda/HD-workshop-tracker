-- 006: Documentation reference numbers (Quotation / P.O. / D.O.)

alter table public.work_orders add column if not exists quotation_no text;
alter table public.work_orders add column if not exists po_no text;
alter table public.work_orders add column if not exists do_no text;
