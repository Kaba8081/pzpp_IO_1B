import { WsChannel, getWsBase } from "@/lib/WsChannel";
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
  const wsBase = getWsBase();
  return WsChannel.connect<WorldEventsChannelEventMap>(
    `world-events-${worldId}`,
    (ticket) => `${wsBase}/ws/forum/world/${worldId}/events/?ticket=${encodeURIComponent(ticket)}`
  );
}
