-- Pantry Inventory — a shared communal inventory of what's on hand.
-- Like the Grocery list, the inventory is intentionally household/house-wide:
-- any member may add an item, adjust its stock, or flag it low, so the item
-- table carries no row_policies. `owner_name` is an informational label (whose
-- item it is in a shared kitchen), NOT an access-control boundary.
--
-- Plaintext columns used in SQL: `status` and `category` are on the encryption
-- skip-list already; `expiry_date` is declared plaintext in the manifest so it
-- can be sorted / compared for "expiring soon".
CREATE TABLE IF NOT EXISTS app_pantry__items (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'pantry',   -- 'fridge' | 'freezer' | 'pantry' | 'other'
  quantity       INTEGER NOT NULL DEFAULT 1,
  unit           TEXT DEFAULT '',
  low_threshold  INTEGER NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'ok',        -- 'ok' | 'low' | 'out'
  expiry_date    TEXT DEFAULT '',                   -- ISO yyyy-mm-dd, or ''
  owner_name     TEXT DEFAULT '',                   -- shared-kitchen label, not access control
  note           TEXT DEFAULT '',
  created_by_id  TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS app_pantry__items_status_idx
  ON app_pantry__items (status, category);
CREATE INDEX IF NOT EXISTS app_pantry__items_expiry_idx
  ON app_pantry__items (expiry_date);
