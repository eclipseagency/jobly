import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  verifyOtpHash,
  generateAccessToken,
  generateRefreshToken,
  hashOtp,
  setAuthCookies,
} from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { UserRole } from "@prisma/client";

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+63\d{10}$/, "Invalid Philippine phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  role: z.enum(["JOBSEEKER", "EMPLOYER_OWNER"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { phone, otp, role } = result.data;

    // Find valid OTP request
    const otpRequest = await prisma.otpRequest.findFirst({
      where: {
        phone,
        expiresAt: { gte: new Date() },
        attempts: { lt: 5 },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRequest) {
      return errorResponse("OTP expired or not found", 400);
    }

    // Verify OTP
    const isValid = await verifyOtpHash(otp, otpRequest.otpHash);

    if (!isValid) {
      // Increment attempts
      await prisma.otpRequest.update({
        where: { id: otpRequest.id },
        data: { attempts: { increment: 1 } },
      });
      return errorResponse("Invalid OTP", 400);
    }

    // Delete used OTP
    await prisma.otpRequest.delete({ where: { id: otpRequest.id } });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          role: (role as UserRole) || UserRole.JOBSEEKER,
          phoneVerifiedAt: new Date(),
        },
      });

      // Create jobseeker profile if role is JOBSEEKER
      if (user.role === UserRole.JOBSEEKER) {
        await prisma.jobseekerProfile.create({
          data: { userId: user.id },
        });
      }
    } else {
      // Update phone verification
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      id: user.id,
      role: user.role,
      phone: user.phone,
    });
    const refreshToken = await generateRefreshToken(user.id);

    // Store refresh token hash
    const refreshTokenHash = await hashOtp(refreshToken);
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      message: "Login successful",
      user: {
        id: user.id,
        role: user.role,
        phone: user.phone,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Failed to verify OTP", 500);
  }
}
