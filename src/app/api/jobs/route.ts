import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { JobStatus } from "@prisma/client";

// GET /api/jobs - List published jobs (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const province = searchParams.get("province");
    const employmentType = searchParams.get("employmentType");

    const where = {
      status: JobStatus.PUBLISHED,
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }),
      ...(category && { category }),
      ...(city && { city }),
      ...(province && { province }),
      ...(employmentType && { employmentType: employmentType as never }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              city: true,
              province: true,
              verificationStatus: true,
            },
          },
          skills: {
            include: { skill: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return successResponse({
      items: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("List jobs error:", error);
    return errorResponse("Failed to fetch jobs", 500);
  }
}

// POST /api/jobs - Create new job (employer only)
const createJobSchema = z.object({
  title: z.string().min(3).max(200),
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
  skills: z.array(z.string()).optional(),
  screeningQuestions: z.array(z.object({
    question: z.string(),
    type: z.enum(["YES_NO", "TEXT", "MULTIPLE_CHOICE"]),
    options: z.array(z.string()).optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (!["EMPLOYER_OWNER", "EMPLOYER_STAFF"].includes(session.role)) {
      return errorResponse("Only employers can create jobs", 403);
    }

    const body = await request.json();
    const result = createJobSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    // Get company
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

    const { skills, screeningQuestions, ...jobData } = result.data;

    // Create job with skills and screening questions
    const job = await prisma.job.create({
      data: {
        ...jobData,
        companyId: company.id,
        createdByUserId: session.id,
        ...(skills && skills.length > 0 && {
          skills: {
            create: await Promise.all(
              skills.map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                  where: { name: skillName },
                  update: {},
                  create: { name: skillName },
                });
                return { skillId: skill.id };
              })
            ),
          },
        }),
        ...(screeningQuestions && screeningQuestions.length > 0 && {
          screeningQuestions: {
            create: screeningQuestions.map((q) => ({
              question: q.question,
              type: q.type,
              options: q.options || [],
            })),
          },
        }),
      },
      include: {
        company: { select: { id: true, name: true } },
        skills: { include: { skill: true } },
        screeningQuestions: true,
      },
    });

    return successResponse(job, 201);
  } catch (error) {
    console.error("Create job error:", error);
    return errorResponse("Failed to create job", 500);
  }
}
