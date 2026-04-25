import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile, WorldUserProfileDto } from "./types";

export async function createWorldProfile(
  worldId: number,
  data: WorldUserProfileDto
): Promise<WorldUserProfile> {
  try {
    return await apiRequest<WorldUserProfile, WorldUserProfileDto>(
      `/api/forum/world/${worldId}/profiles`,
      {
        method: "POST",
        body: data,
        requiresAuth: true,
      }
    );
  } catch (error) {
    throw new Error(
      `Nie udało się utworzyć profilu w świecie o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
