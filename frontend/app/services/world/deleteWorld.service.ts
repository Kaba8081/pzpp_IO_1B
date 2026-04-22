import { apiRequest } from "@/api/apiRequest";

export async function deleteWorld(worldId: number): Promise<void> {
  try {
    await apiRequest<void>(`/api/forum/world/${worldId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się usunąć świata o ID ${worldId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
