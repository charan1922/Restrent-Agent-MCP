import pool, { query } from "../lib/db/postgres";
import * as fs from "fs";
import * as path from "path";

/**
 * Setup database with schema and seed data
 * No ORM - just plain SQL with pg
 */
async function setupDatabase() {
  try {
    console.log("🚀 Setting up PostgreSQL database...\n");

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), "src/lib/db/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    
    await query(schemaSql);
    console.log("✅ Schema created successfully\n");

    // Seed restaurant tables
    console.log("🌱 Seeding data...\n");
    
    const tables = [
      { id: "T1", capacity: 2 },
      { id: "T2", capacity: 2 },
      { id: "T3", capacity: 4 },
      { id: "T4", capacity: 4 },
      { id: "T5", capacity: 6 },
      { id: "T6", capacity: 6 },
      { id: "T7", capacity: 8 },
    ];

    for (const table of tables) {
      await query(
        `INSERT INTO tables (id, capacity, status) 
         VALUES ($1, $2, 'available') 
         ON CONFLICT (id) DO NOTHING`,
        [table.id, table.capacity]
      );
    }
    console.log("✅ Seeded 7 restaurant tables");

    // Seed menu items
    const menuItems = [
      {
        id: "app-001",
        name: "Samosa (2 pcs)",
        description: "Crispy pastry filled with spiced potatoes and peas",
        category: "appetizers",
        price: 100,
        ingredients: JSON.stringify(["potatoes", "peas", "flour", "cumin", "coriander", "oil"]),
        allergens: JSON.stringify(["gluten"]),
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: true,
        prepTime: 10,
      },
      {
        id: "app-002",
        name: "Chicken Tikka",
        description: "Marinated chicken pieces grilled in tandoor",
        category: "appetizers",
        price: 180,
        ingredients: JSON.stringify(["chicken", "yogurt", "ginger", "garlic", "garam masala", "lemon"]),
        allergens: JSON.stringify(["dairy"]),
        spiceLevel: 2,
        isVegetarian: false,
        isVegan: false,
        prepTime: 15,
      },
      {
        id: "main-001",
        name: "Chicken Tikka Masala",
        description: "Tender chicken in creamy tomato sauce with aromatic spices",
        category: "mains",
        price: 300,
        ingredients: JSON.stringify(["chicken", "tomatoes", "cream", "onions", "ginger", "garlic", "garam masala"]),
        allergens: JSON.stringify(["dairy"]),
        spiceLevel: 2,
        isVegetarian: false,
        isVegan: false,
        prepTime: 25,
      },
      {
        id: "main-002",
        name: "Palak Paneer",
        description: "Spinach curry with cubes of cottage cheese",
        category: "mains",
        price: 250,
        ingredients: JSON.stringify(["spinach", "paneer", "onions", "tomatoes", "cream", "cumin"]),
        allergens: JSON.stringify(["dairy"]),
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        prepTime: 20,
      },
      {
        id: "bread-001",
        name: "Garlic Naan",
        description: "Tandoor-baked flatbread with garlic and butter",
        category: "breads",
        price: 80,
        ingredients: JSON.stringify(["flour", "yogurt", "garlic", "butter", "yeast"]),
        allergens: JSON.stringify(["gluten", "dairy"]),
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 8,
      },
      {
        id: "bev-001",
        name: "Mango Lassi",
        description: "Refreshing yogurt drink with mango",
        category: "beverages",
        price: 100,
        ingredients: JSON.stringify(["yogurt", "mango", "sugar", "cardamom"]),
        allergens: JSON.stringify(["dairy"]),
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 3,
      },
    ];

    for (const item of menuItems) {
      await query(
        `INSERT INTO menu_items (
          id, name, description, category, price, ingredients, allergens,
          spice_level, is_vegetarian, is_vegan, prep_time, is_available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        ON CONFLICT (id) DO NOTHING`,
        [
          item.id, item.name, item.description, item.category, item.price,
          item.ingredients, item.allergens, item.spiceLevel, item.isVegetarian,
          item.isVegan, item.prepTime
        ]
      );
    }
    console.log("✅ Seeded menu items");

    console.log("\n🎉 Database setup completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
