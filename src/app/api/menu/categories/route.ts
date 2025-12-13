import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/repository/restaurant";
import { getTenantId } from "@/lib/utils/tenant";

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const categories = await repo.getMenuCategories(tenantId);
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const { name, displayOrder } = await request.json();
    
    if (!name) {
      return NextResponse.json({ success: false, error: "Category name required" }, { status: 400 });
    }

    const category = await repo.createMenuCategory(tenantId, name, displayOrder);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
