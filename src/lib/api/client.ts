import { ApiError } from "../types";

/**
 * Central API client.
 *
 * When `NEXT_PUBLIC_API_BASE_URL` is configured the application talks to the
 * real backend. With no backend configured the app runs in mock mode and
 * services resolve from the bundled sample dataset — clearly marked as such
 * throughout the UI.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const IS_MOCK_MODE = API_BASE_URL.trim().length === 0;

export const API_MODE: "mock" | "live" = IS_MOCK_MODE ? "mock" : "live";

export const MODE_LABEL = IS_MOCK_MODE
  ? "Mock mode — sample data, no backend connected"
  : `Live API — ${API_BASE_URL}`;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  if (IS_MOCK_MODE) {
    throw new ApiError(
      `Backend not connected (mock mode): GET/POST ${path}`,
      path,
      503,
    );
  }

  const { timeoutMs = 15_000, headers, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(rest.body && !(rest.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const payload = (await response.json()) as { message?: string; error?: string };
        message = payload.message ?? payload.error ?? message;
      } catch {
        /* body was not JSON */
      }
      throw new ApiError(message, path, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(`Request timed out: ${path}`, path, 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      path,
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}
