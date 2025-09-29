import { API, jsonFetch } from '@/lib/api';

export const login = (email: string, password: string) =>
  jsonFetch<{ email: string }>(`/auth/login`, { method: 'POST', body: { email, password } });

export const me = () => jsonFetch<{ email: string }>(`/auth/me`);

export const logout = () =>
  fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).then((r) => {
    if (!r.ok) throw new Error('Logout failed');
  });


