import { NextRequest, NextResponse } from "next/server";
import { getMenuKB , } from "@/lib/restaurant/menu-kb";

/**
 * GET /api/menu
 * Fetch menu items with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const allergens = searchParams.get("allergens")?.split(",");
    const vegetarian = searchParams.get("vegetarian") === "true";
    const vegan = searchParams.get("vegan") === "true";
    const search = searchParams.get("search");

    const menuKB = getMenuKB();
    let items = menuKB.getAllItems();

    // Apply filters
    if (category) {
      items = menuKB.getItemsByCategory(category as any);
    }

    if (allergens && allergens.length > 0) {
      items = menuKB.safeForAllergens(allergens);
    }

    if (vegetarian) {
      items = items.filter((item) => item.isVegetarian);
    }

    if (vegan) {
      items = items.filter((item) => item.isVegan);
    }

    if (search) {
      items = menuKB.searchByName(search);
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
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
