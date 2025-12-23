import { getCurrentUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // Get company if employer
    let company = null;
    if (user.role === "EMPLOYER_OWNER" && user.ownedCompanies.length > 0) {
      company = user.ownedCompanies[0];
    } else if (user.role === "EMPLOYER_STAFF" && user.companyMemberships.length > 0) {
      company = user.companyMemberships[0].company;
    }

    return successResponse({
      id: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      status: user.status,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      profile: user.jobseekerProfile,
      company,
    });
  } catch (error) {
    console.error("Get me error:", error);
    return unauthorizedResponse();
  }
}
