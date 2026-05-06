import { apiRequest } from "@/api/apiRequest";
import type { WorldRole } from "@/types/models";

export async function getRoles(worldId: number): Promise<WorldRole[]> {
  return apiRequest<WorldRole[]>(`/api/forum/world/${worldId}/roles/`, {
    requiresAuth: true,
  });
}
