import { apiRequest } from "@/api/apiRequest";
import type { DirectMessage } from "@/types/models";

export async function createDMMessage(threadId: number, content: string): Promise<DirectMessage> {
  return apiRequest<DirectMessage, { content: string }>(`/api/dm/thread/${threadId}/messages/`, {
    method: "POST",
    body: { content },
    requiresAuth: true,
  });
}
