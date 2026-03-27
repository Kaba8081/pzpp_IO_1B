import type { ISODateTime } from "./common";

export interface World {
  id: number;
  owner_id: number;
  name: string | null;
  description: string | null;
  profile_picture: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}
