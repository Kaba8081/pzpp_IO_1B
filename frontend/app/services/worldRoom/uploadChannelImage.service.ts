import { apiRequest } from "@/api/apiRequest";
import type { WorldRoom } from "@/types/models";

export async function uploadChannelImage(channelId: number, file: File): Promise<WorldRoom> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    return await apiRequest<WorldRoom>(`/api/forum/channel/${channelId}/image`, {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się przesłać obrazu kanału o ID ${channelId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
