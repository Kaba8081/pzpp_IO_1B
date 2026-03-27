import type { ISODateTime } from "./common";

export interface WorldRoomMessage {
  id: number;
  user_profile_id: number;
  room_id: number;
  content: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}
