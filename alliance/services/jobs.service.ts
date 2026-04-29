import { api, createAuthClient } from '@/lib/api';
import type { Job } from '@/types';

export interface CreateJobDto {
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  description?: string;
  tags?: string[];
}

export async function getJobs(filters?: { title?: string; location?: string; company?: string }): Promise<Job[]> {
  const res = await api.get<Job[]>('/jobs', { params: filters });
  return res.data;
}

export async function getJobById(id: string): Promise<Job> {
  const res = await api.get<Job>(`/jobs/${id}`);
  return res.data;
}

export async function createJob(token: string, data: CreateJobDto): Promise<Job> {
  const client = createAuthClient(token);
  const res    = await client.post<Job>('/jobs', data);
  return res.data;
}

export async function applyToJob(token: string, jobId: string): Promise<{ message: string }> {
  const client = createAuthClient(token);
  const res    = await client.post(`/jobs/${jobId}/apply`);
  return res.data;
}

export async function saveJob(token: string, jobId: string): Promise<{ message: string; saved: boolean }> {
  const client = createAuthClient(token);
  const res    = await client.post(`/jobs/${jobId}/save`);
  return res.data;
}
