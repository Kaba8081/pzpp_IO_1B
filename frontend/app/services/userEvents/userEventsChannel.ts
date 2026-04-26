import { WsChannel } from "@/lib/WsChannel";

export interface PermissionsUpdatedEvent {
  event: "permissions.updated";
  world_id: number;
}

export interface UserEventsChannelEventMap {
  [key: string]: unknown;
  "permissions.updated": PermissionsUpdatedEvent;
}

export function connectUserEventsChannel(): WsChannel<UserEventsChannelEventMap> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const wsBase = backendUrl.replace(/^http/i, "ws").replace(/\/$/, "");
  return WsChannel.connect<UserEventsChannelEventMap>(
    "user-events",
    (ticket) => `${wsBase}/ws/events/?ticket=${encodeURIComponent(ticket)}`
  );
}
