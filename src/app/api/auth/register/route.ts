import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, companyName } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if employer role requires company name
    if (role === 'employer' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for employer accounts' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    let tenantId: string | undefined;
    let tenantName: string | undefined;

    // If employer, create a tenant (company) first
    if (role === 'employer') {
      // Create slug from company name
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if slug exists and add suffix if needed
      let finalSlug = slug;
      let slugSuffix = 1;
      while (await prisma.tenant.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${slugSuffix}`;
        slugSuffix++;
      }

      const tenant = await prisma.tenant.create({
        data: {
          name: companyName,
          slug: finalSlug,
          email: email.toLowerCase(),
        },
      });

      tenantId = tenant.id;
      tenantName = tenant.name;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: role === 'employer' ? 'EMPLOYER' : 'EMPLOYEE',
        tenantId,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: role === 'employer' ? 'employer' : 'employee',
        tenantId,
        tenantName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
