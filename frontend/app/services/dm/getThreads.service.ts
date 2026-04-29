import { apiRequest } from "@/api/apiRequest";
import type { DirectMessageThread } from "@/types/models";

export async function getDMThreads(): Promise<DirectMessageThread[]> {
  return apiRequest<DirectMessageThread[]>("/api/dm/threads/", {
    method: "GET",
    requiresAuth: true,
  });
}
