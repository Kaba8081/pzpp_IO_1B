import { apiRequest } from "@/api/apiRequest";

export async function removeUserRole(
  worldId: number,
  userId: number,
  roleId: number
): Promise<void> {
  return apiRequest<void>(`/api/forum/world/${worldId}/members/${userId}/roles/${roleId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}
