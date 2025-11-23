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
      description: "AI-powered restaurant waiter that handles reservations, menu queries, orders, and payments. Communicates with Chef Agent via A2A protocol.",
      protocolVersion: "0.3.0",
      version: "1.0.0",
      url: `${protocol}://${host}`,
      skills: [
        {
          id: "reservations",
          name: "Reservation Management",
          description: "Create, check, and manage table reservations",
          tags: ["reservations", "booking", "tables"],
        },
        {
          id: "menu-query",
          name: "Menu Information",
          description: "Search menu items, check ingredients, allergens, and dietary information",
          tags: ["menu", "food", "allergens", "dietary"],
        },
        {
          id: "order-placement",
          name: "Order Management",
          description: "Take customer orders, send to kitchen via Chef Agent, track order status",
          tags: ["orders", "kitchen", "chef-communication"],
        },
        {
          id: "payment-processing",
          name: "Billing & Payment",
          description: "Generate bills, process payments, and provide receipts",
          tags: ["payment", "billing", "receipt"],
        },
        {
          id: "chat",
          name: "Guest Interaction",
          description: "Conversational interface for guest engagement and service",
          tags: ["chat", "conversation", "service"],
        },
      ],
      authentication: {
        type: "none",
      },
      capabilities: {
        streaming: true,
        tools: true,
        multimodal: false,
      },
      metadata: {
        restaurant: "Indian Restaurant",
        cuisineType: "Indian",
        serviceType: "Full-Service Restaurant",
        features: [
          "Multi-lingual support",
          "Allergy awareness",
          "Real-time order tracking",
          "A2A Chef integration",
        ],
      },
      endpoints: {
        chat: "/api/chat",
        menu: "/api/menu",
        reservations: "/api/reservations",
        orders: "/api/orders",
        payments: "/api/payments",
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

