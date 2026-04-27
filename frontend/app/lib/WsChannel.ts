import { getStoredUser } from "@/stores/UserStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (payload: any) => void;
type Handler<TEventMap, K extends keyof TEventMap> = (payload: TEventMap[K]) => void;

const instances = new Map<string, WsChannel<Record<string, unknown>>>();

function getBackendBase(): string {
  const url = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getWsBase(): string {
  const httpBase = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  if (httpBase) {
    return httpBase.replace(/^http/i, "ws").replace(/\/$/, "");
  }
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}`;
}

async function fetchWsTicket(): Promise<string> {
  const accessToken = getStoredUser()?.accessToken;
  if (!accessToken) throw new Error("Not authenticated");

  const res = await fetch(`${getBackendBase()}/api/ws/ticket/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`WS ticket request failed: ${res.status}`);

  const { ticket } = (await res.json()) as { ticket: string };
  return ticket;
}

async function tryFetchWsTicket(): Promise<string | null> {
  const accessToken = getStoredUser()?.accessToken;
  if (!accessToken) return null;
  try {
    return await fetchWsTicket();
  } catch {
    return null;
  }
}

export class WsChannel<TEventMap extends Record<string, unknown>> {
  readonly channelKey: string;

  private ws: WebSocket | null = null;
  private readonly listeners = new Map<keyof TEventMap, Set<AnyHandler>>();
  private readonly urlBuilder: (ticket: string | null) => string;
  private readonly requiresAuth: boolean;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1_000;
  private closed = false;

  private constructor(
    channelKey: string,
    urlBuilder: (ticket: string | null) => string,
    requiresAuth: boolean
  ) {
    this.channelKey = channelKey;
    this.urlBuilder = urlBuilder;
    this.requiresAuth = requiresAuth;
    void this.openWithTicket();
  }

  /**
   * Returns the shared channel for `channelKey`, creating one if none exists.
   * The channel closes automatically when all subscriptions are removed.
   *
   * @param channelKey - Unique string identifying this channel (e.g. "world-room-42")
   * @param urlBuilder - Called with a fresh ticket; must return the full ws:// URL
   */
  static connect<TEventMap extends Record<string, unknown>>(
    channelKey: string,
    urlBuilder: (ticket: string) => string
  ): WsChannel<TEventMap>;
  /**
   * Variant for channels that allow unauthenticated connections.
   * If the user is logged in, their ticket is still included so the backend can
   * identify them; if not, `ticket` is `null` and the URL builder must handle that.
   */
  static connect<TEventMap extends Record<string, unknown>>(
    channelKey: string,
    urlBuilder: (ticket: string | null) => string,
    options: { requiresAuth: false }
  ): WsChannel<TEventMap>;
  static connect<TEventMap extends Record<string, unknown>>(
    channelKey: string,
    urlBuilder: (ticket: string | null) => string,
    options?: { requiresAuth?: boolean }
  ): WsChannel<TEventMap> {
    const existing = instances.get(channelKey);
    if (existing) return existing as WsChannel<TEventMap>;
    const requiresAuth = options?.requiresAuth !== false;
    const channel = new WsChannel<TEventMap>(channelKey, urlBuilder, requiresAuth);
    instances.set(channelKey, channel as WsChannel<Record<string, unknown>>);
    return channel;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /** Subscribe to a typed event. Returns an unsubscribe function. */
  subscribe<K extends keyof TEventMap>(event: K, handler: Handler<TEventMap, K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as AnyHandler);
    return () => this.unsubscribe(event, handler);
  }

  unsubscribe<K extends keyof TEventMap>(event: K, handler: Handler<TEventMap, K>): void {
    this.listeners.get(event)?.delete(handler as AnyHandler);
    this.destroyIfIdle();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private destroyIfIdle(): void {
    const hasListeners = [...this.listeners.values()].some((s) => s.size > 0);
    if (!hasListeners) this.destroy();
  }

  private destroy(): void {
    this.closed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    instances.delete(this.channelKey);
  }

  private async openWithTicket(): Promise<void> {
    if (this.closed) return;
    let ticket: string | null;
    if (this.requiresAuth) {
      try {
        ticket = await fetchWsTicket();
      } catch {
        this.scheduleReconnect();
        return;
      }
    } else {
      ticket = await tryFetchWsTicket();
    }
    if (this.closed) return;
    this.openWs(ticket);
  }

  private openWs(ticket: string | null): void {
    if (this.closed) return;
    const ws = new WebSocket(this.urlBuilder(ticket));
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectDelay = 1_000;
    };

    ws.onmessage = (ev) => {
      let data: unknown;
      try {
        data = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      if (typeof data !== "object" || data === null || !("event" in data)) return;
      const eventName = (data as Record<string, unknown>).event;
      if (typeof eventName !== "string") return;
      const handlers = this.listeners.get(eventName as keyof TEventMap);
      if (!handlers) return;
      for (const h of handlers) h(data);
    };

    ws.onclose = (ev) => {
      if (this.closed) return;
      if (ev.code === 4401) return; // authentication failed — do not retry
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);
      void this.openWithTicket();
    }, this.reconnectDelay);
  }
}
