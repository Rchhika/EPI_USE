export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export async function jsonFetch<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
    body:
      typeof init.body === 'string'
        ? init.body
        : init.body
        ? JSON.stringify(init.body)
        : undefined,
  });
  if (!res.ok) {
    let err: any;
    try { err = await res.json(); } catch { err = { message: res.statusText }; }
    throw err;
  }
  return res.json() as Promise<T>;
}
