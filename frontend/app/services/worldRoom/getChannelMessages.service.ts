import { apiRequest } from "@/api/apiRequest";
import type { WorldRoomMessageWithAuthor } from "@/types/models";
import type { MessagePaginationParams, PaginatedResponse } from "./types";

export async function getChannelMessages(
  channelId: number,
  pagination: MessagePaginationParams = {}
): Promise<PaginatedResponse<WorldRoomMessageWithAuthor>> {
  try {
    return await apiRequest<
      PaginatedResponse<WorldRoomMessageWithAuthor>,
      never,
      MessagePaginationParams
    >(`/api/forum/channel/${channelId}/messages`, {
      method: "GET",
      params: pagination,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać wiadomości dla kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
