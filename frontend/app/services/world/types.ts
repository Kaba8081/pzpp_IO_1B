import type { World, WorldProfile } from "@/types/models";

export interface CreateWorldDto {
  name?: string | null;
  description?: string | null;
  profile_picture?: string | null;
}

export type UpdateWorldDto = CreateWorldDto;

export type { World, WorldProfile };
