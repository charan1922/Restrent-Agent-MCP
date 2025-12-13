import { NextRequest, NextResponse } from "next/server";

/**
 * GET /.well-known/chef-agent-card.json
 * Serves the A2A Agent Card for the Chef Agent
 */
export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get("host") || "localhost:4444";
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    const chefAgentCard = {
      name: "Restaurant Chef Agent",
      description: "AI-powered kitchen operations agent managing inventory, order fulfillment, ETA calculation, and cost tracking. Receives orders from Waiter Agent via A2A protocol.",
      protocolVersion: "0.3.0",
      version: "1.0.0",
      url: `${protocol}://${host}/api/chef`,
      skills: [
        {
          id: "order-processing",
          name: "Order Processing",
          description: "Receive and process orders from Waiter Agent, validate ingredient availability, calculate ETA",
          tags: ["orders", "kitchen", "fulfillment", "a2a"],
          inputSchema: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["PLACE_ORDER", "REQUEST_STATUS", "CANCEL_ORDER"] },
              payload: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  tableId: { type: "string" },
                  items: { type: "array" },
                  timestamp: { type: "string", format: "date-time" },
                  priority: { type: "string", enum: ["normal", "high", "urgent"] },
                },
              },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string" },
                  status: { type: "string", enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "CANCELLED"] },
                  eta: { type: "number", description: "Estimated time in minutes" },
                  missingIngredients: { type: "array", items: { type: "string" } },
                  message: { type: "string" },
                },
              },
              error: { type: "string" },
            },
          },
        },
        {
          id: "inventory-management",
          name: "Inventory Management",
          description: "Track ingredient stock levels, auto-deduct on order fulfillment, trigger procurement when low",
          tags: ["inventory", "stock", "ingredients", "procurement"],
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["check_stock", "deduct_stock", "restock"] },
              ingredientId: { type: "string" },
              quantity: { type: "number" },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              currentStock: { type: "number" },
              reorderNeeded: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
        {
          id: "cost-calculation",
          name: "Cost Analysis (COGS)",
          description: "Calculate Cost of Goods Sold for orders based on ingredient costs and quantities",
          tags: ["cogs", "cost", "pricing", "analytics"],
          inputSchema: {
            type: "object",
            properties: {
              orderId: { type: "string" },
              items: { type: "array" },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              totalCOGS: { type: "number" },
              itemBreakdown: { type: "array" },
              profitMargin: { type: "number" },
            },
          },
        },
      ],
      authentication: {
        type: "none",
        description: "Internal agent - no authentication required",
      },
      capabilities: {
        streaming: false,
        tools: true,
        multimodal: false,
        a2a: true,
        async: true,
      },
      integrations: {
        waiterAgent: {
          protocol: "A2A",
          url: `${protocol}://${host}`,
          description: "Receives orders and status requests from Waiter Agent",
          messageTypes: ["PLACE_ORDER", "REQUEST_STATUS", "CANCEL_ORDER"],
        },
        database: {
          type: "PostgreSQL",
          tables: ["ingredients", "recipes", "chef_orders", "purchase_orders", "inventory_transactions"],
        },
      },
      metadata: {
        agentType: "Backend Operations",
        responsibilities: [
          "Inventory management with auto-deduction",
          "Recipe-based ingredient tracking",
          "ETA calculation based on dish complexity",
          "Cost of Goods Sold (COGS) tracking",
          "Automatic procurement trigger",
          "Multi-tenant support",
        ],
        features: [
          "Real-time stock tracking",
          "Low-stock alerts",
          "Recipe database integration",
          "COGS per order/dish",
          "Multi-tenant inventory isolation",
          "Audit trail (inventory transactions)",
        ],
        aiModel: "Rule-based + Analytics",
        framework: "Next.js 16 API Routes",
      },
      endpoints: {
        a2aMessages: "/api/chef/a2a",
        orders: "/api/chef/orders",
        inventory: "/api/chef/inventory",
        agentCard: "/.well-known/chef-agent-card.json",
      },
    };

    return NextResponse.json(chefAgentCard, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving Chef agent card:", error);
    return NextResponse.json(
      { error: "Chef agent card not found" },
      { status: 404 }
    );
  }
}
