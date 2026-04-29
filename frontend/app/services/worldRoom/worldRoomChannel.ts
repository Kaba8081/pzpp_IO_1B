import { WsChannel, getWsBase } from "@/lib/WsChannel";
import type { WorldRoomMessageWithAuthor } from "@/types/models";

export interface RoomMessageCreatedEvent {
  event: "room.message.created";
  room_id: number;
  message: WorldRoomMessageWithAuthor;
}

export interface RoomMessageDeletedEvent {
  event: "room.message.deleted";
  room_id: number;
  message_id: number;
}

export interface WorldRoomChannelEventMap {
  [key: string]: unknown;
  "room.message.created": RoomMessageCreatedEvent;
  "room.message.deleted": RoomMessageDeletedEvent;
}

export function connectWorldRoomChannel(roomId: number): WsChannel<WorldRoomChannelEventMap> {
  const wsBase = getWsBase();
  return WsChannel.connect<WorldRoomChannelEventMap>(
    `world-room-${roomId}`,
    (ticket) => {
      const base = `${wsBase}/ws/forum/rooms/${roomId}/messages/`;
      return ticket ? `${base}?ticket=${encodeURIComponent(ticket)}` : base;
    },
    { requiresAuth: false }
  );
}
