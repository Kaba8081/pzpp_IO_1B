import type { ISODateTime } from "./common";

export interface User {
  id: number;
  email: string;
  password: string;
  is_superuser: boolean;
  is_active: boolean;
  is_staff: boolean;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  description?: string;
  profile_picture?: string | null;
}
