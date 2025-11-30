import { NextRequest, NextResponse } from "next/server";

/**
 * GET /.well-known/agent-card.json
 * Serves the A2A Agent Card for the Waiter Agent
 */
export async function GET(request: NextRequest) {
  try {
    // Dynamically set the URL based on the request
    const host = request.headers.get("host") || "localhost:4000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    const agentCard = {
      name: "Restaurant Waiter Agent",
      description: "AI-powered restaurant waiter that handles reservations, menu queries, orders, and payments. Communicates with Chef Agent via A2A protocol for kitchen operations.",
      protocolVersion: "0.3.0",
      version: "1.0.0",
      url: `${protocol}://${host}`,
      skills: [
        {
          id: "reservations",
          name: "Reservation Management",
          description: "Create, check, and manage table reservations with automatic table assignment",
          tags: ["reservations", "booking", "tables"],
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["create", "check_availability", "cancel"] },
              guestName: { type: "string" },
              partySize: { type: "number" },
              dateTime: { type: "string", format: "date-time" },
              contactInfo: { type: "string" },
              specialRequests: { type: "string" },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              reservation: { type: "object" },
              availableTables: { type: "array" },
              message: { type: "string" },
            },
          },
        },
        {
          id: "menu-query",
          name: "Menu Information",
          description: "Search menu items with filtering by category, dietary preferences, and allergens. Returns item IDs required for ordering.",
          tags: ["menu", "food", "allergens", "dietary", "vegetarian", "vegan"],
          inputSchema: {
            type: "object",
            properties: {
              search: { type: "string" },
              category: { type: "string", enum: ["appetizers", "mains", "breads", "beverages", "desserts"] },
              vegetarian: { type: "boolean" },
              vegan: { type: "boolean" },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    price: { type: "number" },
                    description: { type: "string" },
                    category: { type: "string" },
                    isVegetarian: { type: "boolean" },
                    isVegan: { type: "boolean" },
                    allergens: { type: "array" },
                    spiceLevel: { type: "number" },
                  },
                },
              },
            },
          },
        },
        {
          id: "order-placement",
          name: "Order Management",
          description: "Take customer orders and send to Chef Agent via A2A protocol. Supports order modification and cancellation.",
          tags: ["orders", "kitchen", "chef-communication", "a2a"],
          inputSchema: {
            type: "object",
            properties: {
              tableId: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itemId: { type: "string" },
                    quantity: { type: "number" },
                    modifications: { type: "array", items: { type: "string" } },
                    specialInstructions: { type: "string" },
                  },
                },
              },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              order: { type: "object" },
              chefStatus: { type: "string" },
              eta: { type: "number" },
              message: { type: "string" },
            },
          },
        },
        {
          id: "payment-processing",
          name: "Billing & Payment",
          description: "Generate itemized bills with GST (18%), process payments, and provide detailed receipts",
          tags: ["payment", "billing", "receipt", "gst", "tax"],
          inputSchema: {
            type: "object",
            properties: {
              orderId: { type: "string" },
              method: { type: "string", enum: ["cash", "credit", "debit", "upi"] },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              payment: { type: "object" },
              receipt: {
                type: "object",
                properties: {
                  restaurantName: { type: "string" },
                  paymentId: { type: "string" },
                  orderId: { type: "string" },
                  items: { type: "array" },
                  subtotal: { type: "number" },
                  tax: { type: "number" },
                  total: { type: "number" },
                  currency: { type: "string" },
                },
              },
            },
          },
        },
        {
          id: "chat",
          name: "Guest Interaction",
          description: "Natural language conversational interface powered by Gemini 2.0 Flash for guest engagement and service",
          tags: ["chat", "conversation", "service", "ai", "gemini"],
          inputSchema: {
            type: "object",
            properties: {
              messages: { type: "array" },
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              response: { type: "string" },
              toolCalls: { type: "array" },
            },
          },
        },
      ],
      authentication: {
        type: "none",
        description: "No authentication required for public restaurant services",
      },
      capabilities: {
        streaming: true,
        tools: true,
        multimodal: false,
        a2a: true,
        async: true,
      },
      integrations: {
        chefAgent: {
          protocol: "A2A",
          url: "http://localhost:5000",
          description: "Communicates with Chef Agent for order fulfillment, inventory status, and ETA calculations",
          messageTypes: ["PLACE_ORDER", "REQUEST_STATUS", "CANCEL_ORDER"],
        },
      },
      metadata: {
        restaurant: "Indian Restaurant",
        cuisineType: "Indian",
        serviceType: "Full-Service Restaurant",
        location: "Virtual",
        currency: "INR",
        taxRate: 0.18,
        features: [
          "Multi-lingual support",
          "Allergy awareness",
          "Real-time order tracking",
          "A2A Chef integration",
          "Dietary filtering (vegetarian, vegan)",
          "GST-compliant billing",
          "Table management (7 tables, capacity 2-8)",
          "Order modification and cancellation",
        ],
        aiModel: "Google Gemini 2.0 Flash",
        framework: "Next.js 16 + Vercel AI SDK",
      },
      endpoints: {
        chat: "/api/chat",
        menu: "/api/menu",
        reservations: "/api/reservations",
        orders: "/api/orders",
        payments: "/api/payments",
        agentCard: "/.well-known/agent-card.json",
      },
    };

    return NextResponse.json(agentCard, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving agent card:", error);
    return NextResponse.json(
      { error: "Agent card not found" },
      { status: 404 }
    );
  }
}

