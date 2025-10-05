export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export async function jsonFetch<T>(path: string, init: RequestInit = {}) {
  try {
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
    
    // Safari-specific: handle empty responses
    const text = await res.text();
    if (!text) {
      return {} as T;
    }
    
    return JSON.parse(text) as T;
  } catch (error) {
    // Safari-specific: handle network errors more gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}
