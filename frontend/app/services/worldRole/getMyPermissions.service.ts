import { apiRequest } from "@/api/apiRequest";

export async function getMyPermissions(worldId: number): Promise<string[]> {
  const data = await apiRequest<{ permissions: string[] }>(
    `/api/forum/world/${worldId}/my-permissions/`,
    { requiresAuth: true }
  );
  return data.permissions;
}
