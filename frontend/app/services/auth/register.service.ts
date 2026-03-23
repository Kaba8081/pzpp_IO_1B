import { apiRequest } from "@/api/apiRequest";
import type { RegisterRequest, UserResponse } from "./types";

export function register(payload: RegisterRequest) {
  return apiRequest<UserResponse, RegisterRequest>("/api/auth/register/", {
    method: "POST",
    body: payload,
  });
}
