import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/repository/auth";
import { getCurrentTenantCookieName } from "@/lib/utils/auth-cookies";
import { getTenantId } from "@/lib/utils/tenant";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Get tenant ID from headers (set by middleware) or environment
    const tenantId = getTenantId(request);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant configuration error" },
        { status: 500 }
      );
    }

    // Login user
    const result = await loginUser(tenantId, phone, password);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Invalid phone or password" },
        { status: 401 }
      );
    }

    const { user, token } = result;

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user,
    });

    // Set HTTP-only cookie with token (tenant-specific name)
    response.cookies.set(getCurrentTenantCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to login" },
      { status: 500 }
    );
  }
}
