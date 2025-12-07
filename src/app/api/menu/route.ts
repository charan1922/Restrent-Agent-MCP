import { NextRequest, NextResponse } from "next/server";
import {
  getAllMenuItems,
  searchMenuByName,
  getMenuByCategory,
  getVegetarianItems,
  getVeganItems,
} from "@/lib/repository/restaurant";

/**
 * GET /api/menu
 * Fetch menu items with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const vegetarian = searchParams.get("vegetarian") === "true";
    const vegan = searchParams.get("vegan") === "true";
    const search = searchParams.get("search");

    let items;

    // Apply filters
    if (search) {
      items = await searchMenuByName(search);
    } else if (category) {
      items = await getMenuByCategory(category);
    } else if (vegetarian) {
      items = await getVegetarianItems();
    } else if (vegan) {
      items = await getVeganItems();
    } else {
      items = await getAllMenuItems();
    }

    // Format items (convert decimal price to number)
    const formattedItems = items.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
    }));

    return NextResponse.json({
      success: true,
      items: formattedItems,
      count: formattedItems.length,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch menu",
      },
      { status: 500 }
    );
  }
}
