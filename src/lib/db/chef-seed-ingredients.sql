-- Seed Data for Chef Agent
-- Initial inventory and recipes for both tenants

-- ============================================================================
-- INGREDIENTS FOR PISTA HOUSE (Hyderabadi & North Indian)
-- ============================================================================

INSERT INTO ingredients (tenant_id, name, unit, current_stock, reorder_point, unit_cost, supplier, shelf_life_days) VALUES
-- Proteins
('tenant-pista-house', 'Chicken', 'kg', 50.00, 10.00, 180.00, 'Local Poultry', 3),
('tenant-pista-house', 'Mutton', 'kg', 30.00, 8.00, 550.00, 'Premium Meats', 2),
('tenant-pista-house', 'Prawns', 'kg', 15.00, 5.00, 450.00, 'Seafood Direct', 1),

-- Grains & Breads
('tenant-pista-house', 'Basmati Rice', 'kg', 100.00, 20.00, 120.00, 'Rice Mills', 365),
('tenant-pista-house', 'Wheat Flour', 'kg', 80.00, 15.00, 40.00, 'Grain Supplier', 180),

-- Spices
('tenant-pista-house', 'Garam Masala', 'grams', 5000.00, 500.00, 0.80, 'Spice Market', 180),
('tenant-pista-house', 'Turmeric Powder', 'grams', 3000.00, 500.00, 0.50, 'Spice Market', 365),
('tenant-pista-house', 'Red Chili Powder', 'grams', 4000.00, 500.00, 0.60, 'Spice Market', 365),
('tenant-pista-house', 'Cumin Seeds', 'grams', 2000.00, 300.00, 0.70, 'Spice Market', 180),
('tenant-pista-house', 'Coriander Powder', 'grams', 2000.00, 300.00, 0.55, 'Spice Market', 180),

-- Dairy
('tenant-pista-house', 'Yogurt', 'liters', 25.00, 5.00, 60.00, 'Local Dairy', 5),
('tenant-pista-house', 'Cream', 'liters', 15.00, 3.00, 180.00, 'Local Dairy', 7),
('tenant-pista-house', 'Ghee', 'liters', 20.00, 4.00, 450.00, 'Pure Ghee Co', 180),
('tenant-pista-house', 'Paneer', 'kg', 12.00, 3.00, 280.00, 'Local Dairy', 5),

-- Vegetables
('tenant-pista-house', 'Onions', 'kg', 60.00, 15.00, 30.00, 'Veggie Mart', 14),
('tenant-pista-house', 'Tomatoes', 'kg', 50.00, 12.00, 35.00, 'Veggie Mart', 7),
('tenant-pista-house', 'Ginger', 'kg', 10.00, 2.00, 120.00, 'Veggie Mart', 14),
('tenant-pista-house', 'Garlic', 'kg', 10.00, 2.00, 150.00, 'Veggie Mart', 30),
('tenant-pista-house', 'Green Chilies', 'kg', 5.00, 1.00, 80.00, 'Veggie Mart', 7),
('tenant-pista-house', 'Cilantro', 'kg', 3.00, 1.00, 40.00, 'Veggie Mart', 3),

-- Oils & Condiments
('tenant-pista-house', 'Vegetable Oil', 'liters', 40.00, 10.00, 120.00, 'Oil Depot', 365),
('tenant-pista-house', 'Salt', 'kg', 25.00, 5.00, 20.00, 'Grocery Store', 730);

-- ============================================================================
-- INGREDIENTS FOR CHUTNEYS (South Indian Vegetarian)
-- ============================================================================

