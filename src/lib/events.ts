// ─── Server-Sent Events (SSE) Event Emitter ───
// In-memory pub/sub for real-time menu updates (local fallback for Supabase Realtime)

type Listener = (data: SSEEvent) => void;

export interface SSEEvent {
  type: "item_updated" | "item_created" | "item_deleted" | "category_updated" | "reset_all";
  payload: Record<string, unknown>;
  timestamp: number;
}

class MenuEventEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: SSEEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error("SSE listener error:", e);
      }
    });
  }

  get listenerCount() {
    return this.listeners.size;
  }
}

// Singleton across hot reloads
const globalForEvents = globalThis as unknown as {
  menuEvents: MenuEventEmitter | undefined;
};

export const menuEvents =
  globalForEvents.menuEvents ?? new MenuEventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.menuEvents = menuEvents;
}
