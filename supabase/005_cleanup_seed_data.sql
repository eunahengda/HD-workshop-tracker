-- 005: OPTIONAL cleanup - removes the sample/test data that was inserted
-- by 002_seed_data.sql (fake customers, suppliers, workers, quotes,
-- repair cases, and the 3 sample work orders + their history/images).
--
-- Run this ONLY when you are ready to start using the app with real data.
-- It does NOT touch your Supabase Auth users or profiles - your real
-- login accounts are safe.
--
-- If you already entered real records with the same names as the seed
-- data (e.g. a real "Kuala Steel Works"), back up or rename them first,
-- because this script deletes by matching the sample data's exact names.

delete from public.work_order_status_history
where work_order_id in (
  select id from public.work_orders
  where order_no in ('HD-2026-001', 'HD-2026-002', 'HD-2026-003')
);

delete from public.work_order_images
where work_order_id in (
  select id from public.work_orders
  where order_no in ('HD-2026-001', 'HD-2026-002', 'HD-2026-003')
);

delete from public.work_orders
where order_no in ('HD-2026-001', 'HD-2026-002', 'HD-2026-003');

delete from public.quote_history
where quote_no in ('Q-2026-018', 'Q-2026-019', 'Q-2026-020', 'Q-2026-021');

delete from public.repair_case_library
where problem in ('Worn shaft journal', 'Cracked mounting bracket', 'Damaged keyway', 'Pump housing leak');

delete from public.workers
where name in ('Rahim', 'Mei Lin', 'Azlan', 'Suresh');

delete from public.suppliers
where name in ('Selangor Metal Supply', 'Precision Tooling Sdn Bhd', 'Industrial Gas & Welding');

delete from public.customers
where name in ('Kuala Steel Works', 'North Port Maintenance', 'Metro Packaging', 'Palm Oil Components');
