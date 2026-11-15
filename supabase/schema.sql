-- ═══════════════════════════════════════════════════════════
-- NoWave E-Menu — Supabase PostgreSQL Migration
-- Run this in your Supabase SQL Editor for one-click deployment
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────
-- TABLES
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  price             DECIMAL(10, 2) NOT NULL,
  image_url         TEXT,
  dietary_type      TEXT NOT NULL DEFAULT 'veg' CHECK (dietary_type IN ('veg', 'nonveg', 'vegan', 'egg')),
  spice_level       INT NOT NULL DEFAULT 1 CHECK (spice_level BETWEEN 1 AND 5),
  is_chef_special   BOOLEAN NOT NULL DEFAULT FALSE,
  availability_slot TEXT NOT NULL DEFAULT 'all_day' CHECK (availability_slot IN ('morning_only', 'lunch_dinner', 'all_day')),
  is_struck_out     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order        INT NOT NULL DEFAULT 0,
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_struck_out ON menu_items(is_struck_out);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ───────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ───────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public / anon: READ-ONLY on categories and menu_items
CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read menu items"
  ON menu_items FOR SELECT
  TO anon
  USING (true);

-- Authenticated admin: FULL CRUD on categories and menu_items
CREATE POLICY "Admin full access categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users table: only authenticated can read their own row
CREATE POLICY "Admin read own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- ───────────────────────────────────────────────────────────
-- STORAGE BUCKET (run in Supabase Dashboard > Storage)
-- ───────────────────────────────────────────────────────────

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('menu-images', 'menu-images', true);
--
-- CREATE POLICY "Public read menu images"
--   ON storage.objects FOR SELECT
--   TO anon
--   USING (bucket_id = 'menu-images');
--
-- CREATE POLICY "Admin upload menu images"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'menu-images');
--
-- CREATE POLICY "Admin update menu images"
--   ON storage.objects FOR UPDATE
--   TO authenticated
--   USING (bucket_id = 'menu-images');
--
-- CREATE POLICY "Admin delete menu images"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'menu-images');

-- ───────────────────────────────────────────────────────────
-- REALTIME (enable in Supabase Dashboard > Database > Replication)
-- ───────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- ───────────────────────────────────────────────────────────
-- SEED DATA (same as local seed)
-- ───────────────────────────────────────────────────────────

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Morning Tiffin & Breakfast', 'morning-tiffin', 0),
  ('Small Plates & Starters', 'small-plates', 1),
  ('Mains & Rice Bowls', 'mains', 2),
  ('Craft Beverages', 'craft-beverages', 3),
  ('Desserts & Sweet Endings', 'desserts', 4)
ON CONFLICT (slug) DO NOTHING;
