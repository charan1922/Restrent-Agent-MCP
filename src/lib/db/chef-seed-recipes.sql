-- Recipe Data: Menu Items → Ingredients Mapping
-- Links popular dishes to their required ingredients

-- First, get some ingredient IDs we'll use
-- Run: SELECT id, name FROM ingredients WHERE tenant_id = 'tenant-pista-house' LIMIT 10;

-- ============================================================================
-- PISTA HOUSE RECIPES
-- ============================================================================

-- Chicken Tikka Masala (assuming menu item exists)
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Chicken'),
 0.25, 'boneless, cubed'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Yogurt'),
 0.05, 'for marinade'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Garam Masala'),
 10, 'ground'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Cream'),
 0.03, 'for gravy'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Onions'),
 0.1, 'finely chopped'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%chicken%tikka%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Tomatoes'),
 0.15, 'pureed');

-- Biryani
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%biryani%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Basmati Rice'),
 0.2, 'soaked'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%biryani%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Chicken'),
 0.3, 'with bones'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%biryani%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Yogurt'),
 0.05, 'for marinade'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%biryani%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Ghee'),
 0.02, ''),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%biryani%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Onions'),
 0.15, 'fried crispy');

-- Naan
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%naan%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Wheat Flour'),
 0.1, 'all-purpose'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%naan%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Yogurt'),
 0.02, 'for dough'),
('tenant-pista-house', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-pista-house' AND name ILIKE '%naan%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-pista-house' AND name = 'Ghee'),
 0.01, 'for brushing');

-- ============================================================================
-- CHUTNEYS RECIPES
-- ============================================================================

-- Dosa
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%dosa%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Dosa Rice'),
 0.08, 'soaked and ground'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%dosa%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Urad Dal'),
 0.02, 'soaked and ground'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%dosa%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Coconut Oil'),
 0.01, 'for cooking');

-- Idli
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%idli%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Idli Rice'),
 0.08, 'parboiled'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%idli%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Urad Dal'),
 0.02, 'ground to paste');

-- Sambar
INSERT INTO recipes (tenant_id, menu_item_id, ingredient_id, quantity_required, notes) VALUES
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%sambar%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Toor Dal'),
 0.05, 'cooked'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%sambar%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Tamarind'),
 0.01, 'extract'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%sambar%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Tomatoes'),
 0.08, 'chopped'),
('tenant-chutneys', 
 (SELECT id FROM menu_items WHERE tenant_id = 'tenant-chutneys' AND name ILIKE '%sambar%' LIMIT 1),
 (SELECT id FROM ingredients WHERE tenant_id = 'tenant-chutneys' AND name = 'Curry Leaves'),
 5, 'fresh');
