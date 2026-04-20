import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { World, WorldProfile } from "./types";
import { getAllWorlds } from "./getAllWorlds.service";

function getAuthHeaders(): HeadersInit {
  const accessToken = getStoredUser()?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access token w UserStore.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getUserWorlds(): Promise<World[]> {
  try {
    const profiles = await apiRequest<WorldProfile[]>("/api/forum/profile/", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const worldIds = new Set(profiles.map((profile) => profile.world_id));

    const allWorlds = await getAllWorlds();

    return allWorlds.filter((world) => worldIds.has(world.id));
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać światów użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
