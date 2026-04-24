import type { ISODateTime } from "./common";

export interface WorldRoom {
  id: number;
  world_id: number;
  name: string | null;
  description: string | null;
  thumbnail: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}

export type Channel = WorldRoom;
