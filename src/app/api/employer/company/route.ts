import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/employer/company - Get company profile
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const company = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// PATCH /api/employer/company - Update company profile
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Map frontend fields to database fields
    const {
      name,
      tagline,
      industry,
      companySize,
      founded,
      website,
      email,
      phone,
      location,
      about,
      mission,
      vision,
      culture,
      benefits,
      socialLinks,
      customDomain,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.description = tagline;
    if (industry !== undefined) updateData.industry = industry;
    if (companySize !== undefined) updateData.size = companySize;
    if (founded !== undefined) updateData.foundedYear = founded ? parseInt(founded, 10) : null;
    if (website !== undefined) updateData.website = website;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.address = location;
    if (about !== undefined) updateData.culture = about; // Using culture field for about text
    if (mission !== undefined) updateData.mission = mission;
    if (vision !== undefined) updateData.vision = vision;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (customDomain !== undefined) updateData.customDomain = customDomain || null;

    // Handle social links
    if (socialLinks) {
      if (socialLinks.linkedin !== undefined) updateData.linkedinUrl = socialLinks.linkedin;
      if (socialLinks.facebook !== undefined) updateData.facebookUrl = socialLinks.facebook;
    }

    const company = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    // Return company with frontend-friendly field names
    const response = {
      company: {
        id: company.id,
        name: company.name,
        tagline: company.description || '',
        industry: company.industry || '',
        companySize: company.size || '',
        founded: company.foundedYear?.toString() || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        location: company.address || '',
        about: company.culture || '',
        mission: company.mission || '',
        vision: company.vision || '',
        culture: [], // Note: Culture values are separate from company culture text
        benefits: company.benefits || [],
        socialLinks: {
          linkedin: company.linkedinUrl || '',
          facebook: company.facebookUrl || '',
        },
        customDomain: company.customDomain || '',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
