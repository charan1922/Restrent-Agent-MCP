-- Real Menu Items from Pista House and Chutneys

-- ==================== PISTA HOUSE ====================

-- MAINS (Pasta)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('main-ph-001', 'tenant-pista-house', 'Veg Manchani Pasta', 'Vegetarian pasta with Manchurian sauce', 'mains', 100, '["pasta", "vegetables", "manchurian sauce"]', '["gluten"]', 1, true, false, 20, true),
('main-ph-002', 'tenant-pista-house', 'Chicken Manchani Pasta', 'Chicken pasta with Manchurian sauce', 'mains', 140, '["pasta", "chicken", "manchurian sauce"]', '["gluten"]', 1, false, false, 25, true),
('main-ph-003', 'tenant-pista-house', 'Veg Italian Creamy Pasta', 'Creamy Italian style vegetarian pasta', 'mains', 140, '["pasta", "cream", "vegetables", "italian herbs"]', '["gluten", "dairy"]', 0, true, false, 20, true),
('main-ph-004', 'tenant-pista-house', 'Chicken Italian Creamy Pasta', 'Creamy Italian pasta with chicken', 'mains', 140, '["pasta", "chicken", "cream", "italian herbs"]', '["gluten", "dairy"]', 0, false, false, 25, true);

-- MAINS (Rolls)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('main-ph-005', 'tenant-pista-house', 'Veg Roll', 'Vegetable roll wrap', 'mains', 50, '["wrap", "vegetables", "sauce"]', '["gluten"]', 1, true, false, 15, true),
('main-ph-006', 'tenant-pista-house', 'Veg Spring Roll', 'Crispy vegetable spring roll', 'mains', 60, '["spring roll wrapper", "cabbage", "carrots"]', '["gluten"]', 1, true, true, 15, true),
('main-ph-007', 'tenant-pista-house', 'Garlic Cheese Roll', 'Roll with garlic and cheese', 'mains', 90, '["wrap", "garlic", "cheese", "vegetables"]', '["gluten", "dairy"]', 1, true, false, 15, true),
('main-ph-008', 'tenant-pista-house', 'Chicken Kabab Roll', 'Chicken kabab wrapped in roll', 'mains', 100, '["wrap", "chicken kabab", "onions", "sauce"]', '["gluten"]', 2, false, false, 20, true),
('main-ph-009', 'tenant-pista-house', 'Chicken Tikka Roll', 'Tikka chicken in roll wrap', 'mains', 100, '["wrap", "chicken tikka", "sauce"]', '["gluten", "dairy"]', 2, false, false, 20, true),
('main-ph-010', 'tenant-pista-house', 'Istanbul Chicken Roll', 'Turkish style chicken roll', 'mains', 100, '["wrap", "chicken", "special sauce"]', '["gluten"]', 2, false, false, 20, true),
('main-ph-011', 'tenant-pista-house', 'Chicken Kati Roll', 'Kati style chicken roll', 'mains', 90, '["kati wrap", "chicken", "onions"]', '["gluten"]', 2, false, false, 18, true),
('main-ph-012', 'tenant-pista-house', 'Chicken Cheese Roll', 'Chicken and cheese roll', 'mains', 100, '["wrap", "chicken", "cheese"]', '["gluten", "dairy"]', 1, false, false, 18, true),
('main-ph-013', 'tenant-pista-house', 'Chicken Butter Roll', 'Butter chicken in roll', 'mains', 80, '["wrap", "butter chicken", "sauce"]', '["gluten", "dairy"]', 1, false, false, 18, true),
('main-ph-014', 'tenant-pista-house', 'Chicken Spring Roll', 'Chicken spring roll', 'mains', 80, '["spring roll wrapper", "chicken", "vegetables"]', '["gluten"]', 1, false, false, 18, true),
('main-ph-015', 'tenant-pista-house', 'Chicken Zinger Roll', 'Spicy zinger chicken roll', 'mains', 100, '["wrap", "zinger chicken", "sauce"]', '["gluten"]', 3, false, false, 20, true),
('main-ph-016', 'tenant-pista-house', 'Chicken Chilli Tandoori Roll', 'Tandoori chicken with chilli', 'mains', 100, '["wrap", "tandoori chicken", "chilli sauce"]', '["gluten", "dairy"]', 3, false, false, 20, true);

