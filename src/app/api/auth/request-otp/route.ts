import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateOtp, hashOtp } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";

const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+63\d{10}$/, "Invalid Philippine phone number"),
  purpose: z.enum(["LOGIN", "REGISTER", "RESET_PASSWORD"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = requestOtpSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { phone, purpose } = result.data;

    // Rate limiting: Check for recent OTP requests
    const recentOtp = await prisma.otpRequest.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Last 60 seconds
        },
      },
    });

    if (recentOtp) {
      return errorResponse("Please wait before requesting another OTP", 429);
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    // Store OTP request
    await prisma.otpRequest.create({
      data: {
        phone,
        otpHash,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      },
    });

    // In production, send OTP via SMS (Twilio, Semaphore, etc.)
    // For development, log it
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return successResponse({
      message: "OTP sent successfully",
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return errorResponse("Failed to send OTP", 500);
  }
}
