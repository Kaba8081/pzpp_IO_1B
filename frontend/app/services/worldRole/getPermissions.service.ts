import { apiRequest } from "@/api/apiRequest";
import type { WorldRolePermission } from "@/types/models";

export async function getPermissions(): Promise<WorldRolePermission[]> {
  return apiRequest<WorldRolePermission[]>("/api/forum/world/permissions/", {
    requiresAuth: true,
  });
}
