import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile } from "./types";

export async function uploadWorldProfileAvatar(
  profileId: number,
  file: File
): Promise<WorldUserProfile> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    return await apiRequest<WorldUserProfile>(`/api/forum/profile/${profileId}/image`, {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się przesłać awatara profilu o ID ${profileId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
