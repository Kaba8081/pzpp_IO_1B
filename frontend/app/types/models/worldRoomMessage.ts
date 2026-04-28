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
  user_profile: Pick<WorldUserProfile, "id" | "name" | "username" | "avatar" | "user_id"> | null;
}

interface BaseMessage {
  id: number;
  user_profile: number | null;
  room: number;
  content: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}

interface TextMessage extends BaseMessage {
  message_type: "text";
}

interface MediaMessage extends BaseMessage {
  message_type: "media";
  media_message: WorldRoomMediaMessage;
}

interface SystemMessage extends BaseMessage {
  message_type: "system";
  system_message: WorldRoomSystemMessage;
}

export type MessageWithAuthor<T extends BaseMessage> = T & {
  author: Pick<WorldUserProfile, "id" | "name" | "username" | "avatar" | "user_id">;
};

export type WorldRoomMessage<T extends MessageType = MessageType> = T extends "text"
  ? TextMessage
  : T extends "media"
    ? MediaMessage
    : T extends "system"
      ? SystemMessage
      : never;

export type WorldRoomMessageWithAuthorOf<T extends MessageType = MessageType> = MessageWithAuthor<
  WorldRoomMessage<T>
>;

export type WorldRoomMessageWithAuthor = WorldRoomMessageWithAuthorOf<MessageType>;
