import { api, createAuthClient } from './api';
import type { Job } from '../types';

export async function getJobs(title = '', location = ''): Promise<Job[]> {
  const res = await api.get<Job[]>('/jobs', { params: { title, location } });
  return res.data;
}

export async function applyToJob(token: string, jobId: string) {
  const res = await createAuthClient(token).post(`/jobs/${jobId}/apply`);
  return res.data;
}

export async function saveJob(token: string, jobId: string) {
  const res = await createAuthClient(token).post(`/jobs/${jobId}/save`);
  return res.data;
}
