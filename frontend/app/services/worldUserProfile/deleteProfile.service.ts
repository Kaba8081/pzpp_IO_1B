import { apiRequest } from "@/api/apiRequest";

export async function deleteWorldProfile(profileId: number): Promise<void> {
  try {
    await apiRequest<void>(`/api/forum/profile/${profileId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się usunąć profilu o ID ${profileId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
