import type { ISODateTime } from "./common";

export interface WorldAttribute {
  id: number;
  world_id: number;
  name: string | null;
  slug: string | null;
  type: string | null;
  is_required: boolean;
  default_value: string | null;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
}