-- APPETIZERS (Sides)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('appe-ph-001', 'tenant-pista-house', 'Veg Manchurian', 'Indo-Chinese veg balls', 'appetizers', 40, '["vegetables", "cornflour", "soy sauce"]', '["gluten", "soy"]', 1, true, true, 15, true),
('appe-ph-002', 'tenant-pista-house', 'Veg Nuggets', 'Crispy vegetable nuggets', 'appetizers', 50, '["vegetables", "breadcrumbs"]', '["gluten"]', 1, true, false, 15, true),
('appe-ph-003', 'tenant-pista-house', 'French Fries', 'Classic french fries', 'appetizers', 80, '["potatoes", "salt"]', '[]', 0, true, true, 12, true),
('appe-ph-004', 'tenant-pista-house', 'Masala Fries', 'Spiced french fries', 'appetizers', 90, '["potatoes", "masala"]', '[]', 1, true, true, 12, true),
('appe-ph-005', 'tenant-pista-house', 'Chocolate Fries', 'Fries with chocolate drizzle', 'appetizers', 90, '["potatoes", "chocolate"]', '["dairy"]', 0, true, false, 12, true),
('appe-ph-006', 'tenant-pista-house', 'Smiles', 'Smiley potato fritters', 'appetizers', 80, '["potatoes"]', '[]', 0, true, true, 10, true),
('appe-ph-007', 'tenant-pista-house', 'Potato Wedges', 'Crispy potato wedges', 'appetizers', 90, '["potatoes", "herbs"]', '[]', 1, true, true, 15, true),
('appe-ph-008', 'tenant-pista-house', 'Chilli Fries', 'Spicy chilli fries', 'appetizers', 90, '["potatoes", "chilli"]', '[]', 2, true, true, 12, true),
('appe-ph-009', 'tenant-pista-house', 'Peri Peri Fries', 'Peri peri spiced fries', 'appetizers', 100, '["potatoes", "peri peri"]', '[]', 2, true, true, 12, true),
('appe-ph-010', 'tenant-pista-house', 'Chilli Honey Loaded Fries', 'Loaded fries with chilli honey', 'appetizers', 100, '["potatoes", "chilli", "honey", "cheese"]', '["dairy"]', 2, true, false, 15, true),
('appe-ph-011', 'tenant-pista-house', 'Chicken Nuggets', 'Crispy chicken nuggets', 'appetizers', 90, '["chicken", "breadcrumbs"]', '["gluten"]', 1, false, false, 15, true),
('appe-ph-012', 'tenant-pista-house', 'Chicken Popcorn', 'Bite-sized chicken popcorn', 'appetizers', 90, '["chicken", "spices"]', '[]', 1, false, false, 12, true),
('appe-ph-013', 'tenant-pista-house', 'Chicken Drum Stick', 'Fried chicken drumstick', 'appetizers', 70, '["chicken drumstick", "spices"]', '[]', 1, false, false, 20, true),
('appe-ph-014', 'tenant-pista-house', 'Chicken Leg Piece', 'Fried chicken leg', 'appetizers', 90, '["chicken leg", "spices"]', '[]', 1, false, false, 20, true),
('appe-ph-015', 'tenant-pista-house', 'Chicken Wings', 'Crispy chicken wings', 'appetizers', 50, '["chicken wings", "spices"]', '[]', 2, false, false, 18, true),
('appe-ph-016', 'tenant-pista-house', 'Chicken Cutlet', 'Chicken cutlet', 'appetizers', 60, '["chicken", "breadcrumbs", "spices"]', '["gluten"]', 1, false, false, 15, true);

