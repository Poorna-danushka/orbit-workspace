type SessionEventName = 'session-ended' | 'session-refreshed' | 'session-started';

class SessionEventEmitter {
  private listeners = new Map<SessionEventName, Set<(payload?: unknown) => void>>();

  on(eventName: SessionEventName, listener: (payload?: unknown) => void): () => void {
    const set = this.listeners.get(eventName) ?? new Set();
    set.add(listener);
    this.listeners.set(eventName, set);
    return () => this.off(eventName, listener);
  }

  off(eventName: SessionEventName, listener: (payload?: unknown) => void): void {
    this.listeners.get(eventName)?.delete(listener);
  }

  emit(eventName: SessionEventName, payload?: unknown): void {
    this.listeners.get(eventName)?.forEach((listener) => listener(payload));
  }
}

export const sessionEvents = new SessionEventEmitter();
