import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/repository/auth";
import { getCurrentTenantCookieName } from "@/lib/utils/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getCurrentTenantCookieName())?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await validateSession(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // CRITICAL: Check tenant isolation
    const currentTenantId = process.env.TENANT_ID;
    if (currentTenantId && user.tenant_id !== currentTenantId) {
      return NextResponse.json(
        { success: false, error: "Session belongs to different tenant" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
