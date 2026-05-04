'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, CheckCircle2, Circle, ChevronRight,
  MoreHorizontal, Pencil, X, Plus, Camera,
  Briefcase, Award, Building2, Tag,
} from 'lucide-react';
import { getMe, updateMe } from '@/services/users.service';
import { uploadImage } from '@/services/upload.service';
import { showToast } from '@/lib/toast';
import type { User } from '@/types';

type CompletionKey = 'name' | 'skills' | 'location' | 'bio' | 'picture' | 'connections' | 'seniority' | 'specialization' | 'sector';

const COMPLETION_KEYS: { label: string; key: CompletionKey; modal: string }[] = [
  { label: 'Name',                  key: 'name',           modal: 'basic'    },
  { label: 'Add at least 5 skills', key: 'skills',         modal: 'skills'   },
  { label: 'Location',              key: 'location',       modal: 'basic'    },
  { label: 'Job Description',       key: 'bio',            modal: 'job'      },
  { label: 'Seniority level',       key: 'seniority',      modal: 'job'      },
  { label: 'Specialization',        key: 'specialization', modal: 'job'      },
  { label: 'Sector',                key: 'sector',         modal: 'job'      },
];

function buildCompletionItems(user?: User) {
  return COMPLETION_KEYS.map((item) => {
    let done = false;
    if (!user) return { ...item, done };
    switch (item.key) {
      case 'name':           done = !!user.name; break;
      case 'skills':         done = (user.skills?.length ?? 0) >= 5; break;
      case 'location':       done = !!user.location; break;
      case 'bio':            done = !!user.bio; break;
      case 'picture':        done = !!user.profilePicture; break;
      case 'connections':    done = (user.connections?.length ?? 0) > 0; break;
      case 'seniority':      done = !!user.seniority; break;
      case 'specialization': done = !!user.specialization; break;
      case 'sector':         done = !!user.sector; break;
    }
    return { ...item, done };
  });
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function BasicInfoModal({ user, token, onClose }: { user: User; token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: user.name ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
  });

  const mutation = useMutation({
    mutationFn: () => updateMe(token, form),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      showToast({ message: 'Basic info updated', sub: form.name, type: 'success' });
      onClose();
    },
  });

  return (
    <Modal title="Basic Information" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Bio / Job Description</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            placeholder="Brief description of who you are professionally"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            placeholder="City, Country"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

function SkillsModal({ user, token, onClose }: { user: User; token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [input, setInput]   = useState('');

  const mutation = useMutation({
    mutationFn: () => updateMe(token, { skills }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      showToast({ message: 'Skills updated', sub: `${skills.length} skills saved`, type: 'success' });
      onClose();
    },
  });

  const addSkill = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setInput('');
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  return (
    <Modal title="Skills" onClose={onClose}>
      <p className="text-xs text-gray-400 mb-4">Add at least 5 skills to complete this section.</p>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="e.g. React, NestJS, TypeScript"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button onClick={addSkill} className="p-2 bg-brand-lime rounded-xl hover:brightness-95">
          <Plus size={18} className="text-gray-900" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-15 bg-gray-50 rounded-xl p-3 mb-5">
        {skills.length === 0 && <span className="text-xs text-gray-400">No skills yet. Type one above and press Enter.</span>}
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {s}
            <button onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : `Save (${skills.length} skills)`}
        </button>
      </div>
    </Modal>
  );
}

const SENIORITY_OPTIONS = ['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Principal', 'Manager', 'Director'];
const SPECIALIZATION_OPTIONS = ['Frontend Development', 'Backend Development', 'Full Stack', 'DevOps / SRE', 'Data Science', 'Machine Learning', 'Product Management', 'UX/UI Design', 'Cybersecurity', 'Cloud Architecture'];
const SECTOR_OPTIONS = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Consulting', 'Media & Entertainment', 'Manufacturing', 'Government', 'NGO / Nonprofit'];

function JobDetailsModal({ user, token, onClose }: { user: User; token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    bio:            user.bio ?? '',
    seniority:      user.seniority ?? '',
    specialization: user.specialization ?? '',
    sector:         user.sector ?? '',
  });

  const mutation = useMutation({
    mutationFn: () => updateMe(token, form),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      showToast({ message: 'Professional details updated', sub: [form.seniority, form.specialization].filter(Boolean).join(' · ') || undefined, type: 'success' });
      onClose();
    },
  });

  const selectClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 bg-white";

  return (
    <Modal title="Professional Details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            <Briefcase size={12} className="inline mr-1" />Job Description / Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            placeholder="Describe your professional profile..."
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            <Award size={12} className="inline mr-1" />Seniority Level
          </label>
          <select value={form.seniority} onChange={(e) => setForm({ ...form, seniority: e.target.value })} className={selectClass}>
            <option value="">Select seniority level</option>
            {SENIORITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            <Tag size={12} className="inline mr-1" />Specialization
          </label>
          <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={selectClass}>
            <option value="">Select specialization</option>
            {SPECIALIZATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            <Building2 size={12} className="inline mr-1" />Sector
          </label>
          <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={selectClass}>
            <option value="">Select sector</option>
            {SECTOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </Modal>
  );
}

function AvatarModal({ user, token, onClose }: { user: User; token: string; onClose: () => void }) {
  const qc       = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview,    setPreview]    = useState<string | null>(user.profilePicture ?? null);
  const [url,        setUrl]        = useState(user.profilePicture ?? '');
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');

  const mutation = useMutation({
    mutationFn: () => updateMe(token, { profilePicture: url }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      showToast({ message: 'Profile photo updated', type: 'success' });
      onClose();
    },
  });

  async function handleFile(f: File) {
    setUploadErr('');
    setUploading(true);
    setPreview(URL.createObjectURL(f));
    try {
      const { url: cloudUrl } = await uploadImage(token, f);
      setUrl(cloudUrl);
    } catch {
      setUploadErr('Upload failed. Try pasting a URL instead.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title="Profile Picture" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative w-28 h-28 rounded-2xl overflow-hidden bg-violet-100 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => inputRef.current?.click()}
        >
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-violet-400">{user.name.charAt(0)}</div>
          }
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {uploading
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={24} className="text-white" />
            }
          </div>
        </div>
        <p className="text-xs text-gray-400">Click to upload a photo (Cloudinary)</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}
        <div className="w-full">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Or paste image URL</label>
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(e.target.value); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            placeholder="https://..."
          />
        </div>
        {url && <p className="text-[10px] text-green-600 font-semibold">✓ Image ready to save</p>}
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !url || uploading}
          className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : uploading ? 'Uploading...' : 'Save Photo'}
        </button>
      </div>
    </Modal>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={pct >= 80 ? '#84cc16' : pct >= 50 ? '#f59e0b' : '#8b5cf6'}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-gray-900">{pct}%</span>
      </div>
    </div>
  );
}

