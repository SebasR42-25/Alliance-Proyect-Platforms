import { api, createAuthClient } from '@/lib/api';
import type { Post } from '@/types';

export async function getPosts(): Promise<Post[]> {
  const res = await api.get<Post[]>('/posts');
  return res.data;
}

export async function createPost(
  token: string,
  data: { content: string; imageUrl?: string; hashtags?: string[] }
): Promise<Post> {
  const client = createAuthClient(token);
  const res    = await client.post<Post>('/posts', data);
  return res.data;
}

export async function toggleLike(token: string, postId: string): Promise<Post> {
  const client = createAuthClient(token);
  const res    = await client.patch<Post>(`/posts/${postId}/like`);
  return res.data;
}

export async function addComment(token: string, postId: string, text: string): Promise<Post> {
  const client = createAuthClient(token);
  const res    = await client.post<Post>(`/posts/${postId}/comments`, { text });
  return res.data;
}
