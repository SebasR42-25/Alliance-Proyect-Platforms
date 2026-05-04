'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Search, Bookmark, BookmarkCheck, MapPin, DollarSign,
  Plus, X, Briefcase, Tag, Building2,
} from 'lucide-react';
import { getJobs, saveJob, applyToJob, createJob } from '@/services/jobs.service';
import { getCompanies } from '@/services/companies.service';
import { showToast } from '@/lib/toast';
import CompanyLogo from '@/components/ui/company-logo';
import type { Job, Company } from '@/types';

function CreateJobModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title:       '',
    company:     '',
    location:    '',
    salaryRange: '',
    description: '',
    tagsInput:   '',
  });

  const { data: companies = [] } = useQuery({
    queryKey:  ['companies'],
    queryFn:   getCompanies,
    staleTime: 120_000,
  });

  const tags = form.tagsInput.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);

  const mutation = useMutation({
    mutationFn: () => createJob(token, {
      title:       form.title,
      company:     form.company,
      location:    form.location,
      salaryRange: form.salaryRange || undefined,
      description: form.description || undefined,
      tags:        tags.length > 0 ? tags : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      showToast({ message: 'Job posted successfully', sub: form.title, type: 'success' });
      onClose();
    },
  });

  const field = (label: string, key: keyof typeof form, type: string = 'text', placeholder = '') => (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-violet-500" />
            <h2 className="font-black text-gray-900">Post a Job</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {field('Job Title *', 'title', 'text', 'e.g. Full Stack Developer')}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              <Building2 size={11} className="inline mr-1" />Company *
            </label>
            <select
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            >
              <option value="">Select a company</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              Don't see the company?{' '}
              <a href="/companies" className="text-violet-500 hover:underline">Create it first →</a>
            </p>
          </div>

          {field('Location *', 'location', 'text', 'e.g. Remote, New York, Bogotá')}
          {field('Salary Range', 'salaryRange', 'text', 'e.g. $60,000 – $90,000 / year')}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Job Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe responsibilities, requirements, and what makes this role great..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              <Tag size={11} className="inline mr-1" />Skills / Tags
            </label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="React, TypeScript, Node.js (comma or space separated)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => <span key={t} className="bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
            )}
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 sticky bottom-0 bg-white rounded-b-3xl pt-2 border-t border-gray-50">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button
            disabled={!form.title.trim() || !form.company || !form.location.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, token, userId }: { job: Job; token?: string; userId?: string }) {
  const qc      = useQueryClient();
  const company = job.company !== null && typeof job.company === 'object' ? job.company as Company : null;
  const [saved, setSaved] = useState(userId ? (job.savedBy?.includes(userId) ?? false) : false);

  const saveMutation = useMutation({
    mutationFn: () => saveJob(token!, job._id),
    onSuccess:  (d) => {
      setSaved(d.saved);
      showToast({
        message: d.saved ? 'Job saved to bookmarks' : 'Job removed from bookmarks',
        sub: `${job.title} · ${company?.name ?? ''}`,
        type: d.saved ? 'success' : 'info',
      });
    },
  });
  const applyMutation = useMutation({
    mutationFn: () => applyToJob(token!, job._id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      showToast({ message: 'Application sent!', sub: `${job.title} at ${company?.name ?? ''}`, type: 'success' });
    },
  });

  const hasApplied = userId ? (job.applicants?.includes(userId) ?? false) : false;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 p-1">
          <CompanyLogo name={company?.name ?? 'J'} domain={company?.domain} logoUrl={company?.logoUrl} size={40} />
        </div>
        <button onClick={() => token && saveMutation.mutate()} disabled={!token}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700 disabled:opacity-30">
          {saved ? <BookmarkCheck size={18} className="text-violet-500" /> : <Bookmark size={18} />}
        </button>
      </div>

      <div>
        <h3 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-violet-700 transition-colors">{job.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{company?.name ?? 'Company'}</p>
      </div>

      {job.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{job.description}</p>}

      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.tags.slice(0, 3).map((t) => (
            <span key={t} className="bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 mt-auto">
        {job.location && <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={11} /> {job.location}</span>}
        {job.salaryRange && <span className="flex items-center gap-1 text-[11px] text-gray-400"><DollarSign size={11} /> {job.salaryRange}</span>}
      </div>

      <button
        onClick={() => token && applyMutation.mutate()}
        disabled={!token || applyMutation.isPending || hasApplied}
        className="w-full bg-brand-lime hover:brightness-95 text-gray-900 font-bold text-xs py-2 rounded-xl transition-all disabled:opacity-50 mt-auto"
      >
        {hasApplied ? 'Applied ✓' : applyMutation.isPending ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between"><div className="w-12 h-12 bg-gray-200 rounded-xl" /><div className="w-6 h-6 bg-gray-100 rounded" /></div>
      <div className="space-y-1.5"><div className="h-3.5 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
      <div className="space-y-1"><div className="h-2.5 bg-gray-100 rounded" /><div className="h-2.5 bg-gray-100 rounded w-5/6" /></div>
    </div>
  );
}

export default function JobsPage() {
  const { data: session } = useSession();
  const token             = session?.accessToken;
  const userId            = session?.user?.id;
  const searchParams      = useSearchParams();
  const router            = useRouter();
  const companyFilter     = searchParams.get('company') ?? undefined;

  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: companies = [] } = useQuery({
    queryKey:  ['companies'],
    queryFn:   getCompanies,
    staleTime: 120_000,
  });

  const activeCompany = companyFilter
    ? companies.find((c) => c._id === companyFilter)
    : undefined;

  const { data: jobs = [], isLoading } = useQuery({
    queryKey:  ['jobs', search, companyFilter],
    queryFn:   () => getJobs({
      ...(search        ? { title:   search        } : {}),
      ...(companyFilter ? { company: companyFilter } : {}),
    }),
    staleTime: 60_000,
  });

  const filtered = search
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase()) ||
        j.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : jobs;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 leading-tight">
          Describe to Alliance Recruiters<br />
          What Type of Job You&apos;re Looking For
        </h1>
      </div>

      <div className="bg-brand-pink rounded-3xl p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">Over 1 million jobs to choose from</p>
            <p className="text-xs text-gray-500">You might also like:</p>
          </div>
          {token && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <Plus size={14} /> Post a Job
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location, or skill tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
            />
          </div>
          <button className="bg-brand-lime text-gray-900 font-bold px-6 py-3 rounded-xl hover:brightness-95 transition-all text-sm">
            Search
          </button>
        </div>
      </div>

      {activeCompany && (
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full">
            {(activeCompany.domain || activeCompany.logoUrl) && (
              <CompanyLogo name={activeCompany.name} domain={activeCompany.domain} logoUrl={activeCompany.logoUrl} size={20} className="rounded" />
            )}
            <Building2 size={14} />
            <span>Showing jobs at <strong>{activeCompany.name}</strong></span>
            <button
              onClick={() => router.push('/jobs')}
              className="ml-1 hover:text-violet-900 transition-colors"
              title="Clear filter"
            >
              <X size={14} />
            </button>
          </div>
          <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((job) => <JobCard key={job._id} job={job} token={token} userId={userId} />)
        }
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-3">No jobs found matching your search.</p>
          {token && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-brand-lime text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full hover:brightness-95 transition-all">
              <Plus size={16} /> Post the first job
            </button>
          )}
        </div>
      )}

      {token && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-brand-lime hover:brightness-95 text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all z-40"
          title="Post a job"
        >
          <Plus size={24} />
        </button>
      )}

      {showCreate && token && (
        <CreateJobModal token={token} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
