import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateSuperAdminToken, verifySuperAdminToken, initializeSuperAdmin } from '@/lib/superadmin-auth';

// POST /api/superadmin/auth - Super admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Initialize default super admin if needed
    await initializeSuperAdmin();

    // Find super admin
    const admin = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.superAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateSuperAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: (admin.permissions as Record<string, boolean>) || {},
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/superadmin/auth - Verify token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { valid, payload, error } = verifySuperAdminToken(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { error: error || 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify admin still exists and is active
    const admin = await prisma.superAdmin.findUnique({
      where: { id: payload.adminId },
      select: { id: true, isActive: true, email: true, name: true, role: true, avatar: true },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Account not found or disabled' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Auth] Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
