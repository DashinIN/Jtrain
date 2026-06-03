export const API_BASE = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE ?? "").replace(/\/$/, "");

export interface ApiListResponse<T> {
  items: T[];
  total?: number;
  next_offset?: number | null;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchAllPages<T>(path: string, limit = 500): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;

  for (;;) {
    const response = await fetchJson<ApiListResponse<T>>(`${path}${path.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`);
    items.push(...response.items);
    if (response.next_offset == null) break;
    offset = response.next_offset;
  }

  return items;
}
