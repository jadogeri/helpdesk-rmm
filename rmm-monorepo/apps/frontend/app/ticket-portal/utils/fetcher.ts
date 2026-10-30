// frontend/app/ticket-portal/utils/fetcher.ts

export async function apiFetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Proxy Request Failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
