import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/repository/restaurant";

export async function GET(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    const tenantName = process.env.TENANT_NAME || "Restaurant";
    
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    // Fetch theme settings
    const themeColor = await repo.getSetting(tenantId, 'theme_color') || '#EA580C'; // Default orange
    
    return NextResponse.json({ 
      success: true, 
      theme: {
        primaryColor: themeColor,
        tenantName: tenantName
      }
    });
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch theme" }, { status: 500 });
  }
}
