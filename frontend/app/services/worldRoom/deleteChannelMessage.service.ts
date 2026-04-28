import { apiRequest } from "@/api/apiRequest";

export async function deleteChannelMessage(messageId: number): Promise<void> {
  try {
    await apiRequest<void, undefined>(`/api/forum/channel/messages/${messageId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to delete message ${messageId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
