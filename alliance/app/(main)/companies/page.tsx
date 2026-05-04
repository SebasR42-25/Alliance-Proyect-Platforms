'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Plus, X, Building2, Tag } from 'lucide-react';
import { getCompanies, createCompany } from '@/services/companies.service';
import { showToast } from '@/lib/toast';
import CompanyLogo from '@/components/ui/company-logo';
import type { Company } from '@/types';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'E-commerce & Retail', 'Consulting', 'Media & Entertainment',
  'Manufacturing', 'Logistics', 'Government', 'Energy', 'Real Estate',
];

function CreateCompanyModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name:          '',
    description:   '',
    industry:      '',
    domain:        '',
    availableJobs: '',
  });

  const mutation = useMutation({
    mutationFn: () => createCompany(token, {
      name:          form.name,
      description:   form.description || undefined,
      industry:      form.industry || undefined,
      domain:        form.domain || undefined,
      availableJobs: form.availableJobs ? parseInt(form.availableJobs, 10) : 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      showToast({ message: 'Company created', sub: form.name, type: 'success' });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-violet-500" />
            <h2 className="font-black text-gray-900">Add Company</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {form.domain && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                <CompanyLogo name={form.name || '?'} domain={form.domain} size={48} />
              </div>
              <p className="text-xs text-gray-500">Logo preview via Logo.dev</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Company Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Apple, Google, Startup Inc."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Website Domain</label>
            <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="e.g. apple.com, google.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
            <p className="text-[10px] text-gray-400 mt-1">Used to fetch the company logo automatically</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Describe what the company does, its mission, and culture..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              <Tag size={11} className="inline mr-1" />Industry
            </label>
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 bg-white">
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Available Job Openings</label>
            <input type="number" min="0" value={form.availableJobs} onChange={(e) => setForm({ ...form, availableJobs: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>

          {mutation.isError && <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>}
        </div>

        <div className="flex gap-3 px-6 pb-6 sticky bottom-0 bg-white rounded-b-3xl pt-2 border-t border-gray-50">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button
            disabled={!form.name.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Adding...' : 'Add Company'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 p-2">
        <CompanyLogo name={company.name} domain={company.domain} logoUrl={company.logoUrl} size={64} />
      </div>

      {company.availableJobs > 0 && (
        <span className="text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full w-fit">
          Available {company.availableJobs} Openings
        </span>
      )}

      <div className="flex-1">
        <h3 className="font-bold text-gray-900 mb-1">{company.name}</h3>
        {company.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{company.description}</p>}
        {company.industry && <p className="text-xs text-gray-400 mt-1">{company.industry}</p>}
      </div>

      <Link
        href={`/jobs?company=${company._id}`}
        onClick={() => showToast({ message: `Viewing jobs at ${company.name}`, sub: `${company.availableJobs} open positions`, type: 'info' })}
        className="w-full text-center border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        See {company.availableJobs > 0 ? `${company.availableJobs} ` : ''}Offers
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse flex flex-col gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded-xl" />
      <div className="h-3 bg-gray-100 rounded w-24" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function CompaniesPage() {
  const { data: session }  = useSession();
  const token              = session?.accessToken;
  const [showCreate, setShowCreate] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey:  ['companies'],
    queryFn:   getCompanies,
    staleTime: 120_000,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 font-medium">Companies</span>
      </nav>

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Featured Employers on Alliance</h1>
          <p className="text-sm text-gray-500 mt-1">Discover the New Opportunities We Have for You</p>
        </div>
        <div className="flex items-center gap-2">
          {token && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-brand-lime text-gray-900 font-bold text-xs px-4 py-2.5 rounded-xl hover:brightness-95 transition-all"
            >
              <Plus size={14} /> Add Company
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowRight size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : companies.map((c) => <CompanyCard key={c._id} company={c} />)
        }
        {!isLoading && companies.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-400 text-sm mb-3">No companies registered yet.</p>
            {token && (
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-brand-lime text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full hover:brightness-95 transition-all">
                <Plus size={16} /> Add the first company
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-brand-lavender rounded-3xl p-8 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10 max-w-md">
          <p className="text-sm text-gray-600 mb-1">Compare your Salary with other Alliance Members in Similar Roles.</p>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Are you Receiving Fair Compensation?</h2>
          <p className="text-xs text-gray-500">What is your Full Time Salary Right Now?</p>
        </div>
        <div className="hidden md:flex flex-col items-center shrink-0 mr-8">
          <div className="bg-white rounded-2xl shadow-lg px-8 py-4 text-center">
            <p className="text-3xl font-black text-gray-900">60.000 €</p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-40 h-40 bg-violet-300/30 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-violet-400/20 rounded-full translate-y-1/2" />
      </div>

      {token && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-brand-lime hover:brightness-95 text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all z-40"
          title="Add company"
        >
          <Plus size={24} />
        </button>
      )}

      {showCreate && token && (
        <CreateCompanyModal token={token} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
