export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface TokenPairResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface AuthUserProfile {
  user: number;
  username: string | null;
  description: string | null;
  profile_picture: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  profile: AuthUserProfile | null;
}

export interface SessionUser extends AuthUser {
  accessToken: string;
  refreshToken: string;
}

export type RegisterResponse = AuthUser;
export type MeResponse = AuthUser;
