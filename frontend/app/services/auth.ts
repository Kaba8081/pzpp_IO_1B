import { login } from "./auth/login.service";
import { me } from "./auth/me.service";
import { register } from "./auth/register.service";

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  UserResponse,
} from "./auth/types";

export const AuthService = {
  login,
  register,
  me,
};
