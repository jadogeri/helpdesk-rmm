// frontend/app/ticket-portal/utils/fetcher.ts

export async function apiFetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(" ")
          : String(payload.message)
        : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return response.json();
}
