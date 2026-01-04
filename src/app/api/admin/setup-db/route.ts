import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Secret key to prevent unauthorized access
const SETUP_SECRET = 'jobly-setup-2024';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to run prisma db push
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
      env: { ...process.env },
      timeout: 60000,
    });

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      stdout,
      stderr,
    });
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    return NextResponse.json({
      success: false,
      error: err.message,
      stdout: err.stdout,
      stderr: err.stderr,
    }, { status: 500 });
  }
}

export async function GET() {
  // Check database status
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Try to query the database
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    await prisma.$disconnect();

    return NextResponse.json({
      connected: true,
      tables,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      connected: false,
      error: err.message,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
    }, { status: 500 });
  }
}
