import { apiRequest } from "@/api/apiRequest";
import type { World } from "./types";

export async function uploadWorldImage(worldId: number, file: File): Promise<World> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    return await apiRequest<World>(`/api/forum/world/${worldId}/image`, {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się przesłać obrazu świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
