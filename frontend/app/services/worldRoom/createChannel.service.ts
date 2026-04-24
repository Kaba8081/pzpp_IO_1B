import { apiRequest } from "@/api/apiRequest";
import type { WorldRoom } from "@/types/models";
import type { CreateChannelDto } from "./types";

export async function createChannel(worldId: number, data: CreateChannelDto): Promise<WorldRoom> {
  try {
    return await apiRequest<WorldRoom, CreateChannelDto>(`/api/forum/world/${worldId}/channels`, {
      method: "POST",
      body: data,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się utworzyć kanału w świecie o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
