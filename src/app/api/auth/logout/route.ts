import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/repository/auth";
import { getCurrentTenantCookieName } from "@/lib/utils/auth-cookies";

export async function POST(request: NextRequest) {
  try {
    const cookieName = getCurrentTenantCookieName();
    const token = request.cookies.get(cookieName)?.value;

    if (token) {
      await logoutUser(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear tenant-specific cookie
    response.cookies.delete(cookieName);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
