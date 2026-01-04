import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Admin credentials - in production, these should be in environment variables
const ADMIN_USERNAME = 'joblyadmin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Jobly@admin441', 12);

// POST /api/admin/auth - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a simple admin token (in production, use JWT or proper session management)
    const adminToken = Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token: adminToken,
      admin: {
        username: ADMIN_USERNAME,
        role: 'super_admin',
      },
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin/auth - Verify admin token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [username] = decoded.split(':');

      if (username !== ADMIN_USERNAME) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        admin: {
          username: ADMIN_USERNAME,
          role: 'super_admin',
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
