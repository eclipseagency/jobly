import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin token
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; email: string };
    const admin = await prisma.superAdmin.findUnique({
      where: { id: decoded.adminId },
    });
    return admin;
  } catch {
    return null;
  }
}

// GET /api/admin/tenants - List all tenants/companies
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isVerified: true,
        logo: true,
        industry: true,
        city: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}
