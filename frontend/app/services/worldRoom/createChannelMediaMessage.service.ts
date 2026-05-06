import type { WorldRoomMessageWithAuthor } from "@/types/models";
import { apiRequest } from "@/api/apiRequest";

export interface CreateChannelMediaMessageDto {
  user_profile: number;
  file: File;
  media_type: "image" | "video";
}

export async function createChannelMediaMessage(
  channelId: number,
  data: CreateChannelMediaMessageDto
): Promise<WorldRoomMessageWithAuthor> {
  const formData = new FormData();
  formData.append("user_profile", data.user_profile.toString());
  formData.append("file", data.file);
  formData.append("media_type", data.media_type);

  return await apiRequest<WorldRoomMessageWithAuthor, FormData>(
    `/api/forum/channel/${channelId}/messages`,
    {
      method: "POST",
      body: formData,
      requiresAuth: true,
    }
  );
}
