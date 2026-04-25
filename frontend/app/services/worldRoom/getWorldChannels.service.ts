import { apiRequest } from "@/api/apiRequest";
import type { WorldRoom } from "@/types/models";

export async function getWorldChannels(worldId: number): Promise<WorldRoom[]> {
  try {
    return await apiRequest<WorldRoom[]>(`/api/forum/world/${worldId}/channels`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać kanałów świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
