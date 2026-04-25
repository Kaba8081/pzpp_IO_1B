import { apiRequest } from "@/api/apiRequest";
import type { WorldRoomMessage } from "@/types/models";
import type { MessagePaginationParams, PaginatedResponse } from "./types";

export async function getChannelMessages(
  channelId: number,
  pagination: MessagePaginationParams = {}
): Promise<PaginatedResponse<WorldRoomMessage>> {
  try {
    return await apiRequest<PaginatedResponse<WorldRoomMessage>, never, MessagePaginationParams>(
      `/api/forum/channel/${channelId}/messages`,
      {
        method: "GET",
        params: pagination,
      }
    );
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać wiadomości dla kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
