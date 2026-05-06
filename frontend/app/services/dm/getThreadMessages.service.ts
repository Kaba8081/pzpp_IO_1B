import { apiRequest } from "@/api/apiRequest";
import type { DirectMessage } from "@/types/models";
import type { DMPaginationParams, PaginatedDMResponse } from "./types";

export async function getDMThreadMessages(
  threadId: number,
  pagination: DMPaginationParams = {}
): Promise<PaginatedDMResponse<DirectMessage>> {
  return apiRequest<PaginatedDMResponse<DirectMessage>, never, DMPaginationParams>(
    `/api/dm/thread/${threadId}/messages/`,
    {
      method: "GET",
      params: pagination,
      requiresAuth: true,
    }
  );
}
