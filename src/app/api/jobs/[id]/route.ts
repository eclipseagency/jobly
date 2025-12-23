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
import { JobStatus } from "@prisma/client";

// GET /api/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            sizeRange: true,
            city: true,
            province: true,
            website: true,
            verificationStatus: true,
          },
        },
        skills: { include: { skill: true } },
        screeningQuestions: true,
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return notFoundResponse("Job not found");
    }

    // Only show published jobs to public, or any job to company members
    const isCompanyMember = session && (
      await prisma.companyMember.findUnique({
        where: {
          companyId_userId: { companyId: job.companyId, userId: session.id },
        },
      }) ||
      await prisma.company.findFirst({
        where: { id: job.companyId, ownerUserId: session.id },
      })
    );

    if (job.status !== JobStatus.PUBLISHED && !isCompanyMember) {
      return notFoundResponse("Job not found");
    }

    // Check if current user has applied
    let hasApplied = false;
    if (session && session.role === "JOBSEEKER") {
      const application = await prisma.application.findUnique({
        where: {
          jobId_jobseekerUserId: { jobId: id, jobseekerUserId: session.id },
        },
      });
      hasApplied = !!application;
    }

    return successResponse({ ...job, hasApplied });
  } catch (error) {
    console.error("Get job error:", error);
    return errorResponse("Failed to fetch job", 500);
  }
}

// PATCH /api/jobs/[id] - Update job
const updateJobSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  category: z.string().optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "FREELANCE",
    "CONTRACT",
    "INTERNSHIP",
  ]).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      return notFoundResponse("Job not found");
    }

    // Check ownership
    const isOwner = job.company.ownerUserId === session.id;
    const isMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId: job.companyId, userId: session.id },
      },
    });

    if (!isOwner && !isMember) {
      return errorResponse("Not authorized to update this job", 403);
    }

    const body = await request.json();
    const result = updateJobSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const updateData = {
      ...result.data,
      ...(result.data.status === "PUBLISHED" && !job.publishedAt
        ? { publishedAt: new Date() }
        : {}),
    };

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        skills: { include: { skill: true } },
        screeningQuestions: true,
      },
    });

    return successResponse(updatedJob);
  } catch (error) {
    console.error("Update job error:", error);
    return errorResponse("Failed to update job", 500);
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      return notFoundResponse("Job not found");
    }

    // Only owner can delete
    if (job.company.ownerUserId !== session.id) {
      return errorResponse("Only company owner can delete jobs", 403);
    }

    await prisma.job.delete({ where: { id } });

    return successResponse({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    return errorResponse("Failed to delete job", 500);
  }
}