-- MAINS (Sandwiches & Burgers)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('main-ph-017', 'tenant-pista-house', 'Veg Grilled Sandwich', 'Grilled vegetable sandwich', 'mains', 70, '["bread", "vegetables", "cheese"]', '["gluten", "dairy"]', 0, true, false, 12, true),
('main-ph-018', 'tenant-pista-house', 'Chicken Grilled Sandwich', 'Grilled chicken sandwich', 'mains', 80, '["bread", "chicken", "cheese"]', '["gluten", "dairy"]', 1, false, false, 15, true),
('main-ph-019', 'tenant-pista-house', 'Veg Burger', 'Vegetable burger', 'mains', 70, '["bun", "veg patty", "lettuce"]', '["gluten"]', 0, true, false, 12, true),
('main-ph-020', 'tenant-pista-house', 'Paneer Burger', 'Paneer burger', 'mains', 90, '["bun", "paneer patty", "sauce"]', '["gluten", "dairy"]', 1, true, false, 15, true),
('main-ph-021', 'tenant-pista-house', 'Chicken Burger', 'Classic chicken burger', 'mains', 90, '["bun", "chicken patty", "lettuce"]', '["gluten"]', 1, false, false, 15, true),
('main-ph-022', 'tenant-pista-house', 'BBq Chicken Burger', 'BBQ sauce chicken burger', 'mains', 90, '["bun", "chicken patty", "bbq sauce"]', '["gluten"]', 1, false, false, 15, true),
('main-ph-023', 'tenant-pista-house', 'Chicken Tandoori Burger', 'Tandoori chicken burger', 'mains', 90, '["bun", "tandoori chicken", "sauce"]', '["gluten", "dairy"]', 2, false, false, 18, true),
('main-ph-024', 'tenant-pista-house', 'Chicken Zinger Burger', 'Spicy zinger burger', 'mains', 90, '["bun", "zinger chicken", "sauce"]', '["gluten"]', 3, false, false, 15, true),
('main-ph-025', 'tenant-pista-house', 'Chicken Chilli Burger', 'Chicken burger with chilli', 'mains', 100, '["bun", "chicken", "chilli sauce"]', '["gluten"]', 3, false, false, 15, true),
('main-ph-026', 'tenant-pista-house', 'Fish Burger', 'Fish fillet burger', 'mains', 160, '["bun", "fish fillet", "tartar sauce"]', '["gluten"]', 1, false, false, 20, true);

-- BEVERAGES (Shakes & Drinks)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('beve-ph-001', 'tenant-pista-house', 'Frothy Shake', 'Signature frothy shake', 'beverages', 150, '["milk", "ice cream", "flavoring"]', '["dairy"]', 0, true, false, 8, true),
('beve-ph-002', 'tenant-pista-house', 'Fancy Shake', 'Premium fancy shake', 'beverages', 180, '["milk", "ice cream", "toppings"]', '["dairy"]', 0, true, false, 10, true),
('beve-ph-003', 'tenant-pista-house', 'Date Safan', 'Date and saffron shake', 'beverages', 220, '["dates", "milk", "saffron"]', '["dairy"]', 0, true, false, 10, true),
('beve-ph-004', 'tenant-pista-house', 'Lassi', 'Traditional yogurt drink', 'beverages', 70, '["yogurt", "sugar"]', '["dairy"]', 0, true, false, 5, true),
('beve-ph-005', 'tenant-pista-house', 'Jaluda', 'Rose flavored milk drink', 'beverages', 80, '["milk", "rose syrup", "basil seeds"]', '["dairy"]', 0, true, false, 8, true),
('beve-ph-006', 'tenant-pista-house', 'Strawberry Malai', 'Strawberry cream shake', 'beverages', 150, '["strawberry", "malai", "milk"]', '["dairy"]', 0, true, false, 10, true),
('beve-ph-007', 'tenant-pista-house', 'Mango Malai', 'Mango cream shake', 'beverages', 150, '["mango", "malai", "milk"]', '["dairy"]', 0, true, false, 10, true),
('beve-ph-008', 'tenant-pista-house', 'Cold Coffee', 'Iced coffee shake', 'beverages', 120, '["coffee", "milk", "ice cream"]', '["dairy"]', 0, true, false, 8, true),
('beve-ph-009', 'tenant-pista-house', 'Virgin Mojito', 'Non-alcoholic mojito', 'beverages', 70, '["lime", "mint", "soda"]', '[]', 0, true, true, 5, true);

