import { apiRequest } from "@/api/apiRequest";
import type { LoginRequest, TokenPairResponse } from "@/types/models";

export function login(payload: LoginRequest) {
  return apiRequest<TokenPairResponse, LoginRequest>("/api/auth/login/", {
    method: "POST",
    body: payload,
  });
}
