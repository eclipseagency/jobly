import { NextRequest, NextResponse } from 'next/server';
import { twoFactorService } from '@/lib/two-factor';
import { auditActions } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET /api/auth/2fa - Get 2FA status
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userType = request.headers.get('x-user-type') || 'user';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await twoFactorService.getStatus(userId);

    return NextResponse.json({
      enabled: status?.isEnabled || false,
      backupCodesRemaining: status?.backupCodesRemaining || 0,
      verifiedAt: status?.verifiedAt,
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}

// POST /api/auth/2fa - Setup or verify 2FA
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email') || '';
    const userType = (request.headers.get('x-user-type') || 'user') as 'user' | 'super_admin';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, token } = body;

    if (action === 'setup') {
      // Generate new 2FA setup
      const result = await twoFactorService.setup(userId, userType);

      return NextResponse.json({
        success: true,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes,
        message: 'Scan the QR code with your authenticator app, then verify with a code',
      });
    }

    if (action === 'verify') {
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
      }

      const verified = await twoFactorService.verify(userId, token);

      if (verified) {
        // Log audit
        await auditActions.twoFactorEnabled(
          userType === 'super_admin' ? 'super_admin' : 'employee',
          userId,
          userEmail,
          request
        );

        return NextResponse.json({
          success: true,
          message: 'Two-factor authentication enabled successfully',
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }
    }

    if (action === 'validate') {
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
      }

      const result = await twoFactorService.validateLogin(userId, token);

      if (result.valid) {
        return NextResponse.json({
          success: true,
          usedBackupCode: result.usedBackupCode,
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid code' },
          { status: 400 }
        );
      }
    }

    if (action === 'regenerate-backup-codes') {
      if (!token) {
        return NextResponse.json({ error: 'Current 2FA code is required' }, { status: 400 });
      }

      const codes = await twoFactorService.regenerateBackupCodes(userId, token);

      if (codes) {
        return NextResponse.json({
          success: true,
          backupCodes: codes,
          message: 'New backup codes generated. Save them securely.',
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with 2FA:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to process 2FA request' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/2fa - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email') || '';
    const userType = (request.headers.get('x-user-type') || 'user') as 'user' | 'super_admin';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Current 2FA code is required' }, { status: 400 });
    }

    const disabled = await twoFactorService.disable(userId, token);

    if (disabled) {
      // Log audit
      await auditActions.twoFactorDisabled(
        userType === 'super_admin' ? 'super_admin' : 'employee',
        userId,
        userEmail,
        request
      );

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication disabled',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: String(error) || 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
