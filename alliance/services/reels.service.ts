import { api, createAuthClient } from '@/lib/api';
import type { Reel } from '@/types';

export async function getReels(): Promise<Reel[]> {
  const res = await api.get<Reel[]>('/reels');
  return res.data;
}

export async function uploadReel(token: string, file: File, caption?: string): Promise<Reel> {
  const client   = createAuthClient(token);
  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('caption', caption);
  const res = await client.post<Reel>('/reels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
