-- Insert Lemonade category
INSERT INTO categories (label, value)
VALUES ('Lemonade', 'lemonade')
ON CONFLICT (value) DO NOTHING;

-- Insert Lemonade products
INSERT INTO products (name, category, price, available) VALUES
  ('Immune Protection',    'lemonade', 89, true),
  ('Anti-Stress',          'lemonade', 89, true),
  ('Lemon & Mango',        'lemonade', 79, true),
  ('Lemon & Kush',         'lemonade', 79, true),
  ('Heart Health',         'lemonade', 89, true),
  ('All Day Glow',         'lemonade', 89, true),
  ('Lemon & Guyabano',     'lemonade', 79, true),
  ('Lemon & Pomelo',       'lemonade', 79, true),
  ('Hawaiian & Punch',     'lemonade', 79, true),
  ('Lemon & Grapes',       'lemonade', 79, true),
  ('Dalandan & Orange',    'lemonade', 69, true),
  ('Lemon & Dalandan',     'lemonade', 69, true),
  ('Lemon & Strawberry',   'lemonade', 79, true),
  ('Lemon & Orange',       'lemonade', 69, true),
  ('Lemon & Berries',      'lemonade', 79, true),
  ('Grapefruit',           'lemonade', 59, true),
  ('Lemon & Grapefruit',   'lemonade', 89, true),
  ('Dalandan',             'lemonade', 49, true),
  ('Lemonade',             'lemonade', 49, true),
  ('Orange',               'lemonade', 49, true);
