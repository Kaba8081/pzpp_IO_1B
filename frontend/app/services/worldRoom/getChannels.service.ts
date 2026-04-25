import { apiRequest } from "@/api/apiRequest";
import type { Channel } from "@/types/models";

export async function getChannels(worldId: number): Promise<Channel[]> {
  return apiRequest<Channel[]>(`/api/forum/world/${worldId}/channels`);
}
