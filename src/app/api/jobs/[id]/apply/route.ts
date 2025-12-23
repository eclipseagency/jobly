import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { JobStatus, Prisma } from "@prisma/client";

const applySchema = z.object({
  coverLetter: z.string().optional(),
  screeningAnswers: z.record(z.string(), z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const session = await getSession();

    if (!session) return unauthorizedResponse();

    if (session.role !== "JOBSEEKER") {
      return errorResponse("Only jobseekers can apply for jobs", 403);
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { screeningQuestions: true },
    });

    if (!job || job.status !== JobStatus.PUBLISHED) {
      return notFoundResponse("Job not found or not accepting applications");
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_jobseekerUserId: { jobId, jobseekerUserId: session.id },
      },
    });

    if (existingApplication) {
      return errorResponse("You have already applied for this job", 400);
    }

    const body = await request.json();
    const result = applySchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        jobseekerUserId: session.id,
        companyId: job.companyId,
        coverLetter: result.data.coverLetter,
        screeningAnswers: (result.data.screeningAnswers || {}) as Prisma.InputJsonValue,
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    return successResponse(application, 201);
  } catch (error) {
    console.error("Apply for job error:", error);
    return errorResponse("Failed to submit application", 500);
  }
}
