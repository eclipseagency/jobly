import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET /api/employer/talents - Search talents (employers only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (!["EMPLOYER_OWNER", "EMPLOYER_STAFF"].includes(session.role)) {
      return errorResponse("Only employers can search talents", 403);
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const query = searchParams.get("query");
    const city = searchParams.get("city");
    const province = searchParams.get("province");
    const skills = searchParams.get("skills")?.split(",").filter(Boolean);

    // Build where clause
    const where = {
      visibilityStatus: "PUBLIC",
      ...(query && {
        OR: [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
          { headlineRole: { contains: query, mode: "insensitive" as const } },
          { summary: { contains: query, mode: "insensitive" as const } },
        ],
      }),
      ...(city && { city }),
      ...(province && { province }),
      ...(skills && skills.length > 0 && {
        skills: {
          some: {
            skill: { name: { in: skills } },
          },
        },
      }),
    };

    const [profiles, total] = await Promise.all([
      prisma.jobseekerProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, status: true },
          },
          skills: {
            include: { skill: true },
          },
          experiences: {
            orderBy: { startDate: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.jobseekerProfile.count({ where }),
    ]);

    // Get unlocked candidates for this company
    const unlockedIds = await prisma.candidateUnlock.findMany({
      where: { companyId: company.id },
      select: { jobseekerUserId: true },
    });
    const unlockedSet = new Set(unlockedIds.map((u) => u.jobseekerUserId));

    // Map profiles with unlock status (hide contact info if not unlocked)
    const talents = profiles.map((profile) => {
      const isUnlocked = unlockedSet.has(profile.userId);
      return {
        id: profile.id,
        userId: profile.userId,
        firstName: isUnlocked ? profile.firstName : profile.firstName?.[0] + "***",
        lastName: isUnlocked ? profile.lastName : profile.lastName?.[0] + "***",
        headlineRole: profile.headlineRole,
        summary: profile.summary,
        city: profile.city,
        province: profile.province,
        yearsExperience: profile.yearsExperience,
        profilePhotoUrl: profile.profilePhotoUrl,
        skills: profile.skills.map((s) => s.skill),
        latestExperience: profile.experiences[0] || null,
        isUnlocked,
      };
    });

    return successResponse({
      items: talents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search talents error:", error);
    return errorResponse("Failed to search talents", 500);
  }
}
