import { NextRequest, NextResponse } from "next/server";
import { getRestaurantDB } from "@/lib/restaurant/database";

/**
 * GET /api/reservations
 * Fetch all reservations or check availability
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const partySize = searchParams.get("partySize");

    const db = getRestaurantDB();

    if (date) {
      const targetDate = new Date(date);
      const reservations = db.getReservationsByDate(targetDate);
      return NextResponse.json({
        success: true,
        reservations,
      });
    }

    if (partySize) {
      const size = parseInt(partySize);
      const availableTables = db.getAvailableTables(size);
      return NextResponse.json({
        success: true,
        availableTables,
        hasAvailability: availableTables.length > 0,
      });
    }

    const allReservations = db.getAllReservations();
    return NextResponse.json({
      success: true,
      reservations: allReservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reservations",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Create a new reservation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, partySize, dateTime, contactInfo, specialRequests } = body;

    if (!guestName || !partySize || !dateTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: guestName, partySize, dateTime",
        },
        { status: 400 }
      );
    }

    const db = getRestaurantDB();

    // Check availability
    const availableTables = db.getAvailableTables(partySize);

    if (availableTables.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No tables available for the requested party size",
        },
        { status: 400 }
      );
    }

    // Assign first available table
    const table = availableTables[0];

    // Create reservation
    const reservation = db.createReservation({
      guestName,
      partySize,
      dateTime: new Date(dateTime),
      tableId: table.id,
      status: "confirmed",
      contactInfo,
      specialRequests,
    });

    // Update table status
    db.updateTableStatus(table.id, "reserved");

    return NextResponse.json({
      success: true,
      reservation,
      message: `Reservation confirmed for ${guestName}, party of ${partySize} at table ${table.id}`,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reservation",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations
 * Update or cancel a reservation
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId, status } = body;

    if (!reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing reservationId",
        },
        { status: 400 }
      );
    }

    const db = getRestaurantDB();
    const reservation = db.getReservation(reservationId);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found",
        },
        { status: 404 }
      );
    }

    // Update reservation
    const updated = db.updateReservation(reservationId, { status });

    // If cancelled, free up the table
    if (status === "cancelled" && reservation.tableId) {
      db.updateTableStatus(reservation.tableId, "available");
    }

    return NextResponse.json({
      success: true,
      reservation: updated,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation",
      },
      { status: 500 }
    );
  }
}
