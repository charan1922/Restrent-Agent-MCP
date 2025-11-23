import { NextRequest, NextResponse } from "next/server";
import { getRestaurantDB } from "@/lib/restaurant/database";
import { getChefAgentClient } from "@/lib/a2a/chef-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    const db = getRestaurantDB();
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

    // If order has been sent to chef, get live status
    if (order.chefOrderId) {
      try {
        const chefClient = getChefAgentClient();
        const chefStatus = await chefClient.requestOrderStatus(order.chefOrderId);

        // Update local order with Chef's status
        db.updateOrder(orderId, {
          status: chefStatus.status.toLowerCase() === "ready" ? "ready" : "preparing",
          eta: chefStatus.eta,
        });

        return NextResponse.json({
          success: true,
          order: db.getOrder(orderId),
          chefStatus,
        });
      } catch (chefError) {
        console.warn("Could not get status from Chef Agent:", chefError);
        // Return local status if Chef unavailable
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order status",
      },
      { status: 500 }
    );
  }
}
