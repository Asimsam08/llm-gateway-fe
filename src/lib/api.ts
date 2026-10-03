import { ApiError } from "@/types/auth";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api").replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "llm_gateway_token";
const USER_STORAGE_KEY = "llm_gateway_user";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const buildApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If baseUrl already ends with /api and cleanEndpoint begins with /api/
  if (API_BASE_URL.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    return `${API_BASE_URL}${cleanEndpoint.slice(4)}`;
  }

  return `${API_BASE_URL}${cleanEndpoint}`;
};

export class FetchError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const token = getStoredToken();

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = buildApiUrl(endpoint);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const { errorMessage, errorData } = await readErrorPayload(
        response,
        `Request failed with status ${response.status}`
      );
      throw new FetchError(errorMessage, response.status, errorData);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }

    // Network error or offline
    throw new FetchError(
      error instanceof Error ? error.message : "Network error. Is the backend server running?",
      0
    );
  }
}

function messageFromErrorData(errorData: unknown, fallback: string): string {
  if (typeof errorData === "object" && errorData !== null) {
    if ("message" in errorData) {
      return String((errorData as ApiError).message);
    }
    if ("detail" in errorData) {
      return String((errorData as { detail: string }).detail);
    }
    if ("error" in errorData) {
      return String((errorData as { error: string }).error);
    }
  }
  return fallback;
}

async function readErrorPayload(
  response: Response,
  fallback: string
): Promise<{ errorMessage: string; errorData: unknown }> {
  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    return { errorMessage: fallback, errorData };
  }
  return {
    errorMessage: messageFromErrorData(errorData, fallback),
    errorData,
  };
}

/**
 * Multipart upload helper. Do not set Content-Type so the browser supplies the boundary.
 */
export function requestFormData<T>(
  endpoint: string,
  formData: FormData,
  options: { method?: string; onProgress?: (percent: number) => void } = {}
): Promise<T> {
  const { method = "POST", onProgress } = options;
  const token = getStoredToken();
  const url = buildApiUrl(endpoint);

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.setRequestHeader("Accept", "application/json");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status === 204) {
        resolve({} as T);
        return;
      }

      let parsed: unknown = {};
      if (xhr.responseText) {
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch {
          parsed = { message: xhr.responseText };
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parsed as T);
        return;
      }

      reject(
        new FetchError(
          messageFromErrorData(parsed, `Request failed with status ${xhr.status}`),
          xhr.status,
          parsed
        )
      );
    };

    xhr.onerror = () => {
      reject(
        new FetchError("Network error. Is the backend server running?", 0)
      );
    };

    xhr.onabort = () => {
      reject(new FetchError("Upload cancelled", 0));
    };

    xhr.send(formData);
  });
}

