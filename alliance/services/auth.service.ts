import { api } from '@/lib/api';
import type { LoginResponse, RegisterResponse } from '@/types';

export async function loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password });
  return res.data;
}

export async function registerUser(name: string, email: string, password: string): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/register', { name, email, password });
  return res.data;
}
