import type { ISODateTime } from "./common";
import type { WorldUserProfile } from "./worldUserProfile";

export type MessageType = "text" | "media" | "system";

export interface WorldRoomMediaMessage {
  id: number;
  file: string;
  media_type: "image" | "video";
}

export interface WorldRoomSystemMessage {
  id: number;
  event_type: "user_joined" | "user_left";
}

export interface WorldRoomMessage {
  id: number;
  user_profile: number | null;
  room: number;
  content: string | null;
  message_type: MessageType;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
  media_message: WorldRoomMediaMessage | null;
  system_message: WorldRoomSystemMessage | null;
}

export interface WorldRoomMessageWithAuthor extends WorldRoomMessage {
  author: Pick<WorldUserProfile, "id" | "name" | "avatar" | "user_id">;
}
