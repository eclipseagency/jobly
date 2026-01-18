import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '@/lib/auth';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user role matches requested role
    const isEmployer = user.role === 'EMPLOYER';
    const isEmployee = user.role === 'EMPLOYEE';

    if (role === 'employer' && !isEmployer) {
      return NextResponse.json(
        { error: 'This account is not registered as an employer' },
        { status: 401 }
      );
    }

    if (role === 'employee' && !isEmployee) {
      return NextResponse.json(
        { error: 'This account is not registered as a job seeker' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This account has been deactivated' },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate auth token
    const token = generateAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id,
    });

    // Return user data with token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: isEmployer ? 'employer' : 'employee',
        tenantId: user.tenant?.id,
        tenantName: user.tenant?.name,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
