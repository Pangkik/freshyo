-- Sample data for local/dev use only. Run after schema.sql.
-- Fixed UUIDs below are just so price_reports can reference stores/items
-- inline without lookups -- not meaningful outside this seed file.

-- ================================================================ stores ==
insert into stores (id, name, lat, lng, address, store_type) values
  ('11111111-1111-1111-1111-111111111101', 'Roxas Grocery Center', 11.5850, 122.7510, 'Roxas Avenue, Roxas City', 'grocery'),
  ('11111111-1111-1111-1111-111111111102', 'Rizal Street Grocery', 11.5836, 122.7502, 'Rizal St, Roxas City', 'grocery'),
  ('11111111-1111-1111-1111-111111111103', 'Arnaldo Grocery Mart', 11.5900, 122.7520, 'Arnaldo Blvd, Roxas City', 'grocery'),
  ('11111111-1111-1111-1111-111111111104', 'Lawaan Grocery', 11.5870, 122.7480, 'Lawaan, Roxas City', 'grocery'),
  ('11111111-1111-1111-1111-111111111105', 'Pueblo de Panay Mart', 11.5790, 122.7550, 'Barangay Culajao, Roxas City', 'grocery'),
  ('11111111-1111-1111-1111-111111111106', 'Baybay Grocery Store', 11.5950, 122.7460, 'Baybay, Roxas City', 'grocery');

-- ================================================================= items ==
insert into items (id, name, name_hil, brand, size_label, category, unit) values
  ('22222222-2222-2222-2222-222222222201', 'Sardines', 'sardinas', 'Ligo', '155g', 'canned goods', 'per can'),
  ('22222222-2222-2222-2222-222222222202', 'Corned Beef', null, 'Purefoods', '150g', 'canned goods', 'per can'),
  ('22222222-2222-2222-2222-222222222203', 'Pancit Canton', 'pansit', 'Lucky Me', '60g', 'noodles', 'per pack'),
  ('22222222-2222-2222-2222-222222222204', 'Instant Mami', null, 'Lucky Me', '55g', 'noodles', 'per pack'),
  ('22222222-2222-2222-2222-222222222205', 'Fresh Milk', 'gatas', 'Alaska', '1L', 'dairy', 'per liter'),
  ('22222222-2222-2222-2222-222222222206', 'Powdered Milk', null, 'Bear Brand', '300g', 'dairy', 'per pack'),
  ('22222222-2222-2222-2222-222222222207', 'Egg', 'itlog', null, 'large', 'dairy', 'per piece'),
  ('22222222-2222-2222-2222-222222222208', 'Soy Sauce', 'toyo', 'Silver Swan', '1L', 'condiments', 'per liter'),
  ('22222222-2222-2222-2222-222222222209', 'Vinegar', 'suka', 'Datu Puti', '1L', 'condiments', 'per liter'),
  ('22222222-2222-2222-2222-222222222210', 'Dishwashing Liquid', null, 'Joy', '250ml', 'household', 'per bottle');

-- ========================================================= price_reports ==
insert into price_reports (item_id, store_id, price, unit, created_at) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 32.50, 'per can', now() - interval '13 days'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 31.00, 'per can', now() - interval '10 days'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 34.00, 'per can', now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 78.00, 'per can', now() - interval '12 days'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111104', 82.50, 'per can', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 15.00, 'per pack', now() - interval '11 days'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111105', 14.50, 'per pack', now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111106', 15.50, 'per pack', now() - interval '1 days'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', 14.00, 'per pack', now() - interval '9 days'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 14.75, 'per pack', now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104', 105.00, 'per liter', now() - interval '14 days'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111103', 110.00, 'per liter', now() - interval '7 days'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 385.00, 'per pack', now() - interval '8 days'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 390.00, 'per pack', now() - interval '3 days'),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111102', 8.50, 'per piece', now() - interval '13 days'),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111105', 8.00, 'per piece', now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111101', 9.00, 'per piece', now() - interval '0 days'),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111104', 42.00, 'per liter', now() - interval '10 days'),
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111101', 28.00, 'per liter', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111103', 55.00, 'per bottle', now() - interval '2 days');
