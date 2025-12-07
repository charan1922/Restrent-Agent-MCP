import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/repository/restaurant";

export async function GET(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const vegetarian = searchParams.get("vegetarian") === "true";
    const vegan = searchParams.get("vegan") === "true";
    const search = searchParams.get("search");

    let items;

    if (search) {
      items = await repo.searchMenuByName(tenantId, search);
    } else if (category) {
      items = await repo.getMenuByCategory(tenantId, category);
    } else if (vegetarian) {
      items = await repo.getVegetarianItems(tenantId);
    } else if (vegan) {
      items = await repo.getVeganItems(tenantId);
    } else {
      items = await repo.getAllMenuItems(tenantId);
    }

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
    return NextResponse.json({ success: false, error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const body = await request.json();
    const item = await repo.createMenuItem(tenantId, body);

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json({ success: false, error: "Failed to create menu item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 });
    }

    const item = await repo.updateMenuItem(tenantId, id, updates);

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json({ success: false, error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 });
    }

    await repo.deleteMenuItem(tenantId, id);

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json({ success: false, error: "Failed to delete menu item" }, { status: 500 });
  }
}
