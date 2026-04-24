import { apiRequest } from "@/api/apiRequest";
import type { WorldRoom } from "@/types/models";
import type { UpdateChannelDto } from "./types";

export async function updateChannel(channelId: number, data: UpdateChannelDto): Promise<WorldRoom> {
  try {
    return await apiRequest<WorldRoom, UpdateChannelDto>(`/api/forum/channel/${channelId}`, {
      method: "PATCH",
      body: data,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
