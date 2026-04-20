import { apiRequest } from "@/api/apiRequest";
import type { World, UpdateWorldDto } from "./types";

export async function updateWorld(worldId: number, data: UpdateWorldDto): Promise<World> {
  try {
    return await apiRequest<World, UpdateWorldDto>(`/api/forum/world/${worldId}`, {
      method: "PATCH",
      body: data,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
