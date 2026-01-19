import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Store active connections (in production, use Redis pub/sub)
const connections = new Map<string, ReadableStreamDefaultController>();

// Helper to broadcast to a user (internal use only, not exported from route)
function broadcastToUser(userId: string, notification: object) {
  const controller = connections.get(userId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
    } catch {
      connections.delete(userId);
    }
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Set up SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(userId, controller);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`: ping\n\n`);
        } catch {
          clearInterval(keepAlive);
          connections.delete(userId);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connections.delete(userId);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      connections.delete(userId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
