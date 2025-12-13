import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/repository/auth";
import { getCurrentTenantCookieName } from "@/lib/utils/auth-cookies";
import { getTenantId } from "@/lib/utils/tenant";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password } = await request.json();

    // Validate input
    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
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

    // Register user
    const { user, token } = await registerUser(tenantId, name, phone, password);

    // Set cookie
    const response = NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie with token (tenant-specific name)
    response.cookies.set(getCurrentTenantCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle duplicate phone number
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Phone number already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
}
