import { api, createAuthClient } from './api';
import type { User } from '../types';

export async function getNetworkSuggestions(token: string): Promise<User[]> {
  const res = await createAuthClient(token).get<User[]>('/users/network');
  return res.data;
}

export async function searchUsers(query: string) {
  const res = await api.get('/users/search', { params: { q: query } });
  return res.data;
}

export async function sendConnectionRequest(token: string, userId: string) {
  const res = await createAuthClient(token).post(`/users/connections/${userId}`);
  return res.data;
}

export async function getMe(token: string): Promise<User> {
  const res = await createAuthClient(token).get<User>('/users/me');
  return res.data;
}

export async function updateProfile(token: string, data: Partial<User>) {
  const res = await createAuthClient(token).patch('/users/me', data);
  return res.data;
}
