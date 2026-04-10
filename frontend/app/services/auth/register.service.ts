import { apiRequest } from "@/api/apiRequest";
import type { RegisterRequest, RegisterResponse } from "@/types/models";

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse, RegisterRequest>("/api/auth/register/", {
    method: "POST",
    body: payload,
  });
}
