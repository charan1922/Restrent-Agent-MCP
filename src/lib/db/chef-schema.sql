-- Chef Agent Database Schema
-- Inventory, Recipes, and Procurement Management

-- ============================================================================
-- INGREDIENTS & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,                    -- 'kg', 'liters', 'pieces', 'grams'
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  reorder_point DECIMAL(10,2) NOT NULL DEFAULT 5,
  unit_cost DECIMAL(10,2) NOT NULL,      -- Cost per unit
  supplier TEXT,
  shelf_life_days INTEGER,               -- For freshness tracking
  last_restock_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- RECIPES (Ingredient Requirements per Menu Item)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,            -- References menu_items.id
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10,2) NOT NULL, -- Quantity needed per serving
  notes TEXT,                            -- e.g., "finely chopped", "roasted"
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, menu_item_id, ingredient_id)
);

-- ============================================================================
-- PURCHASE ORDERS (Procurement System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'ordered', 'received', 'cancelled'
  supplier TEXT,
  estimated_delivery TIMESTAMP,
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  received_at TIMESTAMP
);

-- ============================================================================
-- CHEF ORDER QUEUE (All orders received from Waiter Agent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chef_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiter_order_id TEXT NOT NULL,         -- Links to orders.id from Waiter
  tenant_id TEXT NOT NULL,
  items JSONB NOT NULL,                  -- Order items with quantities
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, PREPARING, READY, SERVED, CANCELLED
  priority TEXT NOT NULL DEFAULT 'normal', -- normal, high, urgent
  eta_minutes INTEGER,                   -- Estimated time to complete
  total_cogs DECIMAL(10,2),              -- Total Cost of Goods Sold
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(waiter_order_id)
);

-- ============================================================================
-- INVENTORY TRANSACTIONS (Audit Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  transaction_type TEXT NOT NULL,       -- 'deduction', 'restock', 'adjustment'
  quantity DECIMAL(10,2) NOT NULL,      -- Positive for restock, negative for deduction
  related_order_id UUID REFERENCES chef_orders(id),
  related_po_id UUID REFERENCES purchase_orders(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT                        -- 'system', 'admin', 'chef_agent'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ingredients_tenant ON ingredients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_low_stock ON ingredients(tenant_id, current_stock, reorder_point) 
  WHERE current_stock < reorder_point;

CREATE INDEX IF NOT EXISTS idx_recipes_menu_item ON recipes(tenant_id, menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recipes_ingredient ON recipes(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_chef_orders_tenant ON chef_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chef_orders_status ON chef_orders(status);
CREATE INDEX IF NOT EXISTS idx_chef_orders_waiter_id ON chef_orders(waiter_order_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant ON purchase_orders(tenant_id);

CREATE INDEX IF NOT EXISTS idx_inventory_txn_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_txn_date ON inventory_transactions(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chef_orders_updated_at BEFORE UPDATE ON chef_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
