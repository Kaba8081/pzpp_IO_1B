import { apiRequest } from "@/api/apiRequest";

export async function markDMRead(threadId: number): Promise<void> {
  return apiRequest<void>(`/api/dm/thread/${threadId}/mark-read/`, {
    method: "POST",
    requiresAuth: true,
  });
}
