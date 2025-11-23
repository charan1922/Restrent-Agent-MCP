import { ChefAgentClient } from "./chef-client";
import { v4 as uuidv4 } from "uuid";
import type { Order } from "./schema";

/**
 * Test script to verify Chef Agent connectivity and A2A communication
 * Run with: npx tsx src/lib/a2a/test-chef-connection.ts
 */

async function testChefConnection() {
  console.log("🧪 Testing Chef Agent Connection...\n");

  const client = new ChefAgentClient();

  // Test 1: Health Check
  console.log("1️⃣ Testing Health Check...");
  try {
    const isHealthy = await client.healthCheck();
    if (isHealthy) {
      console.log("✅ Chef Agent is reachable and healthy\n");
    } else {
      console.log("❌ Chef Agent is not reachable\n");
      return;
    }
  } catch (error) {
    console.error("❌ Health check failed:", error);
    console.log("\n⚠️ Make sure Chef Agent is running on http://localhost:5000\n");
    return;
  }

  // Test 2: Place a test order
  console.log("2️⃣ Testing Order Placement...");
  const testOrder: Order = {
    orderId: uuidv4(),
    tableId: "T3",
    items: [
      {
        itemId: "main-001",
        itemName: "Chicken Tikka Masala",
        quantity: 2,
        modifications: ["extra spicy"],
        specialInstructions: "Please make it extra spicy",
      },
      {
        itemId: "bread-001",
        itemName: "Garlic Naan",
        quantity: 3,
      },
    ],
    timestamp: new Date().toISOString(),
    priority: "normal",
  };

  try {
    const orderResponse = await client.placeOrder(testOrder);
    console.log("✅ Order placed successfully!");
    console.log("   Order ID:", orderResponse.orderId);
    console.log("   Status:", orderResponse.status);
    console.log("   ETA:", orderResponse.eta ? `${orderResponse.eta} minutes` : "TBD");
    if (orderResponse.message) {
      console.log("   Message:", orderResponse.message);
    }
    if (orderResponse.missingIngredients && orderResponse.missingIngredients.length > 0) {
      console.log("   ⚠️ Missing ingredients:", orderResponse.missingIngredients.join(", "));
    }
    console.log();

    // Test 3: Request order status
    console.log("3️⃣ Testing Order Status Request...");
    try {
      const statusResponse = await client.requestOrderStatus(orderResponse.orderId);
      console.log("✅ Order status retrieved!");
      console.log("   Order ID:", statusResponse.orderId);
      console.log("   Status:", statusResponse.status);
      console.log("   ETA:", statusResponse.eta ? `${statusResponse.eta} minutes` : "TBD");
      if (statusResponse.completedItems && statusResponse.completedItems.length > 0) {
        console.log("   Completed items:", statusResponse.completedItems.join(", "));
      }
      console.log();
    } catch (error) {
      console.error("❌ Status request failed:", error);
      console.log();
    }

    // Test 4: Cancel the order
    console.log("4️⃣ Testing Order Cancellation...");
    try {
      await client.cancelOrder(orderResponse.orderId);
      console.log("✅ Order cancelled successfully!\n");
    } catch (error) {
      console.error("❌ Cancellation failed:", error);
      console.log();
    }
  } catch (error) {
    console.error("❌ Order placement failed:", error);
    console.log();
  }

  // Test 5: Get health status
  console.log("5️⃣ Testing Health Status...");
  const healthStatus = client.getHealthStatus();
  console.log("✅ Health status retrieved:");
  console.log("   Healthy:", healthStatus.isHealthy);
  console.log("   Last check:", new Date(healthStatus.lastCheck).toLocaleString());
  console.log("   URL:", healthStatus.url);
  console.log();

  console.log("🎉 All tests completed!\n");
}

// Run the tests
testChefConnection().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
