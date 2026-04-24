import type { QueryParams } from "@/api/apiRequest";

export interface CreateChannelDto {
  name: string;
  description?: string | null;
  thumbnail?: string | null;
}

export interface UpdateChannelDto {
  name?: string;
  description?: string | null;
  thumbnail?: string | null;
}

export interface MessagePaginationParams extends QueryParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateChannelMessageDto {
  user_profile: number;
  content: string;
}

export interface UpdateChannelMessageDto {
  content?: string;
}
