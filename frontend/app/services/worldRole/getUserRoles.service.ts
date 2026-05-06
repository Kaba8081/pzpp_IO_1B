import { apiRequest } from "@/api/apiRequest";

export interface UserRoleAssignment {
  role_id: number;
  role_name: string;
}

export async function getUserRoles(worldId: number, userId: number): Promise<UserRoleAssignment[]> {
  return apiRequest<UserRoleAssignment[]>(`/api/forum/world/${worldId}/members/${userId}/roles/`, {
    requiresAuth: true,
  });
}
