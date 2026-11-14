import type { Credentials, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const csrfHeaders = (): Record<string, string> => {
  const csrf = document.cookie.split('; ').find((value) => value.startsWith('histodle_csrf='))?.split('=')[1];
  return csrf ? { 'X-CSRF-Token': decodeURIComponent(csrf) } : {};
};

const request = async (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

const errorMessage = async (response: Response) =>
  (await response.text()) || `Error de autenticación (${response.status})`;

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await request('/auth/me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await errorMessage(response));
  return response.json();
};

export const register = async (credentials: Required<Credentials>): Promise<void> => {
  const response = await request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
  if (!response.ok) throw new Error(await errorMessage(response));
};

export const login = async (credentials: Credentials): Promise<User> => {
  const response = await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()).user;
};

export const logout = async (): Promise<void> => {
  const response = await request('/auth/logout', { method: 'POST', headers: csrfHeaders() });
  if (!response.ok) throw new Error(await errorMessage(response));
};

export const googleLoginURL = `${API_URL}/auth/google`;
export const googleLinkURL = `${API_URL}/auth/google?link=1`;
