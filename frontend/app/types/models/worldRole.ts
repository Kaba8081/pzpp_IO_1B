import type { ISODateTime } from "./common";

export interface WorldRole {
  id: number;
  world_id: number;
  name: string;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
}
