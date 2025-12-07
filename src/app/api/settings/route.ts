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

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Key and value are required" }, { status: 400 });
    }

    // Upsert setting using the new composite unique constraint (tenant_id, key)
    await query(
      `INSERT INTO settings (tenant_id, key, value, value_type, updated_at)
       VALUES ($1, $2, $3, 'string', NOW())
       ON CONFLICT (tenant_id, key) 
       DO UPDATE SET value = $3, updated_at = NOW()`,
      [tenantId, key, value]
    );

    return NextResponse.json({ success: true, message: "Setting updated" });
  } catch (error) {
    console.error("Failed to update setting:", error);
    return NextResponse.json({ success: false, error: "Failed to update setting" }, { status: 500 });
  }
}
