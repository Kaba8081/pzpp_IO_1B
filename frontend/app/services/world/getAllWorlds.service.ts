import { apiRequest } from "@/api/apiRequest";
import type { PaginatedResponse } from "@/types/models/common";
import type { World } from "./types";

export interface GetAllWorldsParams {
  search?: string;
  ordering?: string;
  offset?: number;
  limit?: number;
  username?: string;
}

export async function getAllWorlds(params?: GetAllWorldsParams): Promise<PaginatedResponse<World>> {
  try {
    return await apiRequest<PaginatedResponse<World>>("/api/forum/world/", {
      method: "GET",
      params: {
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.ordering ? { ordering: params.ordering } : {}),
        ...(params?.offset !== undefined ? { offset: params.offset } : {}),
        ...(params?.limit !== undefined ? { limit: params.limit } : {}),
        ...(params?.username ? { username: params.username } : {}),
      },
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać listy wszystkich światów: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
