import { login } from "./auth/login.service";
import { me } from "./auth/me.service";
import { refresh } from "./auth/refresh.service";
import { register } from "./auth/register.service";
import { clearUserStoreAuth, getStoredUser, setStoredUser } from "@/stores/UserStore";
import type {
  LoginRequest,
  MeResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SessionUser,
  TokenPairResponse,
} from "@/types/models";

async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  return register(payload);
}

async function loginUser(payload: LoginRequest): Promise<{
  tokens: TokenPairResponse;
  user: SessionUser;
}> {
  const tokens = await login(payload);
  const userData = await me(tokens.access);
  const user: SessionUser = {
    ...userData,
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
  };

  setStoredUser(user);

  return { tokens, user };
}

async function meFromStore(): Promise<MeResponse> {
  const user = getStoredUser();
  const accessToken = user?.accessToken;

  if (!accessToken) {
    throw new Error("Brak access-token w UserStore.");
  }

  const userData = await me(accessToken);

  if (user) {
    setStoredUser({
      ...userData,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  return userData;
}

async function refreshTokens(): Promise<{
  tokens: {
    access: string;
    refresh: string;
  };
  user: SessionUser;
}> {
  const user = getStoredUser();
  const refreshToken = user?.refreshToken;

  if (!refreshToken) {
    throw new Error("Brak refresh-token w UserStore.");
  }

  const refreshResponse: RefreshTokenResponse = await refresh({ refresh: refreshToken });
  const tokens = {
    access: refreshResponse.access,
    refresh: refreshToken,
  };

  const userData = await me(tokens.access);
  const refreshedUser: SessionUser = {
    ...userData,
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
  };
  setStoredUser(refreshedUser);

  return {
    tokens,
    user: refreshedUser,
  };
}

function clearAuth(): void {
  clearUserStoreAuth();
}

export type { LoginRequest, MeResponse, RegisterRequest, RegisterResponse, TokenPairResponse };

export const AuthService = {
  login: loginUser,
  register: registerUser,
  me: meFromStore,
  refresh: refreshTokens,
  clearAuth,
};
