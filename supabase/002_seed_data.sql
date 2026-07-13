insert into public.profiles (id, email, full_name, role) values
  ('11111111-1111-4111-8111-111111111111', 'owner@hd-workshop.test', 'H&D Owner', 'Owner'),
  ('22222222-2222-4222-8222-222222222222', 'manager@hd-workshop.test', 'Workshop Manager', 'Manager'),
  ('33333333-3333-4333-8333-333333333333', 'production@hd-workshop.test', 'Production Supervisor', 'Production')
on conflict (email) do nothing;

insert into public.work_orders (
  id, order_no, customer, phone, title, work_type, description, status, priority,
  due_date, delivery_address, material_cost, labor_cost, other_cost, quoted_price, created_by
) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'HD-2026-001',
    'Kuala Steel Works',
    '+60 12-555 0190',
    'Lathe shaft repair',
    'Lathe',
    'Turn worn shaft, sleeve bearing seat, polish finish.',
    'Machining',
    'High',
    '2026-07-14',
    'Shah Alam Industrial Park',
    420,
    680,
    80,
    1680,
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'HD-2026-002',
    'North Port Maintenance',
    '+60 3-7100 4421',
    'Welding bracket fabrication',
    'Welding',
    'Fabricate and weld four mounting brackets.',
    'Ready To Deliver',
    'Medium',
    '2026-07-10',
    'Port Klang Gate 4',
    260,
    540,
    60,
    1250,
    '33333333-3333-4333-8333-333333333333'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'HD-2026-003',
    'Metro Packaging',
    '+60 17-333 9811',
    'Milling fixture plate',
    'Milling',
    'Mill pockets, slots, and tapped holes per sample.',
    'Material Ordering',
    'Low',
    '2026-07-18',
    'Customer pickup',
    300,
    0,
    0,
    980,
    '22222222-2222-4222-8222-222222222222'
  )
on conflict (order_no) do nothing;

insert into public.work_order_status_history (work_order_id, status, note, created_by) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'New Order', 'Order opened by manager', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Material Ordering', 'EN8 round bar confirmed', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Machining', 'Turning in progress', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Ready To Deliver', 'Paint touch-up completed', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Material Ordering', 'Awaiting aluminium plate', '22222222-2222-4222-8222-222222222222');

insert into public.customers (id, name, contact_person, phone, email, industry) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Kuala Steel Works', 'Mr Tan', '+60 12-555 0190', 'tan@kualasteel.test', 'Steel fabrication'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'North Port Maintenance', 'Aina Rahman', '+60 3-7100 4421', 'aina@northport.test', 'Port maintenance'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Metro Packaging', 'Jason Lim', '+60 17-333 9811', 'jason@metro-pack.test', 'Packaging'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'Palm Oil Components', 'Kumar', '+60 16-222 4420', 'ops@poc.test', 'Palm oil machinery')
on conflict (name) do nothing;

insert into public.suppliers (name, materials, phone, email, status) values
  ('Selangor Metal Supply', 'EN8, mild steel, aluminium', '+60 3-7788 1200', 'sales@sms.test', 'Active'),
  ('Precision Tooling Sdn Bhd', 'Cutters, inserts, taps', '+60 3-8011 9070', 'orders@precision.test', 'Active'),
  ('Industrial Gas & Welding', 'Gas, rods, MIG wire', '+60 3-4432 7001', 'support@igw.test', 'Active')
on conflict (name) do nothing;

insert into public.workers (id, name, role, skills, status, active_order_id) values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'Rahim', 'Senior Machinist', 'Lathe, turning', 'On Job', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'Mei Lin', 'Milling Operator', 'Milling, tapping', 'Available', null),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'Azlan', 'Welder', 'MIG, TIG, repair welding', 'On Job', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc4', 'Suresh', 'Supervisor', 'QC, scheduling', 'Available', null)
on conflict (name) do nothing;

insert into public.quote_history (quote_no, customer_id, customer_name, title, amount, status, quote_date) values
  ('Q-2026-018', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Kuala Steel Works', 'Lathe shaft repair', 1680, 'Accepted', '2026-07-05'),
  ('Q-2026-019', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'North Port Maintenance', 'Welding bracket fabrication', 1250, 'Accepted', '2026-07-04'),
  ('Q-2026-020', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'Palm Oil Components', 'Pump housing repair', 900, 'Accepted', '2026-07-09'),
  ('Q-2026-021', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Metro Packaging', 'Spare roller set', 3400, 'Draft', '2026-07-10')
on conflict (quote_no) do nothing;

insert into public.repair_case_library (problem, work_type, category, solution) values
  ('Worn shaft journal', 'Lathe', 'Shafting', 'Build up sleeve, turn to tolerance, polish bearing seat.'),
  ('Cracked mounting bracket', 'Welding', 'Structural', 'V-groove crack, weld, stress relieve, redrill holes.'),
  ('Damaged keyway', 'Milling', 'Power transmission', 'Clean slot, mill oversize keyway, supply stepped key.'),
  ('Pump housing leak', 'Repair Works', 'Pump', 'Dye check, weld porous area, surface machine flange.')
on conflict (problem) do nothing;
