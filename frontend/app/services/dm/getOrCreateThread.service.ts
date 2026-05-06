import { apiRequest } from "@/api/apiRequest";
import type { DirectMessageThread } from "@/types/models";

export async function getOrCreateDMThread(userId: number): Promise<DirectMessageThread> {
  return apiRequest<DirectMessageThread>(`/api/dm/thread/with/${userId}/`, {
    method: "POST",
    requiresAuth: true,
  });
}
