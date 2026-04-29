import { api } from '@/lib/api';
import type { NewsArticle } from '@/types';

export async function getTechNews(): Promise<NewsArticle[]> {
  const res = await api.get<NewsArticle[]>('/news/tech');
  return res.data;
}
