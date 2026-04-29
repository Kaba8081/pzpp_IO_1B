import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile } from "./types";

export async function getWorldProfilesByWorld(worldId: number): Promise<WorldUserProfile[]> {
  try {
    return await apiRequest<WorldUserProfile[]>(`/api/forum/world/${worldId}/profiles`, {
      method: "GET",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profili świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
