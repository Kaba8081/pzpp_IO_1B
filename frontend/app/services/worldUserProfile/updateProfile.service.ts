import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile, WorldUserProfileDto } from "./types";

export async function updateWorldProfile(
  profileId: number,
  data: WorldUserProfileDto
): Promise<WorldUserProfile> {
  try {
    return await apiRequest<WorldUserProfile, WorldUserProfileDto>(
      `/api/forum/profile/${profileId}`,
      {
        method: "PATCH",
        body: data,
        requiresAuth: true,
      }
    );
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować profilu o ID ${profileId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
