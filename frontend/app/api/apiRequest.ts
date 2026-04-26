import { getStoredUser } from "@/stores/UserStore";
import { emitToast } from "@/lib/toastBridge";

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
      emitToast("Brak autoryzacji. Zaloguj się, aby kontynuować.", "error");
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

  const response = await fetch(requestUrl, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      emitToast("Login to continue", "error");
    } else if (response.status === 403) {
      emitToast("Insuficient permission", "error");
    }

    let errorMessage = response.statusText;
    const rawBody = await response.text();

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

    throw new Error(`Request failed with status ${response.status}: ${errorMessage}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}
