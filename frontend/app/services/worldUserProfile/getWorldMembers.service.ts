import { apiRequest } from "@/api/apiRequest";
import type { WorldMember } from "@/types/models";

export async function getWorldMembers(worldId: number): Promise<WorldMember[]> {
  return apiRequest<WorldMember[]>(`/api/forum/profile/world/${worldId}/members`, {
    method: "GET",
    requiresAuth: true,
  });
}
