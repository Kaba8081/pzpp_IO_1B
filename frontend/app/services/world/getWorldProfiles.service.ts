import { apiRequest } from "@/api/apiRequest";
import type { WorldProfile } from "./types";

export async function getWorldProfiles(worldId: number): Promise<WorldProfile[]> {
  try {
    return await apiRequest<WorldProfile[]>(`/api/forum/world/${worldId}/profiles`, {
      method: "GET",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profili świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