-- DESSERTS (select cakes)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('dess-ph-001', 'tenant-pista-house', 'Pineapple Cake', 'Fresh pineapple cake', 'desserts', 300, '["flour", "pineapple", "cream"]', '["gluten", "dairy"]', 0, true, false, 0, true),
('dess-ph-002', 'tenant-pista-house', 'Black Forest Cake', 'Classic black forest', 'desserts', 450, '["chocolate", "cherry", "cream"]', '["gluten", "dairy"]', 0, true, false, 0, true),
('dess-ph-003', 'tenant-pista-house', 'Chocolate Truffle Cake', 'Rich chocolate truffle', 'desserts', 500, '["chocolate", "cream", "truffle"]', '["gluten", "dairy"]', 0, true, false, 0, true),
('dess-ph-004', 'tenant-pista-house', 'Red Velvet Cake', 'Red velvet with cream cheese', 'desserts', 500, '["cocoa", "cream cheese", "flour"]', '["gluten", "dairy"]', 0, true, false, 0, true);


-- ==================== CHUTNEYS ====================

-- MAINS (Dosas)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('main-ch-001', 'tenant-chutneys', 'Plain Dosa', 'Classic South Indian crispy dosa', 'mains', 105, '["rice", "urad dal"]', '[]', 0, true, true, 15, true),
('main-ch-002', 'tenant-chutneys', 'Masala Dosa', 'Dosa with spiced potato filling', 'mains', 135, '["rice", "urad dal", "potato", "spices"]', '[]', 1, true, true, 18, true),
('main-ch-003', 'tenant-chutneys', 'Onion Dosa', 'Dosa with onion topping', 'mains', 189, '["rice", "urad dal", "onions"]', '[]', 1, true, true, 15, true),
('main-ch-004', 'tenant-chutneys', 'Rava Dosa', 'Crispy semolina dosa', 'mains', 200, '["rava", "rice flour", "spices"]', '["gluten"]', 1, true, true, 15, true),
('main-ch-005', 'tenant-chutneys', 'Rava Masala Dosa', 'Rava dosa with potato masala', 'mains', 220, '["rava", "potato", "spices"]', '["gluten"]', 1, true, true, 20, true),
('main-ch-006', 'tenant-chutneys', 'Butter Masala Dosa', 'Butter-brushed masala dosa', 'mains', 220, '["rice", "urad dal", "potato", "butter"]', '["dairy"]', 1, true, false, 18, true),
('main-ch-007', 'tenant-chutneys', 'Paneer Dosa', 'Dosa with paneer filling', 'mains', 220, '["rice", "urad dal", "paneer"]', '["dairy"]', 1, true, false, 20, true),
('main-ch-008', 'tenant-chutneys', 'Uttappam', 'Thick rice pancake with toppings', 'mains', 200, '["rice", "urad dal", "vegetables"]', '[]', 1, true, true, 18, true),
('main-ch-009', 'tenant-chutneys', 'Idly', 'Steamed rice cakes', 'mains', 90, '["rice", "urad dal"]', '[]', 0, true, true, 15, true),
('main-ch-010', 'tenant-chutneys', 'Vada', 'Crispy lentil donuts', 'mains', 155, '["urad dal", "spices"]', '[]', 1, true, true, 15, true),
('main-ch-011', 'tenant-chutneys', 'Upma', 'Semolina breakfast dish', 'mains', 147, '["rava", "vegetables", "spices"]', '["gluten"]', 1, true, true, 15, true);

