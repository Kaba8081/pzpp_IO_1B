import { apiRequest } from "@/api/apiRequest";

export async function deleteRole(worldId: number, roleId: number): Promise<void> {
  return apiRequest<void>(`/api/forum/world/${worldId}/roles/${roleId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}
