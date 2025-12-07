import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

/**
 * Migrate database and seed initial data
 */
async function migrate() {
  try {
    console.log("🚀 Starting database migration...\n");

    // Read and execute migration SQL
    const migrationPath = path.join(process.cwd(), "drizzle", "0000_sloppy_moonstone.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    const pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "demo",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    });

    await pool.query(migrationSQL);
    console.log("✅ Migration completed successfully\n");

    await pool.end();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

/**
 * Seed initial data
 */
async function seed() {
  try {
    console.log("🌱 Seeding database...\n");

    // Seed Restaurant Tables
    const restaurantTables = [
      { id: "T1", capacity: 2, status: "available" },
      { id: "T2", capacity: 2, status: "available" },
      { id: "T3", capacity: 4, status: "available" },
      { id: "T4", capacity: 4, status: "available" },
      { id: "T5", capacity: 6, status: "available" },
      { id: "T6", capacity: 6, status: "available" },
      { id: "T7", capacity: 8, status: "available" },
    ];

    for (const table of restaurantTables) {
      await db.insert(schema.tables).values(table).onConflictDoNothing();
    }
    console.log("✅ Seeded 7 restaurant tables");

    // Seed Menu Items
    const menuItemsData = [
      // Appetizers
      {
        id: "app-001",
        name: "Samosa (2 pcs)",
        description: "Crispy pastry filled with spiced potatoes and peas",
        category: "appetizers",
        price: "100",
        ingredients: ["potatoes", "peas", "flour", "cumin", "coriander", "oil"],
        allergens: ["gluten"],
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
        price: "180",
        ingredients: ["chicken", "yogurt", "ginger", "garlic", "garam masala", "lemon"],
        allergens: ["dairy"],
        spiceLevel: 2,
        isVegetarian: false,
        isVegan: false,
        prepTime: 15,
      },
      {
        id: "app-003",
        name: "Paneer Pakora",
        description: "Indian cottage cheese fritters with chickpea batter",
        category: "appetizers",
        price: "150",
        ingredients: ["paneer", "chickpea flour", "spices", "oil"],
        allergens: ["dairy"],
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        prepTime: 12,
      },
      // Main Dishes
      {
        id: "main-001",
        name: "Chicken Tikka Masala",
        description: "Tender chicken in creamy tomato sauce with aromatic spices",
        category: "mains",
        price: "300",
        ingredients: ["chicken", "tomatoes", "cream", "onions", "ginger", "garlic", "garam masala", "fenugreek"],
        allergens: ["dairy"],
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
        price: "250",
        ingredients: ["spinach", "paneer", "onions", "tomatoes", "cream", "cumin", "garam masala"],
        allergens: ["dairy"],
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        prepTime: 20,
      },
      {
        id: "main-003",
        name: "Lamb Rogan Josh",
        description: "Aromatic lamb curry with Kashmiri spices",
        category: "mains",
        price: "350",
        ingredients: ["lamb", "yogurt", "tomatoes", "onions", "kashmiri chili", "cardamom", "cinnamon"],
        allergens: ["dairy"],
        spiceLevel: 3,
        isVegetarian: false,
        isVegan: false,
        prepTime: 30,
      },
      {
        id: "main-004",
        name: "Chana Masala",
        description: "Chickpeas in tangy tomato-based sauce",
        category: "mains",
        price: "220",
        ingredients: ["chickpeas", "tomatoes", "onions", "ginger", "garlic", "cumin", "coriander"],
        allergens: [],
        spiceLevel: 2,
        isVegetarian: true,
        isVegan: true,
        prepTime: 18,
      },
      {
        id: "main-005",
        name: "Butter Chicken",
        description: "Classic Delhi-style chicken in rich buttery tomato sauce",
        category: "mains",
        price: "320",
        ingredients: ["chicken", "butter", "cream", "tomatoes", "fenugreek", "garam masala", "honey"],
        allergens: ["dairy"],
        spiceLevel: 1,
        isVegetarian: false,
        isVegan: false,
        prepTime: 25,
      },
      // Breads
      {
        id: "bread-001",
        name: "Garlic Naan",
        description: "Tandoor-baked flatbread with garlic and butter",
        category: "breads",
        price: "80",
        ingredients: ["flour", "yogurt", "garlic", "butter", "yeast"],
        allergens: ["gluten", "dairy"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 8,
      },
      {
        id: "bread-002",
        name: "Plain Naan",
        description: "Traditional tandoor-baked flatbread",
        category: "breads",
        price: "60",
        ingredients: ["flour", "yogurt", "yeast", "salt"],
        allergens: ["gluten", "dairy"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 8,
      },
      {
        id: "bread-003",
        name: "Roti (Wheat Bread)",
        description: "Whole wheat flatbread",
        category: "breads",
        price: "50",
        ingredients: ["whole wheat flour", "water", "salt"],
        allergens: ["gluten"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: true,
        prepTime: 5,
      },
      // Beverages
      {
        id: "bev-001",
        name: "Mango Lassi",
        description: "Refreshing yogurt drink with mango",
        category: "beverages",
        price: "100",
        ingredients: ["yogurt", "mango", "sugar", "cardamom"],
        allergens: ["dairy"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 3,
      },
      {
        id: "bev-002",
        name: "Masala Chai",
        description: "Spiced Indian tea with milk",
        category: "beverages",
        price: "70",
        ingredients: ["black tea", "milk", "ginger", "cardamom", "cinnamon", "sugar"],
        allergens: ["dairy"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 5,
      },
      // Desserts
      {
        id: "des-001",
        name: "Gulab Jamun",
        description: "Sweet milk-solid dumplings in rose syrup",
        category: "desserts",
        price: "120",
        ingredients: ["milk solids", "flour", "sugar", "rose water", "cardamom"],
        allergens: ["dairy", "gluten"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 10,
      },
      {
        id: "des-002",
        name: "Kheer (Rice Pudding)",
        description: "Creamy rice pudding with cardamom and nuts",
        category: "desserts",
        price: "100",
        ingredients: ["rice", "milk", "sugar", "cardamom", "almonds", "pistachios"],
        allergens: ["dairy", "nuts"],
        spiceLevel: 0,
        isVegetarian: true,
        isVegan: false,
        prepTime: 15,
      },
    ];

    for (const item of menuItemsData) {
      await db.insert(schema.menuItems).values(item).onConflictDoNothing();
    }
    console.log("✅ Seeded 15 menu items");

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Run migration and seed
async function main() {
  await migrate();
  await seed();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
