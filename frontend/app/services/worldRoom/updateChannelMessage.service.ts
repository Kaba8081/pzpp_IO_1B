import { apiRequest } from "@/api/apiRequest";
import type { WorldRoomMessage } from "@/types/models";
import type { UpdateChannelMessageDto } from "./types";

export async function updateChannelMessage(
  messageId: number,
  data: UpdateChannelMessageDto
): Promise<WorldRoomMessage> {
  try {
    return await apiRequest<WorldRoomMessage, UpdateChannelMessageDto>(
      `/api/forum/channel/messages/${messageId}`,
      {
        method: "PATCH",
        body: data,
        requiresAuth: true,
      }
    );
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować wiadomości o ID ${messageId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
