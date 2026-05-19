import { api } from './api';
import type { LoginResponse } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password });
  return res.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
}

export async function getProfile(token: string) {
  const res = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
