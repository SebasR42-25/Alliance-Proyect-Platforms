import { createAuthClient } from '@/lib/api';

export async function uploadImage(token: string, file: File): Promise<{ url: string; public_id: string }> {
  const client   = createAuthClient(token);
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<{ url: string; public_id: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
