import type { ISODateTime } from "./common";

export interface World {
  id: number;
  owner_id: number;
  name: string | null;
  description: string | null;
  profile_picture: string | null;
  distinct_user_count: number;
  total_user_profiles_count: number;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}
