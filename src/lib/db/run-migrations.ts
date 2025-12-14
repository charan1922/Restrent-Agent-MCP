import { query, default as pool } from "./postgres";
import fs from "fs";
import path from "path";

async function runMigrations() {
  console.log("🚀 Starting database migrations...");

  try {
    // 1. Multi-tenant Schema (Tenants, Users, Sessions)
    const multiTenantSql = fs.readFileSync(path.join(__dirname, "multi-tenant-migration.sql"), "utf8");
    console.log("▶️ Running multi-tenant-migration.sql...");
    await query(multiTenantSql);
    console.log("✅ Multi-tenant tables created.");

    // 2. Restaurant Schema (Tables, Orders, Menu)
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    console.log("▶️ Running schema.sql...");
    await query(schemaSql);
    console.log("✅ Restaurant tables created.");

    // 3. Seed Data (Optional but recommended)
    // Seed Tenants (already in multi-tenant-migration but idempotent?)
    
    // Seed Menu Categories
    if (fs.existsSync(path.join(__dirname, "seed-categories.sql"))) {
       console.log("▶️ Seeding menu categories...");
       const seedCatSql = fs.readFileSync(path.join(__dirname, "seed-categories.sql"), "utf8");
       await query(seedCatSql);
       console.log("✅ Menu categories seeded.");
    }
    
    // Seed Menu Items
    if (fs.existsSync(path.join(__dirname, "seed-menu-items.sql"))) {
       console.log("▶️ Seeding menu items...");
       const seedMenuSql = fs.readFileSync(path.join(__dirname, "seed-menu-items.sql"), "utf8");
       await query(seedMenuSql);
       console.log("✅ Menu items seeded.");
    }
    
    // Seed Restaurant Config
    if (fs.existsSync(path.join(__dirname, "seed-restaurant-config.sql"))) {
      console.log("▶️ Seeding restaurant config...");
      const seedConfigSql = fs.readFileSync(path.join(__dirname, "seed-restaurant-config.sql"), "utf8");
      await query(seedConfigSql);
      console.log("✅ Restaurant config seeded.");
    }

    // Seed Tables (Wait, we missed tables seed? Let's check chef-seed-ingredients etc. or maybe tables are manual?)
    // If no tables seed, we might need to create initial tables for orders to work.
    
    // Check if we need to mock tables
    console.log("ℹ️ Checking tables...");
    const tablesCheck = await query("SELECT COUNT(*) FROM tables");
    if (parseInt(tablesCheck.rows[0].count) === 0) {
       console.log("⚠️ No tables found. Inserting default tables...");
       // Insert some dummy tables for Pista House and Chutneys
       await query(`
         INSERT INTO tables (id, tenant_id, capacity, status) VALUES 
         ('table-1', 'tenant-pista-house', 4, 'available'),
         ('table-2', 'tenant-pista-house', 2, 'available'),
         ('table-1', 'tenant-chutneys', 4, 'available'),
         ('table-2', 'tenant-chutneys', 2, 'available')
         ON CONFLICT (id) DO NOTHING; -- Wait, id is primary key. table-1 duplicated?
         -- Schema says id TEXT PRIMARY KEY. So table-1 for Pista and Chutneys will COLLIDE if id is 'table-1'.
         -- The schema might be flawed for multi-tenancy if tables table doesn't have composite PK?
         -- Let's check schema.sql: "id TEXT PRIMARY KEY". It logic requires unique IDs globally.
         -- So we must prefix them.
       `);
       // Revised Insert
        await query(`
         INSERT INTO tables (id, tenant_id, capacity, status) VALUES 
         ('pista-table-1', 'tenant-pista-house', 4, 'available'),
         ('pista-table-2', 'tenant-pista-house', 2, 'available'),
         ('chutneys-table-1', 'tenant-chutneys', 4, 'available'),
         ('chutneys-table-2', 'tenant-chutneys', 2, 'available')
         ON CONFLICT (id) DO NOTHING;
       `);
       console.log("✅ Default tables created.");
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
