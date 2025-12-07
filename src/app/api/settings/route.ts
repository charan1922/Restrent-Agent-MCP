import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";

export async function GET(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const result = await query(
      "SELECT key, value FROM settings WHERE tenant_id = $1",
      [tenantId]
    );

    const settings: Record<string, any> = {};
    result.rows.forEach((row: any) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant ID missing" }, { status: 500 });
    }

    const { key, value } = await request.json();
    
    if (!key) {
      return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 });
    }

    // Allow empty values (for clearing settings)
    const settingValue = value === undefined || value === null ? "" : String(value);

    // Upsert setting
    const result = await query(
      `INSERT INTO settings (id, tenant_id, key, value, value_type, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (tenant_id, key) 
       DO UPDATE SET value = $4, updated_at = NOW()
       RETURNING *`,
      [`set-${Date.now()}`, tenantId, key, settingValue, "string"]
    );

    return NextResponse.json({ success: true, setting: result.rows[0] });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update setting" }, { status: 500 });
  }
}
