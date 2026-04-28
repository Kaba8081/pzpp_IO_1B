import { apiRequest } from "@/api/apiRequest";
import type { WorldRoomMessageWithAuthorOf } from "@/types/models";
import type { UpdateChannelMessageDto } from "./types";

export async function updateChannelMessage(
  messageId: number,
  data: UpdateChannelMessageDto
): Promise<WorldRoomMessageWithAuthorOf<"text">> {
  try {
    return await apiRequest<WorldRoomMessageWithAuthorOf<"text">, UpdateChannelMessageDto>(
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
