import { apiRequest } from "@/api/apiRequest";
import type { World } from "./types";

export async function getWorldById(worldId: number): Promise<World> {
  try {
    return await apiRequest<World>(`/api/forum/world/${worldId}`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
