import { WsChannel } from "@/lib/WsChannel";
import type { DirectMessage } from "@/types/models";

export interface DMMessageCreatedEvent {
  event: "dm.message.created";
  thread_id: number;
  message: DirectMessage;
}

export interface DMChannelEventMap {
  [key: string]: unknown;
  "dm.message.created": DMMessageCreatedEvent;
}

export function connectDMChannel(threadId: number): WsChannel<DMChannelEventMap> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const wsBase = backendUrl.replace(/^http/i, "ws").replace(/\/$/, "");
  return WsChannel.connect<DMChannelEventMap>(
    `dm-thread-${threadId}`,
    (ticket) => `${wsBase}/ws/dm/${threadId}/?ticket=${encodeURIComponent(ticket)}`
  );
}
