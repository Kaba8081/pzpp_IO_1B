import { apiRequest } from "@/api/apiRequest";
import type { WorldRoom } from "@/types/models";

export async function getChannel(channelId: number): Promise<WorldRoom> {
  try {
    return await apiRequest<WorldRoom>(`/api/forum/channel/${channelId}`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
