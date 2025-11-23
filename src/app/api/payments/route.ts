import { NextRequest, NextResponse } from "next/server";
import { getRestaurantDB } from "@/lib/restaurant/database";

/**
 * POST /api/payments
 * Process a payment for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, method } = body;

    if (!orderId || !method) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: orderId and method",
        },
        { status: 400 }
      );
    }

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

    // Check if already paid
    const existingPayment = db.getPaymentByOrderId(orderId);
    if (existingPayment && existingPayment.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Order has already been paid",
        },
        { status: 400 }
      );
    }

    // Calculate tax (GST 18% for India)
    const TAX_RATE = 0.18;
    const subtotal = order.total;
    const tax = subtotal * TAX_RATE;
    const totalWithTax = subtotal + tax;

    // Create payment
    const payment = db.createPayment({
      orderId,
      amount: totalWithTax,
      method,
      status: "completed", // Simulated payment - always succeeds
      timestamp: new Date(),
    });

    // Update order status
    db.updateOrder(orderId, {
      status: "paid",
    });

    // Free up table
    db.updateTableStatus(order.tableId, "dirty"); // Needs cleaning

    return NextResponse.json({
      success: true,
      payment,
      message: `Payment of ₹${totalWithTax.toFixed(2)} processed successfully via ${method}`,
      receipt: {
        restaurantName: "Spice Garden Indian Restaurant",
        paymentId: payment.id,
        orderId: order.id,
        tableId: order.tableId,
        items: order.items,
        subtotal: subtotal,
        tax: tax,
        taxRate: TAX_RATE,
        total: totalWithTax,
        method: payment.method,
        timestamp: payment.timestamp,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments
 * Get payment information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    const db = getRestaurantDB();

    if (paymentId) {
      const payment = db.getPayment(paymentId);
      if (!payment) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment not found",
          },
          { status: 404 }
        );
      }

      const order = db.getOrder(payment.orderId);
      return NextResponse.json({
        success: true,
        payment,
        order,
      });
    }

    if (orderId) {
      const payment = db.getPaymentByOrderId(orderId);
      const order = db.getOrder(orderId);

      return NextResponse.json({
        success: true,
        payment,
        order,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Missing paymentId or orderId",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment",
      },
      { status: 500 }
    );
  }
}
