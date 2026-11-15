import { menuEvents, SSEEvent } from "@/lib/events";

// GET /api/events — Server-Sent Events stream for real-time menu updates
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`)
      );

      const onEvent = (event: SSEEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      const unsubscribe = menuEvents.subscribe(onEvent);

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on abort
      const cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };

      // Store cleanup for when stream is cancelled
      (controller as unknown as Record<string, unknown>).__cleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as Record<string, unknown>).__cleanup as (() => void) | undefined;
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
