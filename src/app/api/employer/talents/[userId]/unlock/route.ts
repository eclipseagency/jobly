import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// POST /api/employer/talents/[userId]/unlock - Unlock a candidate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: jobseekerUserId } = await params;
    const session = await getSession();

    if (!session) return unauthorizedResponse();

    if (!["EMPLOYER_OWNER", "EMPLOYER_STAFF"].includes(session.role)) {
      return errorResponse("Only employers can unlock candidates", 403);
    }

    // Get employer's company
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        ownedCompanies: true,
        companyMemberships: { include: { company: true } },
      },
    });

    const company =
      user?.ownedCompanies[0] || user?.companyMemberships[0]?.company;

    if (!company) {
      return errorResponse("No company associated with user", 400);
    }

    // Check if jobseeker exists
    const jobseeker = await prisma.user.findUnique({
      where: { id: jobseekerUserId },
      include: { jobseekerProfile: true },
    });

    if (!jobseeker || jobseeker.role !== "JOBSEEKER") {
      return notFoundResponse("Candidate not found");
    }

    // Check if already unlocked
    const existingUnlock = await prisma.candidateUnlock.findUnique({
      where: {
        companyId_jobseekerUserId: {
          companyId: company.id,
          jobseekerUserId,
        },
      },
    });

    if (existingUnlock) {
      // Already unlocked, return profile info
      return successResponse({
        status: "ALREADY_UNLOCKED",
        unlockId: existingUnlock.id,
        creditsCharged: 0,
        candidate: {
          ...jobseeker.jobseekerProfile,
          phone: jobseeker.phone,
          email: jobseeker.email,
        },
      });
    }

    // Check credit wallet balance
    let wallet = await prisma.creditWallet.findUnique({
      where: { companyId: company.id },
    });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await prisma.creditWallet.create({
        data: { companyId: company.id, balance: 0 },
      });
    }

    if (wallet.balance < 1) {
      return errorResponse("Insufficient credits", 402);
    }

    // Perform unlock atomically using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credit
      await tx.creditWallet.update({
        where: { companyId: company.id },
        data: { balance: { decrement: 1 } },
      });

      // Create unlock record
      const unlock = await tx.candidateUnlock.create({
        data: {
          companyId: company.id,
          jobseekerUserId,
          unlockedByUserId: session.id,
          creditsSpent: 1,
        },
      });

      // Log in credit ledger
      await tx.creditLedger.create({
        data: {
          companyId: company.id,
          type: "UNLOCK_SPEND",
          amount: -1,
          referenceType: "UNLOCK",
          referenceId: unlock.id,
        },
      });

      return unlock;
    });

    return successResponse({
      status: "UNLOCKED",
      unlockId: result.id,
      creditsCharged: 1,
      candidate: {
        ...jobseeker.jobseekerProfile,
        phone: jobseeker.phone,
        email: jobseeker.email,
      },
    });
  } catch (error) {
    console.error("Unlock candidate error:", error);
    return errorResponse("Failed to unlock candidate", 500);
  }
}
