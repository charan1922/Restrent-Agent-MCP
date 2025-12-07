-- Restaurant Management System Database Schema
-- PostgreSQL (localhost)

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  current_reservation_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  date_time TIMESTAMP NOT NULL,
  table_id TEXT REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'pending',
  contact_info TEXT,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  ingredients JSONB NOT NULL,
  allergens JSONB NOT NULL,
  spice_level INTEGER NOT NULL DEFAULT 0,
  is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
  is_vegan BOOLEAN NOT NULL DEFAULT FALSE,
  prep_time INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL REFERENCES tables(id),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  chef_order_id TEXT,
  eta INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.18,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations (for chat memory)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  guest_name TEXT,
  messages JSONB NOT NULL,
  summary TEXT,
  order_ids JSONB,
  reservation_ids JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  user_id TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_time);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