-- MAINS (Chinese & Indian)
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('main-ch-012', 'tenant-chutneys', 'Veg Manchurian', 'Indo-Chinese veg balls', 'mains', 415, '["vegetables", "cornflour", "soy sauce"]', '["gluten", "soy"]', 2, true, true, 20, true),
('main-ch-013', 'tenant-chutneys', 'Veg Spring Roll', 'Crispy vegetable spring rolls', 'mains', 415, '["spring roll wrapper", "cabbage", "carrots"]', '["gluten"]', 1, true, true, 18, true),
('main-ch-014', 'tenant-chutneys', 'Gobi Manchurian', 'Cauliflower Manchurian', 'mains', 415, '["cauliflower", "cornflour", "sauce"]', '["gluten", "soy"]', 2, true, true, 20, true),
('main-ch-015', 'tenant-chutneys', 'Dal Fry', 'Tempered yellow lentils', 'mains', 365, '["lentils", "tomatoes", "spices"]', '[]', 1, true, true, 25, true),
('main-ch-016', 'tenant-chutneys', 'Dal Tadka', 'Tadka dal with ghee', 'mains', 365, '["lentils", "ghee", "spices"]', '["dairy"]', 1, true, false, 25, true),
('main-ch-017', 'tenant-chutneys', 'Dal Makhani', 'Creamy black lentils', 'mains', 365, '["black lentils", "cream", "butter"]', '["dairy"]', 1, true, false, 40, true),
('main-ch-018', 'tenant-chutneys', 'Veg Biryani', 'Vegetable biryani', 'mains', 365, '["basmati rice", "vegetables", "spices"]', '[]', 2, true, true, 35, true),
('main-ch-019', 'tenant-chutneys', 'Paneer Butter Masala', 'Paneer in rich butter gravy', 'mains', 415, '["paneer", "tomatoes", "cream", "butter"]', '["dairy"]', 1, true, false, 25, true),
('main-ch-020', 'tenant-chutneys', 'Veg Kofta Curry', 'Mixed veg dumplings in curry', 'mains', 415, '["vegetables", "gram flour", "curry"]', '["dairy"]', 1, true, false, 30, true);

-- BREADS
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('brea-ch-001', 'tenant-chutneys', 'Roti', 'Whole wheat flatbread', 'breads', 85, '["whole wheat flour"]', '["gluten"]', 0, true, true, 10, true),
('brea-ch-002', 'tenant-chutneys', 'Naan', 'Leavened flatbread', 'breads', 90, '["wheat flour", "yogurt"]', '["gluten", "dairy"]', 0, true, false, 12, true),
('brea-ch-003', 'tenant-chutneys', 'Butter Naan', 'Naan with butter', 'breads', 100, '["wheat flour", "butter"]', '["gluten", "dairy"]', 0, true, false, 12, true);

-- BEVERAGES
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('beve-ch-001', 'tenant-chutneys', 'Filter Coffee', 'Traditional South Indian coffee', 'beverages', 105, '["coffee", "milk"]', '["dairy"]', 0, true, false, 8, true),
('beve-ch-002', 'tenant-chutneys', 'Masala Tea', 'Spiced Indian tea', 'beverages', 110, '["tea", "milk", "spices"]', '["dairy"]', 0, true, false, 8, true),
('beve-ch-003', 'tenant-chutneys', 'Soft Drinks', 'Assorted soft drinks', 'beverages', 110, '["carbonated water", "flavoring"]', '[]', 0, true, true, 2, true);

-- DESSERTS
INSERT INTO menu_items (id, tenant_id, name, description, category, price, ingredients, allergens, spice_level, is_vegetarian, is_vegan, prep_time, is_available) VALUES
('dess-ch-001', 'tenant-chutneys', 'Gulab Jamun', 'Sweet fried dumplings in syrup', 'desserts', 165, '["milk powder", "flour", "sugar syrup"]', '["gluten", "dairy"]', 0, true, false, 0, true),
('dess-ch-002', 'tenant-chutneys', 'Ice Cream', 'Assorted ice cream flavors', 'desserts', 245, '["milk", "cream", "sugar"]', '["dairy"]', 0, true, false, 0, true);
