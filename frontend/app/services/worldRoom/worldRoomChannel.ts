import { WsChannel } from "@/lib/WsChannel";
import type { WorldRoomMessageWithAuthor } from "@/types/models";

export interface RoomMessageCreatedEvent {
  event: "room.message.created";
  room_id: number;
  message: WorldRoomMessageWithAuthor;
}

export interface WorldRoomChannelEventMap {
  [key: string]: unknown;
  "room.message.created": RoomMessageCreatedEvent;
}

export function connectWorldRoomChannel(roomId: number): WsChannel<WorldRoomChannelEventMap> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const wsBase = backendUrl.replace(/^http/i, "ws").replace(/\/$/, "");
  return WsChannel.connect<WorldRoomChannelEventMap>(
    `world-room-${roomId}`,
    (ticket) => `${wsBase}/ws/forum/rooms/${roomId}/messages/?ticket=${encodeURIComponent(ticket)}`
  );
}
