import { api, createAuthClient } from '@/lib/api';
import type { User } from '@/types';

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>('/users');
  return res.data;
}

export async function getUserById(id: string): Promise<User> {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
}

export async function getMe(token: string): Promise<User> {
  const client = createAuthClient(token);
  const res    = await client.get<User>('/users/me');
  return res.data;
}

export async function updateMe(token: string, data: Partial<User>): Promise<User> {
  const client = createAuthClient(token);
  const res    = await client.patch<User>('/users/me', data);
  return res.data;
}

export async function getNetwork(token: string): Promise<User[]> {
  const client = createAuthClient(token);
  const res    = await client.get<User[]>('/users/network');
  return res.data;
}

export async function searchGlobal(query: string): Promise<{ users: User[]; jobs: unknown[] }> {
  const res = await api.get(`/users/search`, { params: { q: query } });
  return res.data;
}

export async function sendConnectionRequest(token: string, targetId: string): Promise<{ message: string }> {
  const client = createAuthClient(token);
  const res    = await client.post(`/users/connections/${targetId}`);
  return res.data;
}

export async function acceptConnection(token: string, senderId: string): Promise<{ message: string }> {
  const client = createAuthClient(token);
  const res    = await client.patch(`/users/connections/accept/${senderId}`);
  return res.data;
}

export async function rejectConnection(token: string, senderId: string): Promise<{ message: string }> {
  const client = createAuthClient(token);
  const res    = await client.delete(`/users/connections/reject/${senderId}`);
  return res.data;
}
