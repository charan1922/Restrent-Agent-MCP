/**
 * Manual Test Script for Chef Agent A2A Integration
 * 
 * This script tests the complete flow:
 * 1. Waiter Agent → Chef Agent: PLACE_ORDER
 * 2. Chef Agent processes: Check inventory, calculate ETA, calculate COGS, deduct stock
 * 3. Waiter Agent → Chef Agent: REQUEST_STATUS
 * 
 * Run: npx tsx src/lib/a2a/test-chef-integration.ts
 */

import { getChefAgentClient } from "./chef-client";
import type { Order } from "./schema";
import { v4 as uuidv4 } from "uuid";

async function testChefAgentIntegration() {
  console.log("🧪 Testing Chef Agent A2A Integration\n");
  console.log("=".repeat(60));

  const chefClient = getChefAgentClient();

  // TEST 1: Health Check
  console.log("\n📋 TEST 1: Health Check");
  console.log("-".repeat(60));
  try {
    const isHealthy = await chefClient.healthCheck();
    console.log(isHealthy ? "✅ Chef Agent is reachable" : "❌ Chef Agent is offline");
    
    if (!isHealthy) {
      console.error("Cannot proceed without Chef Agent");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Health check failed:", error);
    process.exit(1);
  }

  // TEST 2: Place Order
  console.log("\n📋 TEST 2: Place Order");
  console.log("-".repeat(60));
  const testOrder: Order = {
    orderId: uuidv4(),
    tableId: "T3",
    items: [
      {
        itemId: "chicken-tikka-masala", // Assuming this ID exists in menu_items
        itemName: "Chicken Tikka Masala",
        quantity: 2,
        modifications: ["extra spicy"],
        specialInstructions: "Please serve with extra naan",
      },
      {
        itemId: "garlic-naan",
        itemName: "Garlic Naan",
        quantity: 4,
      },
    ],
    timestamp: new Date().toISOString(),
    priority: "normal",
  };

  console.log(`Order ID: ${testOrder.orderId}`);
  console.log(`Table: ${testOrder.tableId}`);
  console.log(`Items: ${testOrder.items.length}`);

  try {
    const orderResponse = await chefClient.placeOrder(testOrder);
    console.log("\n✅ Order placed successfully!");
    console.log(`Status: ${orderResponse.status}`);
    console.log(`ETA: ${orderResponse.eta} minutes`);
    console.log(`Message: ${orderResponse.message}`);
    
    if (orderResponse.missingIngredients && orderResponse.missingIngredients.length > 0) {
      console.warn(`⚠️  Missing ingredients: ${orderResponse.missingIngredients.join(", ")}`);
    }

    // TEST 3: Request Status
    console.log("\n📋 TEST 3: Request Order Status");
    console.log("-".repeat(60));
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const statusResponse = await chefClient.requestOrderStatus(testOrder.orderId);
    console.log(`✅ Status retrieved`);
    console.log(`Current Status: ${statusResponse.status}`);
    console.log(`Remaining ETA: ${statusResponse.eta} minutes`);
    console.log(`Message: ${statusResponse.message}`);

    // TEST 4: Check Inventory Deduction
    console.log("\n📋 TEST 4: Verify Inventory Deduction");
    console.log("-".repeat(60));
    console.log("Check database for:");
    console.log("  • chef_orders table - should have 1 new record");
    console.log("  • inventory_transactions - should have deduction records");
    console.log("  • ingredients - stock levels should be reduced");
    console.log("\nSQL Query:");
    console.log("SELECT * FROM chef_orders WHERE waiter_order_id = '" + testOrder.orderId + "';");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Test Complete!");
  console.log("\nNext Steps:");
  console.log("1. Check database: psql -h localhost -U postgres -d demo");
  console.log("2. View inventory: SELECT name, current_stock FROM ingredients WHERE tenant_id = 'tenant-pista-house' LIMIT 10;");
  console.log("3. View chef orders: SELECT * FROM chef_orders;");
}

// Run tests
testChefAgentIntegration().catch(console.error);
