import { api } from './api';
import type { Company, Job } from '../types';

export async function getCompanies(): Promise<Company[]> {
  const res = await api.get<Company[]>('/companies');
  return res.data;
}

export async function getCompanyJobs(companyId: string): Promise<Job[]> {
  const res = await api.get<Job[]>(`/companies/${companyId}/jobs`);
  return res.data;
}
