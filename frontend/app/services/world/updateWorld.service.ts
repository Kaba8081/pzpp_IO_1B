import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { World, UpdateWorldDto } from "./types";

function getAuthHeaders(): HeadersInit {
  const accessToken = getStoredUser()?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access token w UserStore.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function updateWorld(worldId: number, data: UpdateWorldDto): Promise<World> {
  try {
    return await apiRequest<World, UpdateWorldDto>(`/api/forum/world/${worldId}`, {
      method: "PATCH",
      body: data,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
