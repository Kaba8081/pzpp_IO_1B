export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface UserProfile {
  username: string;
  description: string;
  profilePicture: string;
}

export interface UserResponse {
  id: number;
  email: string;
  profile: UserProfile | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  description?: string;
}
