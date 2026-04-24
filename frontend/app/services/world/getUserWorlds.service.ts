import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { World } from "./types";

export async function getUserWorlds(): Promise<World[]> {
  const username = getStoredUser()?.profile?.username;

  if (!username) {
    throw new Error("Nie można pobrać światów: brak nazwy użytkownika.");
  }

  try {
    return await apiRequest<World[]>("/api/forum/world/", {
      method: "GET",
      params: { username },
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać światów użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
