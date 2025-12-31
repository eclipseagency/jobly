import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/companies/[slug] - Get company by slug or ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try to find by slug first, then by ID
    let company = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!company) {
      // Try finding by ID
      company = await prisma.tenant.findUnique({
        where: { id: slug },
      });
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get active jobs for this company
    const jobs = await prisma.job.findMany({
      where: {
        tenantId: company.id,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        location: true,
        locationType: true,
        jobType: true,
        salary: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        logo: company.logo,
        coverImage: company.coverImage,
        website: company.website,
        industry: company.industry,
        size: company.size,
        foundedYear: company.foundedYear,
        city: company.city,
        country: company.country,
        email: company.email,
        phone: company.phone,
        linkedinUrl: company.linkedinUrl,
        facebookUrl: company.facebookUrl,
        twitterUrl: company.twitterUrl,
        mission: company.mission,
        vision: company.vision,
        culture: company.culture,
        benefits: company.benefits,
        isVerified: company.isVerified,
        jobCount: jobs.length,
      },
      jobs,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
