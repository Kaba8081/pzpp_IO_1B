import type { ISODateTime } from "./common";

export interface WorldRolePermission {
  id: number;
  name: string;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
}
