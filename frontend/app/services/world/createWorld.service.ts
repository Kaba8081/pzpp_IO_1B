import { apiRequest } from "@/api/apiRequest";
import type { World, CreateWorldDto } from "./types";

export async function createWorld(data: CreateWorldDto): Promise<World> {
  try {
    return await apiRequest<World, CreateWorldDto>("/api/forum/world/", {
      method: "POST",
      body: data,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się utworzyć nowego świata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
