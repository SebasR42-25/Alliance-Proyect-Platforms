import { api } from './api';
import type { NewsItem } from '../types';

export async function getNews(): Promise<NewsItem[]> {
  const res = await api.get<NewsItem[]>('/news/tech');
  return res.data;
}
