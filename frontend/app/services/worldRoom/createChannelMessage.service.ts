import { apiRequest } from "@/api/apiRequest";
import type { WorldRoomMessageWithAuthorOf } from "@/types/models";
import type { CreateChannelMessageDto } from "./types";

export async function createChannelMessage(
  channelId: number,
  data: CreateChannelMessageDto
): Promise<WorldRoomMessageWithAuthorOf<"text">> {
  try {
    return await apiRequest<WorldRoomMessageWithAuthorOf<"text">, CreateChannelMessageDto>(
      `/api/forum/channel/${channelId}/messages`,
      {
        method: "POST",
        body: data,
        requiresAuth: true,
      }
    );
  } catch (error) {
    throw new Error(
      `Nie udało się dodać wiadomości do kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
