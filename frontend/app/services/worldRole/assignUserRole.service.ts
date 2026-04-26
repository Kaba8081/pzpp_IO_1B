import { apiRequest } from "@/api/apiRequest";
import type { UserRoleAssignment } from "./getUserRoles.service";

export async function assignUserRole(
  worldId: number,
  userId: number,
  roleId: number
): Promise<UserRoleAssignment> {
  return apiRequest<UserRoleAssignment>(`/api/forum/world/${worldId}/members/${userId}/roles/`, {
    method: "POST",
    requiresAuth: true,
    body: { role_id: roleId },
  });
}
