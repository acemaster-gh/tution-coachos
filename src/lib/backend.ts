export function getRustBackendBaseUrl(): string {
  const value = process.env.RUST_BACKEND_URL ?? process.env.NEXT_PUBLIC_RUST_BACKEND_URL ?? "http://localhost:8080";
  return value.replace(/\/+$/, "");
}

export async function fetchFromRustBackend<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = getRustBackendBaseUrl();
  const url = new URL(path.startsWith("/") ? path : `/${path}`, baseUrl).toString();

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Rust backend request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
