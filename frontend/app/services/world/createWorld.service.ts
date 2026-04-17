import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { World, CreateWorldDto } from "./types";

function getAuthHeaders(): HeadersInit {
  const accessToken = getStoredUser()?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access token w UserStore.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function createWorld(data: CreateWorldDto): Promise<World> {
  try {
    return await apiRequest<World, CreateWorldDto>("/api/forum/world/", {
      method: "POST",
      body: data,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się utworzyć nowego świata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