INSERT INTO ingredients (tenant_id, name, unit, current_stock, reorder_point, unit_cost, supplier, shelf_life_days) VALUES
-- Grains & Flours
('tenant-chutneys', 'Idli Rice', 'kg', 80.00, 15.00, 60.00, 'Rice Mills', 365),
('tenant-chutneys', 'Dosa Rice', 'kg', 80.00, 15.00, 65.00, 'Rice Mills', 365),
('tenant-chutneys', 'Urad Dal', 'kg', 40.00, 10.00, 120.00, 'Dal Supplier', 365),
('tenant-chutneys', 'Toor Dal', 'kg', 30.00, 8.00, 110.00, 'Dal Supplier', 365),
('tenant-chutneys', 'Chana Dal', 'kg', 20.00, 5.00, 100.00, 'Dal Supplier', 365),
('tenant-chutneys', 'Semolina (Rava)', 'kg', 35.00, 8.00, 50.00, 'Grain Supplier', 180),

-- Spices & Seeds
('tenant-chutneys', 'Mustard Seeds', 'grams', 2000.00, 300.00, 0.60, 'Spice Market', 180),
('tenant-chutneys', 'Curry Leaves', 'grams', 500.00, 100.00, 2.00, 'Fresh Herbs', 2),
('tenant-chutneys', 'Turmeric Powder', 'grams', 3000.00, 500.00, 0.50, 'Spice Market', 365),
('tenant-chutneys', 'Red Chili Powder', 'grams', 2000.00, 300.00, 0.60, 'Spice Market', 365),
('tenant-chutneys', 'Cumin Seeds', 'grams', 1500.00, 250.00, 0.70, 'Spice Market', 180),
('tenant-chutneys', 'Coriander Seeds', 'grams', 1500.00, 250.00, 0.55, 'Spice Market', 180),
('tenant-chutneys', 'Fenugreek Seeds', 'grams', 800.00, 150.00, 0.75, 'Spice Market', 180),
('tenant-chutneys', 'Asafoetida', 'grams', 200.00, 50.00, 3.00, 'Spice Market', 365),

-- Vegetables & Produce
('tenant-chutneys', 'Onions', 'kg', 50.00, 12.00, 30.00, 'Veggie Mart', 14),
('tenant-chutneys', 'Tomatoes', 'kg', 40.00, 10.00, 35.00, 'Veggie Mart', 7),
('tenant-chutneys', 'Potatoes', 'kg', 45.00, 10.00, 25.00, 'Veggie Mart', 21),
('tenant-chutneys', 'Green Chilies', 'kg', 4.00, 1.00, 80.00, 'Veggie Mart', 7),
('tenant-chutneys', 'Ginger', 'kg', 8.00, 2.00, 120.00, 'Veggie Mart', 14),
('tenant-chutneys', 'Cilantro', 'kg', 3.00, 1.00, 40.00, 'Veggie Mart', 3),
('tenant-chutneys', 'Coconut (fresh)', 'pieces', 50.00, 10.00, 25.00, 'Fruit Vendor', 7),

-- Oils & Condiments
('tenant-chutneys', 'Coconut Oil', 'liters', 30.00, 8.00, 180.00, 'Oil Depot', 365),
('tenant-chutneys', 'Ghee', 'liters', 15.00, 3.00, 450.00, 'Pure Ghee Co', 180),
('tenant-chutneys', 'Salt', 'kg', 20.00, 5.00, 20.00, 'Grocery Store', 730),
('tenant-chutneys', 'Tamarind', 'kg', 10.00, 2.00, 140.00, 'Spice Market', 365),

-- Chutneys & Accompaniments
('tenant-chutneys', 'Peanuts', 'kg', 15.00, 4.00, 120.00, 'Nut Supplier', 180),
('tenant-chutneys', 'Cashews', 'kg', 8.00, 2.00, 600.00, 'Nut Supplier', 180),

-- Beverages
('tenant-chutneys', 'Coffee Powder', 'kg', 12.00, 3.00, 400.00, 'Coffee Estate', 180),
('tenant-chutneys', 'Tea Leaves', 'kg', 5.00, 1.00, 250.00, 'Tea Gardens', 180),
('tenant-chutneys', 'Milk', 'liters', 40.00, 10.00, 50.00, 'Local Dairy', 2);

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply: psql -h localhost -U postgres -d demo -f src/lib/db/chef-seed-ingredients.sql
-- Check: SELECT tenant_id, COUNT(*) FROM ingredients GROUP BY tenant_id;
