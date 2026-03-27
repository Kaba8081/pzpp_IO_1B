import { apiRequest } from "@/api/apiRequest";
import type { UserResponse } from "./types";

export function me(accessToken: string) {
  return apiRequest<UserResponse>("/api/auth/me/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
