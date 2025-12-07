import { NextRequest, NextResponse } from "next/server";
import { getOrder, getOrdersByTable, createOrder, updateOrder, getMenuItemById } from "@/lib/repository/restaurant";
import { query } from "@/lib/db/postgres";
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

    if (orderId) {
      const order = await getOrder(orderId);
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
      const orders = await getOrdersByTable(tableId);
      return NextResponse.json({
        success: true,
        orders,
      });
    }

    // Get all orders if no specific filter
    const allOrders = await query("SELECT * FROM orders ORDER BY created_at DESC", []);
    return NextResponse.json({
      success: true,
      orders: allOrders.rows,
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

    // Validate items and calculate total
    const orderItems = [];
    let total = 0;
    
    for (const item of items) {
      const menuItem = await getMenuItemById(item.itemId);
      if (!menuItem) {
        return NextResponse.json(
          { success: false, error: `Invalid item ID: ${item.itemId}` },
          { status: 400 }
        );
      }
      orderItems.push({
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        modifications: item.modifications,
        specialInstructions: item.specialInstructions,
      });
      total += parseFloat(menuItem.price) * item.quantity;
    }

    // Create order in database
    const order = await createOrder({ tableId, items: orderItems, total, status: "pending" });

    // Prepare A2A order for Chef Agent
    const a2aOrder: A2AOrder = {
      orderId: uuidv4(),
      tableId,
      items: orderItems,
      timestamp: new Date().toISOString(),
      priority: "normal",
    };

    try {
      // Send order to Chef Agent via A2A protocol
      const chefClient = getChefAgentClient();
      const chefResponse = await chefClient.placeOrder(a2aOrder);

      // Update order with Chef's response
      const updatedOrder = await updateOrder(order.id, {
        status: "sent_to_chef",
        chefOrderId: chefResponse.orderId,
        eta: chefResponse.eta,
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        chefStatus: chefResponse.status,
        eta: chefResponse.eta,
        message: `Order placed successfully! ETA: ${chefResponse.eta || "TBD"} minutes`,
      });
    } catch (chefError) {
      // Chef Agent unavailable - mark order as pending
      console.warn("Chef Agent unavailable:", chefError);
      const pendingOrder = await updateOrder(order.id, {
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        order: pendingOrder,
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

/**
 * PATCH /api/orders
 * Modify an existing order
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, status } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing orderId",
        },
        { status: 400 }
      );
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Update order
    const updates: any = {};
    
    if (status) {
      updates.status = status;
    }

    if (items) {
      // Validate new items
      const validatedItems = [];
      let total = 0;
      
      for (const item of items) {
        const menuItem = await getMenuItemById(item.itemId);
        if (!menuItem) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid item ID: ${item.itemId}`,
            },
            { status: 400 }
          );
        }
        validatedItems.push({
          itemId: item.itemId,
          itemName: menuItem.name,
          quantity: item.quantity,
          modifications: item.modifications,
          specialInstructions: item.specialInstructions,
        });
        total += parseFloat(menuItem.price) * item.quantity;
      }
      
      updates.items = validatedItems;
      updates.total = total;
    }

    const updatedOrder = await updateOrder(orderId, updates);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders
 * Cancel an order and notify Chef Agent
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing orderId",
        },
        { status: 400 }
      );
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Try to notify Chef Agent about cancellation
    if (order.chefOrderId) {
      try {
        const chefClient = getChefAgentClient();
        await chefClient.cancelOrder(order.chefOrderId);
        console.log(`✅ Chef Agent notified about order cancellation: ${order.chefOrderId}`);
      } catch (chefError) {
        console.warn("⚠️ Could not notify Chef Agent about cancellation:", chefError);
        // Continue with cancellation even if Chef notification fails
      }
    }

    // Update order status to cancelled
    const cancelledOrder = await updateOrder(orderId, { status: "cancelled" });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel order",
      },
      { status: 500 }
    );
  }
}

