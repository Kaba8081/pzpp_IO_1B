import type { DirectMessage } from "@/types/models";
import { apiRequest } from "@/api/apiRequest";

export interface CreateDMMediaMessageDto {
  file: File;
  media_type: "image" | "video";
}

export async function createDMMediaMessage(
  threadId: number,
  data: CreateDMMediaMessageDto
): Promise<DirectMessage> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("media_type", data.media_type);

  return await apiRequest<DirectMessage, FormData>(`/api/dm/thread/${threadId}/messages/`, {
    method: "POST",
    body: formData,
    requiresAuth: true,
  });
}
