import { apiRequest } from "@/api/apiRequest";
import { getStoredUser } from "@/stores/UserStore";
import type { UpdateUserDto, User } from "@/types/models";

function getAuthHeaders(): HeadersInit {
  const accessToken = getStoredUser()?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access token w UserStore.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getCurrentUser(): Promise<User> {
  try {
    return await apiRequest<User>("/api/auth/me/", {
      method: "GET",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać aktualnie zalogowanego użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    return await apiRequest<User>(`/api/users/${id}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się pobrać profilu użytkownika (${id}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateCurrentUser(data: UpdateUserDto): Promise<User> {
  try {
    return await apiRequest<User, UpdateUserDto>("/api/users/me/", {
      method: "PATCH",
      body: data,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować profilu użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
