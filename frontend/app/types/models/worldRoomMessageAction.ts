import type { ISODateTime } from "./common";

export interface WorldRoomMessageAction {
  id: number;
  message_id: number;
  attribute_id: number;
  user_profile_id: number;
  value: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}
