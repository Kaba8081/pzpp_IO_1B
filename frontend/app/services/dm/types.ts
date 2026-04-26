import type { DirectMessage, DirectMessageThread } from "@/types/models";

export interface DMPaginationParams {
  page?: number;
  page_size?: number;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | (string | number | boolean | null | undefined)[];
}

export interface PaginatedDMResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type { DirectMessage, DirectMessageThread };
