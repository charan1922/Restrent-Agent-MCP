-- Seed default categories for existing tenants

-- Pista House Categories
INSERT INTO menu_categories (id, tenant_id, name, display_order, is_active) VALUES
('cat-ph-001', 'tenant-pista-house', 'mains', 1, true),
('cat-ph-002', 'tenant-pista-house', 'appetizers', 2, true),
('cat-ph-003', 'tenant-pista-house', 'beverages', 3, true),
('cat-ph-004', 'tenant-pista-house', 'desserts', 4, true),
('cat-ph-005', 'tenant-pista-house', 'breads', 5, true)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Chutneys Categories
INSERT INTO menu_categories (id, tenant_id, name, display_order, is_active) VALUES
('cat-ch-001', 'tenant-chutneys', 'mains', 1, true),
('cat-ch-002', 'tenant-chutneys', 'appetizers', 2, true),
('cat-ch-003', 'tenant-chutneys', 'breads', 3, true),
('cat-ch-004', 'tenant-chutneys', 'beverages', 4, true),
('cat-ch-005', 'tenant-chutneys', 'desserts', 5, true)
ON CONFLICT (tenant_id, name) DO NOTHING;
