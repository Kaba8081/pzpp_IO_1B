import { apiRequest } from "@/api/apiRequest";
import type { WorldUserProfile } from "./types";

export async function getAllWorldProfiles(): Promise<WorldUserProfile[]> {
  try {
    return await apiRequest<WorldUserProfile[]>("/api/forum/profile/", {
      method: "GET",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profili użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
