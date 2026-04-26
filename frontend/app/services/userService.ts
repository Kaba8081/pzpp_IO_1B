import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { AuthUser, AuthUserProfile, UpdateUserDto } from "@/types/models";

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    return await apiRequest<AuthUser>("/api/auth/me/", {
      method: "GET",
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać aktualnie zalogowanego użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getUserById(userId: number): Promise<AuthUserProfile> {
  return apiRequest<AuthUserProfile>(`/api/user/id/${userId}/`, {
    method: "GET",
  });
}

export async function getUserByUsername(username: string): Promise<AuthUserProfile> {
  try {
    return await apiRequest<AuthUserProfile>(`/api/user/${username}`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profilu użytkownika (${username}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateCurrentUser(data: UpdateUserDto): Promise<AuthUserProfile> {
  const username = getStoredUser()?.profile?.username;

  if (!username) {
    throw new Error("Nie można zaktualizować profilu: brak nazwy użytkownika.");
  }

  try {
    return await apiRequest<AuthUserProfile, UpdateUserDto>(`/api/user/${username}`, {
      method: "PATCH",
      body: data,
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować profilu użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
