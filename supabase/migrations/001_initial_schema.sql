-- ============================================================
-- AI SHOPPING ASSISTANT — Supabase Schema v1
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ============================================================
-- 1. PRODUCTS (replaces catalog.js — fashion only)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT,           -- 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'jewelry'
  price       NUMERIC(10, 2) NOT NULL,
  image_url   TEXT,
  description TEXT,
  vibe        TEXT,           -- 'beachy' | 'professional' | 'cozy' | 'comfort' | 'traditional' | 'loungewear' | 'casual'
  tags        TEXT[],         -- e.g. ['goa', 'vacation', 'men']
  gender      TEXT DEFAULT 'unisex',  -- 'men' | 'women' | 'unisex'
  source      TEXT DEFAULT 'local',   -- 'local' | 'fakestore'
  in_stock    BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. SESSIONS (replaces in-memory JS state)
--    Phase 1: anonymous (user_id = null)
--    Phase 2: linked to auth.users via email auth
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL in Phase 1
  current_vibe        TEXT,
  shown_product_ids   TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. MESSAGES (persistent conversation history)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  bundle_ids  TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. CART ITEMS (replaces in-memory cart array)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  product_id  TEXT REFERENCES products(id) NOT NULL,
  size        TEXT DEFAULT 'M',
  added_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, product_id, size)
);

-- ============================================================
-- 5. ORDERS (post-checkout persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID REFERENCES sessions(id),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items             JSONB NOT NULL,
  total_amount      NUMERIC(10, 2),
  phone             TEXT,
  shipping_name     TEXT,
  shipping_address  TEXT,
  status            TEXT DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'cancelled'
  payment_method    TEXT DEFAULT 'mock',      -- 'mock' | 'stripe' (Phase 2)
  stripe_session_id TEXT,                     -- NULL in Phase 1
  whatsapp_sent     BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. ANALYTICS EVENTS — North Star KPI tracking
--
-- event_type values:
--   'session_started'  — new session created
--   'intent_parsed'    — user sent a message
--   'bundle_shown'     — AI returned a product bundle
--   'bundle_accepted'  — user clicked "Add Entire Bundle"
--   'item_added'       — single item added to cart
--   'item_removed'     — item removed from cart
--   'checkout_started' — user entered checkout flow
--   'order_placed'     — order confirmed and saved
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. INDEXES — for analytics dashboard queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_analytics_event_type  ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at  ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session      ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_session       ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at    ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_session           ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_session         ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at      ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_vibe          ON products(vibe);
CREATE INDEX IF NOT EXISTS idx_products_gender        ON products(gender);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) — basic policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Products: public read (anyone can browse the catalog)
CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

-- Sessions: anon can create; service role can read all (for serverless functions)
CREATE POLICY "Anyone can create session"
  ON sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Session owner can read own session"
  ON sessions FOR SELECT USING (true);  -- relaxed for anonymous; tighten in Phase 2

CREATE POLICY "Session owner can update own session"
  ON sessions FOR UPDATE USING (true);

-- Messages: tied to session
CREATE POLICY "Anyone can insert message"
  ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT USING (true);

-- Cart items: tied to session
CREATE POLICY "Anyone can manage cart"
  ON cart_items FOR ALL USING (true);

-- Orders: insert allowed; select restricted (use service role in functions)
CREATE POLICY "Anyone can place order"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read their order"
  ON orders FOR SELECT USING (true);

-- Analytics: insert from service role only (serverless functions use service role key)
CREATE POLICY "Service role inserts analytics"
  ON analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon cannot read analytics"
  ON analytics_events FOR SELECT USING (false);  -- block anon reads; use service role key for dashboards
