import { apiRequest } from "@/api/apiRequest";
import type { UpdateUserDto, User } from "@/types/models";

export async function getCurrentUser(): Promise<User> {
  try {
    return await apiRequest<User>("/api/auth/me/", {
      method: "GET",
      requiresAuth: true,
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
      requiresAuth: true,
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
      requiresAuth: true,
    });
  } catch (error) {
    throw new Error(
      `Nie udało się zaktualizować profilu użytkownika: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
