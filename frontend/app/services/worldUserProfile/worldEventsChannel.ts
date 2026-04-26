import { WsChannel } from "@/lib/WsChannel";
import type { WorldMember } from "@/types/models";

export interface WorldProfileCreatedEvent {
  event: "world.profile.created";
  world_id: number;
  profile: WorldMember;
}

export interface WorldEventsChannelEventMap {
  [key: string]: unknown;
  "world.profile.created": WorldProfileCreatedEvent;
}

export function connectWorldEventsChannel(worldId: number): WsChannel<WorldEventsChannelEventMap> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const wsBase = backendUrl.replace(/^http/i, "ws").replace(/\/$/, "");
  return WsChannel.connect<WorldEventsChannelEventMap>(
    `world-events-${worldId}`,
    (ticket) => `${wsBase}/ws/forum/world/${worldId}/events/?ticket=${encodeURIComponent(ticket)}`
  );
}
