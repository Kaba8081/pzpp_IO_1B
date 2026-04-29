import { apiRequest } from "@/api/apiRequest";
import type { WorldRole } from "@/types/models";
import type { CreateRoleDto } from "./types";

export async function createRole(worldId: number, data: CreateRoleDto): Promise<WorldRole> {
  return apiRequest<WorldRole, CreateRoleDto>(`/api/forum/world/${worldId}/roles/`, {
    method: "POST",
    body: data,
    requiresAuth: true,
  });
}
