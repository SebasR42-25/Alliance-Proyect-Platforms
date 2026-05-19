import { api } from './api';
import type { Reel } from '../types';

export async function getReels(): Promise<Reel[]> {
  const res = await api.get<Reel[]>('/reels');
  return res.data;
}
