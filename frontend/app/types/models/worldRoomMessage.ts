import type { ISODateTime } from "./common";

export interface WorldRoomMessage {
  id: number;
  user_profile: number;
  room: number;
  content: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}
