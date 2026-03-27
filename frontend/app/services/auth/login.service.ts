import { apiRequest } from "@/api/apiRequest";
import type { LoginRequest, LoginResponse } from "./types";

export function login(loginValue: string, password: string) {
  return apiRequest<LoginResponse, LoginRequest>("/api/auth/login/", {
    method: "POST",
    body: { email: loginValue, password },
  });
}
