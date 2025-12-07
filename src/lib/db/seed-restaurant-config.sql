-- Restaurant Configuration Settings
-- These settings allow each tenant to fully customize their AI waiter

-- Pista House Configuration
INSERT INTO settings (id, tenant_id, key, value, value_type, updated_at) VALUES
('set-pista-desc', 'tenant-pista-house', 'restaurant_description', 'A premium Indian restaurant specializing in Hyderabadi biryanis, authentic North Indian cuisine, and delectable rolls and sandwiches.', 'string', NOW()),
('set-pista-cuisine', 'tenant-pista-house', 'cuisine_type', 'Hyderabadi & North Indian', 'string', NOW()),
('set-pista-hours', 'tenant-pista-house', 'operating_hours', '11:00 AM - 11:00 PM (Daily)', 'string', NOW()),
('set-pista-tone', 'tenant-pista-house', 'ai_tone', 'warm and welcoming', 'string', NOW()),
('set-pista-special', 'tenant-pista-house', 'special_instructions', 'Highlight our signature dishes: Hyderabadi Biryani, Chicken Kabab Roll, and authentic Irani Chai. Mention that we use traditional recipes passed down through generations.', 'string', NOW()),
('set-pista-features', 'tenant-pista-house', 'restaurant_features', 'Dine-in, Takeaway, Home Delivery, Party Orders, Catering Services', 'string', NOW())
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Chutneys Configuration
INSERT INTO settings (id, tenant_id, key, value, value_type, updated_at) VALUES
('set-chutn-desc', 'tenant-chutneys', 'restaurant_description', 'A beloved South Indian restaurant famous for authentic dosas, idlis, and traditional Tamil Nadu & Andhra cuisine.', 'string', NOW()),
('set-chutn-cuisine', 'tenant-chutneys', 'cuisine_type', 'South Indian (Tamil Nadu & Andhra)', 'string', NOW()),
('set-chutn-hours', 'tenant-chutneys', 'operating_hours', '7:00 AM - 10:00 PM (Daily)', 'string', NOW()),
('set-chutn-tone', 'tenant-chutneys', 'ai_tone', 'friendly and helpful', 'string', NOW()),
('set-chutn-special', 'tenant-chutneys', 'special_instructions', 'Emphasize our crispy dosas made with fermented batter, filter coffee, and traditional South Indian breakfast items. We serve breakfast all day!', 'string', NOW()),
('set-chutn-features', 'tenant-chutneys', 'restaurant_features', 'All-day Breakfast, Dine-in, Takeaway, Family-friendly, Vegetarian Options', 'string', NOW())
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
