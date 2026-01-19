import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const APP_NAME = 'Jobly';

// Generate a new TOTP secret
export function generateSecret(): string {
  return authenticator.generateSecret();
}

// Generate QR code data URL for authenticator app
export async function generateQRCode(email: string, secret: string): Promise<string> {
  const otpauth = authenticator.keyuri(email, APP_NAME, secret);
  return QRCode.toDataURL(otpauth);
}

// Verify TOTP token
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code);
  }
  return codes;
}

// Hash backup codes for storage
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(code => bcrypt.hash(code.toUpperCase(), 10)));
}

// Verify backup code
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<{ valid: boolean; index: number }> {
  const normalizedCode = code.toUpperCase().replace(/[- ]/g, '');

  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(normalizedCode, hashedCodes[i])) {
      return { valid: true, index: i };
    }
  }

  return { valid: false, index: -1 };
}

// 2FA Service functions
export const twoFactorService = {
  // Setup 2FA for a user
  async setup(userId: string, userType: 'user' | 'super_admin'): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    // Get user email
    let email: string;
    if (userType === 'super_admin') {
      const admin = await prisma.superAdmin.findUnique({ where: { id: userId } });
      if (!admin) throw new Error('Admin not found');
      email = admin.email;
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      email = user.email;
    }

    // Check if already has 2FA
    const existing = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (existing?.isEnabled) {
      throw new Error('2FA is already enabled');
    }

    // Generate new secret and backup codes
    const secret = generateSecret();
    const qrCode = await generateQRCode(email, secret);
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Store or update the 2FA record
    await prisma.twoFactorAuth.upsert({
      where: { userId },
      create: {
        userId,
        userType,
        secret,
        backupCodes: hashedBackupCodes,
        isEnabled: false,
      },
      update: {
        secret,
        backupCodes: hashedBackupCodes,
        isEnabled: false,
        verifiedAt: null,
      },
    });

    return { secret, qrCode, backupCodes };
  },

  // Verify and enable 2FA
  async verify(userId: string, token: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!twoFactor) {
      throw new Error('2FA not set up');
    }

    const isValid = verifyToken(token, twoFactor.secret);
    if (!isValid) {
      return false;
    }

    // Enable 2FA
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        isEnabled: true,
        verifiedAt: new Date(),
      },
    });

    return true;
  },

  // Validate 2FA token during login
  async validateLogin(userId: string, token: string): Promise<{ valid: boolean; usedBackupCode?: boolean }> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!twoFactor || !twoFactor.isEnabled) {
      return { valid: true }; // 2FA not enabled, allow login
    }

    // Try TOTP first
    if (verifyToken(token, twoFactor.secret)) {
      return { valid: true, usedBackupCode: false };
    }

    // Try backup codes
    const { valid, index } = await verifyBackupCode(token, twoFactor.backupCodes);
    if (valid) {
      // Remove used backup code
      const updatedCodes = [...twoFactor.backupCodes];
      updatedCodes[index] = ''; // Mark as used

      await prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes: updatedCodes,
          backupCodesUsed: twoFactor.backupCodesUsed + 1,
        },
      });

      return { valid: true, usedBackupCode: true };
    }

    return { valid: false };
  },

  // Check if 2FA is enabled for a user
  async isEnabled(userId: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    return twoFactor?.isEnabled ?? false;
  },

  // Disable 2FA
  async disable(userId: string, token: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!twoFactor || !twoFactor.isEnabled) {
      throw new Error('2FA is not enabled');
    }

    // Verify token before disabling
    const isValid = verifyToken(token, twoFactor.secret);
    if (!isValid) {
      return false;
    }

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        isEnabled: false,
      },
    });

    return true;
  },

  // Regenerate backup codes
  async regenerateBackupCodes(userId: string, token: string): Promise<string[] | null> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!twoFactor || !twoFactor.isEnabled) {
      throw new Error('2FA is not enabled');
    }

    // Verify token before regenerating
    const isValid = verifyToken(token, twoFactor.secret);
    if (!isValid) {
      return null;
    }

    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        backupCodes: hashedBackupCodes,
        backupCodesUsed: 0,
      },
    });

    return backupCodes;
  },

  // Get 2FA status
  async getStatus(userId: string): Promise<{
    isEnabled: boolean;
    backupCodesRemaining: number;
    verifiedAt: Date | null;
  } | null> {
    const twoFactor = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!twoFactor) {
      return null;
    }

    const backupCodesRemaining = twoFactor.backupCodes.filter(c => c !== '').length;

    return {
      isEnabled: twoFactor.isEnabled,
      backupCodesRemaining,
      verifiedAt: twoFactor.verifiedAt,
    };
  },
};

export default twoFactorService;
