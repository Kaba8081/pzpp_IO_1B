import type { ISODateTime } from "./common";
import type { WorldUserProfile } from "./worldUserProfile";

export interface WorldRoomMessage {
  id: number;
  user_profile: number;
  room: number;
  content: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}

export interface WorldRoomMessageWithAuthor extends WorldRoomMessage {
  author: Pick<WorldUserProfile, "id" | "name" | "avatar" | "user_id">;
}