type ModalType = 'basic' | 'skills' | 'job' | 'avatar' | null;

export default function ProfilePage() {
  const { data: session }    = useSession();
  const token                = session?.accessToken;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data: user, isLoading } = useQuery({
    queryKey:  ['me'],
    enabled:   !!token,
    queryFn:   () => getMe(token!),
    staleTime: 60_000,
  });

  const displayName = user?.name ?? session?.user?.name ?? 'Your name';
  const displayPic  = user?.profilePicture ?? session?.user?.image;
  const location    = user?.location ?? 'No location set';

  const completionItems = buildCompletionItems(user);
  const doneCount       = completionItems.filter((i) => i.done).length;
  const completionPct   = Math.round((doneCount / completionItems.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-black text-gray-900 text-base">A bit more…</p>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xs">
              Highlight your strengths and experience. More detail means a stronger professional footprint.
            </p>
          </div>
          <ScoreRing pct={completionPct} />
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${completionPct}%`,
              background: completionPct >= 80 ? '#84cc16' : completionPct >= 50 ? '#f59e0b' : '#8b5cf6',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          {completionItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveModal(item.modal as ModalType)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5">
                {item.done
                  ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  : <Circle size={16} className="text-orange-400 shrink-0" />
                }
                <span className={`text-sm ${item.done ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                  {item.label}
                </span>
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all
                ${item.done
                  ? 'text-gray-400 group-hover:text-violet-600 group-hover:bg-violet-50'
                  : 'text-violet-600 bg-violet-50 group-hover:bg-violet-100'
                }`}>
                {item.done ? 'Edit' : 'Complete'} <ChevronRight size={11} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-36 bg-linear-to-br from-violet-100 via-gray-100 to-pink-100 relative">
          <div className="absolute right-12 top-4 w-20 h-20 bg-white/30 rounded-full" />
          <div className="absolute right-4  top-10 w-12 h-12 bg-white/20 rounded-full" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-14 mb-4">
            <button
              onClick={() => setActiveModal('avatar')}
              className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-violet-200 hover:opacity-90 transition-opacity group"
            >
              {displayPic
                ? <img src={displayPic} alt={displayName} className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-3xl font-black text-violet-700">{displayName.charAt(0)}</span>
              }
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setActiveModal('basic')}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Pencil size={12} />
                Edit profile
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-64" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900">{displayName}</h1>
                {(user?.skills?.length ?? 0) >= 5 && (
                  <span className="bg-brand-lime text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              {user?.seniority && user?.specialization && (
                <p className="text-sm text-violet-600 font-semibold mt-0.5">
                  {user.seniority} {user.specialization}
                </p>
              )}
              {user?.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} />{location}
                </p>
                {user?.sector && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Building2 size={12} />{user.sector}
                  </p>
                )}
              </div>
              {(user?.skills?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {user!.skills.slice(0, 10).map((s) => (
                    <span key={s} className="bg-violet-50 text-violet-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-violet-100">
                      {s}
                    </span>
                  ))}
                  {(user?.skills?.length ?? 0) > 10 && (
                    <button onClick={() => setActiveModal('skills')} className="text-[11px] text-violet-500 font-semibold px-2.5 py-0.5 rounded-full border border-violet-100 hover:bg-violet-50">
                      +{user!.skills.length - 10} more
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{user?.connections?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{user?.skills?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Skills</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black" style={{ color: completionPct >= 80 ? '#84cc16' : completionPct >= 50 ? '#f59e0b' : '#8b5cf6' }}>
                {completionPct}%
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Profile Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Pencil,    label: 'Basic Info',  modal: 'basic'  as ModalType },
          { icon: Tag,       label: 'Skills',       modal: 'skills' as ModalType },
          { icon: Briefcase, label: 'Job Details',  modal: 'job'    as ModalType },
        ].map(({ icon: Icon, label, modal }) => (
          <button
            key={label}
            onClick={() => setActiveModal(modal)}
            className="flex items-center gap-2 justify-center border border-gray-200 bg-white text-gray-700 text-xs font-semibold px-3 py-3 rounded-xl hover:bg-gray-50 hover:border-violet-200 transition-all shadow-sm"
          >
            <Icon size={14} className="text-violet-500" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-linear-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 p-6 text-center">
        <p className="text-xs text-violet-500 font-bold mb-1">Search for staff</p>
        <h2 className="text-base font-black text-gray-900 mb-1">
          Hello, {displayName.split(' ')[0]}! On the lookout for new talent?
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Define your ideal candidate profiles on Alliance and attract top talent
        </p>
        <a
          href="/networking"
          className="inline-flex items-center gap-2 bg-violet-600 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-violet-700 transition-colors"
        >
          Explore Network
        </a>
      </div>

      {!token && (
        <div className="bg-brand-pink rounded-2xl p-8 text-center">
          <p className="text-gray-700 font-semibold mb-3">Sign in to view your full profile</p>
          <a href="/login" className="inline-block bg-gray-900 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-gray-700 transition-colors">
            Sign in
          </a>
        </div>
      )}

      {token && user && activeModal === 'basic'  && <BasicInfoModal  user={user} token={token} onClose={() => setActiveModal(null)} />}
      {token && user && activeModal === 'skills' && <SkillsModal     user={user} token={token} onClose={() => setActiveModal(null)} />}
      {token && user && activeModal === 'job'    && <JobDetailsModal user={user} token={token} onClose={() => setActiveModal(null)} />}
      {token && user && activeModal === 'avatar' && <AvatarModal     user={user} token={token} onClose={() => setActiveModal(null)} />}
    </div>
  );
}
