-- ============================================================
-- StockSim Academy — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username         TEXT        UNIQUE,
  virtual_balance  NUMERIC(15,2) NOT NULL DEFAULT 1000000.00,  -- ₹10,00,000 starting balance
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. HOLDINGS (stocks a user currently owns)
CREATE TABLE IF NOT EXISTS holdings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol         TEXT        NOT NULL,
  name           TEXT        NOT NULL,
  quantity       NUMERIC(15,4) NOT NULL DEFAULT 0,
  avg_buy_price  NUMERIC(15,2) NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

-- 3. TRADES (full order history)
CREATE TABLE IF NOT EXISTS trades (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol     TEXT        NOT NULL,
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity   NUMERIC(15,4) NOT NULL,
  price      NUMERIC(15,2) NOT NULL,
  total      NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WATCHLISTS
CREATE TABLE IF NOT EXISTS watchlists (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol    TEXT        NOT NULL,
  name      TEXT        NOT NULL,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

-- 5. PRICE ALERTS
CREATE TABLE IF NOT EXISTS price_alerts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol       TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  target_price NUMERIC(15,4) NOT NULL,
  direction    TEXT        NOT NULL CHECK (direction IN ('above', 'below')),
  triggered    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades       ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles: everyone can read (for leaderboard), only owner can update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Holdings: owner only
CREATE POLICY "holdings_all"   ON holdings   FOR ALL USING (auth.uid() = user_id);

-- Trades: owner only
CREATE POLICY "trades_all"     ON trades     FOR ALL USING (auth.uid() = user_id);

-- Watchlists: owner only
CREATE POLICY "watchlists_all"    ON watchlists   FOR ALL USING (auth.uid() = user_id);

-- Price alerts: owner only
CREATE POLICY "price_alerts_all"  ON price_alerts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- LEADERBOARD VIEW
-- Ranks users by total portfolio value:
--   total_value = virtual_balance (cash) + sum(quantity * avg_buy_price)
-- Note: avg_buy_price is used as a price proxy since live prices
-- are not stored server-side. The view bypasses RLS (security definer
-- behavior) so all users' holdings are visible for ranking.
-- ============================================================

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id,
  p.username,
  p.virtual_balance                                                     AS cash_balance,
  COALESCE(SUM(h.quantity * h.avg_buy_price), 0)                       AS holdings_value,
  p.virtual_balance + COALESCE(SUM(h.quantity * h.avg_buy_price), 0)   AS total_value
FROM profiles p
LEFT JOIN holdings h ON h.user_id = p.id
GROUP BY p.id, p.username, p.virtual_balance;

-- Allow any authenticated user to query the leaderboard
GRANT SELECT ON leaderboard_view TO authenticated;
