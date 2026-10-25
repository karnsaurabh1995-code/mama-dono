import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

/**
 * REALTIME PLATFORM UPDATES (SERVER-SENT EVENTS)
 *
 * Allows open browser sessions across administrative and public tabs to receive
 * immediate notifications when site settings, team rosters, or homepage curation
 * are saved by an administrator, without requiring manual browser reloads or redeployment.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection handshake
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`)
      );

      // Subscribe to database changes
      const unsubscribe = db.subscribeUpdates((event, payload) => {
        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (err) {
          console.warn('[SSE] Failed to enqueue event:', err);
        }
      });

      // Periodic keep-alive ping (every 25 seconds)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream might already be closed
        }
      });
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
