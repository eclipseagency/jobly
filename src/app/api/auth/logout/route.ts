import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSession, clearAuthCookies, hashOtp } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (session && refreshToken) {
      // Invalidate refresh token
      const refreshTokenHash = await hashOtp(refreshToken);
      await prisma.userSession.deleteMany({
        where: {
          userId: session.id,
          refreshTokenHash,
        },
      });
    }

    // Clear cookies
    await clearAuthCookies();

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Failed to logout", 500);
  }
}
