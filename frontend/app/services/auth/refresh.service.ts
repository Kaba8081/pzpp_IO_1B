import { apiRequest } from "@/api/apiRequest";
import type { RefreshTokenRequest, RefreshTokenResponse } from "@/types/models";

export function refresh(payload: RefreshTokenRequest) {
  return apiRequest<RefreshTokenResponse, RefreshTokenRequest>("/api/auth/refresh/", {
    method: "POST",
    body: payload,
  });
}
