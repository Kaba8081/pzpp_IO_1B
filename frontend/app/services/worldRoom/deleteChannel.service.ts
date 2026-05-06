import { apiRequest } from "@/api/apiRequest";

export async function deleteChannel(channelId: number): Promise<void> {
  try {
    await apiRequest<void>(`/api/forum/channel/${channelId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się usunąć kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
