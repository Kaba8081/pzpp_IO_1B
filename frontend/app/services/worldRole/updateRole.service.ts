import { apiRequest } from "@/api/apiRequest";
import type { WorldRole } from "@/types/models";
import type { UpdateRoleDto } from "./types";

export async function updateRole(
  worldId: number,
  roleId: number,
  data: UpdateRoleDto
): Promise<WorldRole> {
  return apiRequest<WorldRole, UpdateRoleDto>(`/api/forum/world/${worldId}/roles/${roleId}/`, {
    method: "PATCH",
    body: data,
    requiresAuth: true,
  });
}
