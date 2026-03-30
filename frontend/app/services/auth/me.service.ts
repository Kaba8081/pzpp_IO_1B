import { apiRequest } from "@/api/apiRequest";
import type { MeResponse } from "@/types/models";

export function me(accessToken: string) {
  return apiRequest<MeResponse>("/api/auth/me/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
