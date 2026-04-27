import { WsChannel, getWsBase } from "@/lib/WsChannel";

export interface PermissionsUpdatedEvent {
  event: "permissions.updated";
  world_id: number;
}

export interface UnreadUpdatedEvent {
  event: "unread.updated";
  kind: "dm" | "room";
  id: number;
  unread: boolean;
}

export interface UserEventsChannelEventMap {
  [key: string]: unknown;
  "permissions.updated": PermissionsUpdatedEvent;
  "unread.updated": UnreadUpdatedEvent;
}

export function connectUserEventsChannel(): WsChannel<UserEventsChannelEventMap> {
  const wsBase = getWsBase();
  return WsChannel.connect<UserEventsChannelEventMap>(
    "user-events",
    (ticket) => `${wsBase}/ws/events/?ticket=${encodeURIComponent(ticket)}`
  );
}
