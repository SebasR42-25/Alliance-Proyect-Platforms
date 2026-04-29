import { api, createAuthClient } from '@/lib/api';
import type { Story } from '@/types';

export async function getStories(): Promise<Story[]> {
  const res = await api.get<Story[]>('/stories');
  return res.data;
}

export async function uploadStory(token: string, file: File): Promise<Story> {
  const client   = createAuthClient(token);
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<Story>('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function markStoryViewed(token: string, storyId: string): Promise<Story> {
  const client = createAuthClient(token);
  const res    = await client.patch<Story>(`/stories/${storyId}/view`);
  return res.data;
}
