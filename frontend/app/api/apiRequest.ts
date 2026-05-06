import { getStoredUser, setStoredUser } from "@/stores/UserStore";
import { emitToast } from "@/lib/toastBridge";
import { emitLogout } from "@/lib/authBridge";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;
type QueryParam = QueryValue | QueryValue[];

export type QueryParams = Record<string, QueryParam>;

export interface ApiRequestOptions<TBody = unknown, TParams extends QueryParams = QueryParams> {
  method?: HttpMethod;
  body?: TBody;
  params?: TParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
  requiresAuth?: boolean;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

function resolveApiUrl(url: string): string {
  if (!backendUrl) {
    return url;
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(url);
  if (isAbsoluteUrl) {
    return url;
  }

  const normalizedBaseUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

function addParamsToUrl(url: string, params?: QueryParams): string {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) {
          searchParams.append(key, String(item));
        }
      }
      continue;
    }

    searchParams.append(key, String(value));
  }

  const queryString = searchParams.toString();
  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

// Deduplicates concurrent refresh attempts — only one in-flight at a time.
let pendingRefresh: Promise<string> | null = null;

async function attemptRefresh(): Promise<string> {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = (async () => {
    const user = getStoredUser();
    if (!user?.refreshToken) {
      emitLogout();
      emitToast("Session expired. Please log in again.", "error");
      throw new Error("No refresh token available");
    }

    const refreshResponse = await fetch(resolveApiUrl("/api/auth/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: user.refreshToken }),
    });

    if (!refreshResponse.ok) {
      emitLogout();
      emitToast("Session expired. Please log in again.", "error");
      throw new Error("Token refresh failed");
    }

    const data = (await refreshResponse.json()) as { access: string };
    setStoredUser({ ...user, accessToken: data.access });
    return data.access;
  })().finally(() => {
    pendingRefresh = null;
  });

  return pendingRefresh;
}

export async function apiRequest<
  TResponse,
  TBody = unknown,
  TParams extends QueryParams = QueryParams,
>(url: string, options: ApiRequestOptions<TBody, TParams> = {}): Promise<TResponse> {
  const { method = "GET", body, params, headers, signal, requiresAuth = false } = options;
  const requestHeaders = new Headers(headers);

  if (requiresAuth) {
    const accessToken = getStoredUser()?.accessToken;
    if (!accessToken) {
      emitToast("Login to continue", "error");
      throw new Error("Brak access token w UserStore.");
    }
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined && method !== "GET") {
    if (isBodyInit(body)) {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }
    }
  }

  const requestUrl = addParamsToUrl(resolveApiUrl(url), params);

  let activeResponse = await fetch(requestUrl, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  // On 401 for authenticated requests, silently refresh and retry once.
  if (activeResponse.status === 401 && requiresAuth) {
    const newToken = await attemptRefresh(); // throws (with toast+logout) if refresh fails
    if (signal?.aborted) throw new DOMException("aborted", "AbortError");
    requestHeaders.set("Authorization", `Bearer ${newToken}`);
    activeResponse = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    });
  }

  if (!activeResponse.ok) {
    if (activeResponse.status === 401) {
      emitToast("Login to continue", "error");
    } else if (activeResponse.status === 403) {
      emitToast("Insuficient permission", "error");
    }

    let errorMessage = activeResponse.statusText;
    const rawBody = await activeResponse.text();

    if (rawBody) {
      try {
        const errorBody = JSON.parse(rawBody);
        if (typeof errorBody === "string") {
          errorMessage = errorBody;
        } else if (errorBody?.message && typeof errorBody.message === "string") {
          errorMessage = errorBody.message;
        } else {
          errorMessage = JSON.stringify(errorBody);
        }
      } catch {
        errorMessage = rawBody;
      }
    }

    throw new Error(`Request failed with status ${activeResponse.status}: ${errorMessage}`);
  }

  if (activeResponse.status === 204) {
    return undefined as TResponse;
  }

  const contentType = activeResponse.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await activeResponse.json()) as TResponse;
  }

  return (await activeResponse.text()) as TResponse;
}
