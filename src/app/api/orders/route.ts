import { NextRequest, NextResponse } from "next/server";
import { getRestaurantDB } from "@/lib/restaurant/database";
import { getMenuKB } from "@/lib/restaurant/menu-kb";
import { getChefAgentClient } from "@/lib/a2a/chef-client";
import type { Order as A2AOrder } from "@/lib/a2a/schema";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/orders
 * Fetch orders
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableId = searchParams.get("tableId");
    const orderId = searchParams.get("orderId");

    const db = getRestaurantDB();

    if (orderId) {
      const order = db.getOrder(orderId);
      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error: "Order not found",
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        order,
      });
    }

    if (tableId) {
      const orders = db.getOrdersByTable(tableId);
      return NextResponse.json({
        success: true,
        orders,
      });
    }

    const allOrders = db.getAllOrders();
    return NextResponse.json({
      success: true,
      orders: allOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Place a new order and send it to Chef Agent via A2A
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: tableId and items",
        },
        { status: 400 }
      );
    }

    const db = getRestaurantDB();
    const menuKB = getMenuKB();

    // Validate and calculate total
    let total = 0;
    for (const item of items) {
      const menuItem = menuKB.getItemById(item.itemId);
      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid item ID: ${item.itemId}`,
          },
          { status: 400 }
        );
      }
      total += menuItem.price * item.quantity;
    }

    // Create order locally
    const order = db.createOrder({
      tableId,
      items: items.map((item: any) => ({
        itemId: item.itemId,
        itemName: menuKB.getItemById(item.itemId)!.name,
        quantity: item.quantity,
        modifications: item.modifications,
        specialInstructions: item.specialInstructions,
      })),
      total,
      status: "pending",
      timestamp: new Date(),
    });

    // Prepare A2A order for Chef Agent
    const a2aOrder: A2AOrder = {
      orderId: uuidv4(),
      tableId,
      items: items.map((item: any) => ({
        itemId: item.itemId,
        itemName: menuKB.getItemById(item.itemId)!.name,
        quantity: item.quantity,
        modifications: item.modifications,
        specialInstructions: item.specialInstructions,
      })),
      timestamp: new Date().toISOString(),
      priority: "normal",
    };

    try {
      // Send order to Chef Agent via A2A protocol
      const chefClient = getChefAgentClient();
      const chefResponse = await chefClient.placeOrder(a2aOrder);

      // Update order with Chef's response
      db.updateOrder(order.id, {
        status: "sent_to_chef",
        chefOrderId: chefResponse.orderId,
        eta: chefResponse.eta,
      });

      return NextResponse.json({
        success: true,
        order: db.getOrder(order.id),
        chefStatus: chefResponse.status,
        eta: chefResponse.eta,
        message: `Order placed successfully! ETA: ${chefResponse.eta || "TBD"} minutes`,
      });
    } catch (chefError) {
      // Chef Agent unavailable - mark order as pending
      console.warn("Chef Agent unavailable:", chefError);
      db.updateOrder(order.id, {
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        order: db.getOrder(order.id),
        warning: "Order created but Chef Agent is currently unavailable. Order will be processed manually.",
      });
    }
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to place order",
      },
      { status: 500 }
    );
  }
}
