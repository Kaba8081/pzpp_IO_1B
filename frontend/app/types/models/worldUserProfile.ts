import type { ISODateTime } from "./common";

export interface WorldUserProfile {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}

export type WorldProfile = WorldUserProfile;
