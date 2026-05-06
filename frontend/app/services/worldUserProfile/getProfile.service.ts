import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile } from "./types";

export async function getWorldProfile(profileId: number): Promise<WorldUserProfile> {
  try {
    return await apiRequest<WorldUserProfile>(`/api/forum/profile/${profileId}`, {
      method: "GET",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profilu o ID ${profileId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
