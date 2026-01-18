import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface NotificationSettings {
  newApplications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  weeklySummary: boolean;
  marketingEmails: boolean;
}

const defaultNotificationSettings: NotificationSettings = {
  newApplications: true,
  applicationUpdates: true,
  interviewReminders: true,
  weeklySummary: false,
  marketingEmails: false,
};

// GET /api/employer/settings - Get employer settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [user, tenant] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          notificationSettings: true,
        },
      }),
      tenantId ? prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
        },
      }) : null,
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const notificationSettings = (user.notificationSettings as unknown as NotificationSettings) || defaultNotificationSettings;

    return NextResponse.json({
      settings: {
        email: user.email,
        phone: user.phone || '',
        companyName: tenant?.name || '',
        notifications: notificationSettings,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/employer/settings - Update employer settings
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, phone, companyName, notifications, currentPassword, newPassword } = body;

    // Update user settings
    const userUpdateData: Record<string, unknown> = {};

    if (email !== undefined) userUpdateData.email = email;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (notifications !== undefined) userUpdateData.notificationSettings = notifications;

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Validate new password strength
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Get current user to verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash the new password with bcrypt
      userUpdateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Update tenant name if provided
    if (companyName !== undefined && tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { name: companyName },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
