import { apiRequest } from "@/api/apiRequest";
import type { World } from "./types";

export async function getAllWorlds(): Promise<World[]> {
  try {
    return await apiRequest<World[]>("/api/forum/world/", {
      method: "GET",
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać listy wszystkich światów: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
