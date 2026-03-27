import type { ISODateTime } from "./common";

export interface WorldUserHasRole {
  world_id: number;
  user_id: number;
  role_id: number;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
}
