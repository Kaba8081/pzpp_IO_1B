import { apiRequest } from "@/api/apiRequest";

export async function markRoomRead(roomId: number): Promise<void> {
  return apiRequest<void>(`/api/forum/channel/${roomId}/mark-read`, {
    method: "POST",
    requiresAuth: true,
  });
}
