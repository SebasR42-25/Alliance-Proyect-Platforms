import { api, createAuthClient } from '@/lib/api';
import type { Company, Job } from '@/types';

export interface CreateCompanyDto {
  name: string;
  description?: string;
  industry?: string;
  logoUrl?: string;
  availableJobs?: number;
}

export async function getCompanies(): Promise<Company[]> {
  const res = await api.get<Company[]>('/companies');
  return res.data;
}

export async function getCompanyById(id: string): Promise<Company> {
  const res = await api.get<Company>(`/companies/${id}`);
  return res.data;
}

export async function getCompanyJobs(companyId: string): Promise<Job[]> {
  const res = await api.get<Job[]>(`/companies/${companyId}/jobs`);
  return res.data;
}

export async function createCompany(token: string, data: CreateCompanyDto): Promise<Company> {
  const client = createAuthClient(token);
  const res    = await client.post<Company>('/companies', data);
  return res.data;
}
