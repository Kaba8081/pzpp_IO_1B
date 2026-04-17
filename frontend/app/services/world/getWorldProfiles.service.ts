import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { WorldProfile } from "./types";

function getAuthHeaders(): HeadersInit {
  const accessToken = getStoredUser()?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access token w UserStore.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getWorldProfiles(worldId: number): Promise<WorldProfile[]> {
  try {
    return await apiRequest<WorldProfile[]>(`/api/forum/world/${worldId}/profiles`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profili świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
