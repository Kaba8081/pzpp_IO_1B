import type { AuthUser, AuthUserProfile } from "./auth";

export type User = AuthUser;

export type UpdateUserDto = Partial<
  Pick<AuthUserProfile, "username" | "description" | "profile_picture">
>;
