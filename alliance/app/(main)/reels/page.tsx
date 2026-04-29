'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Home, Radio, Users, Search,
  Heart, MessageCircle, Share2, Volume2, VolumeX,
  Plus, X, Upload, Briefcase, MapPin, Tag, Building2,
  Music2,
} from 'lucide-react';
import { getReels, uploadReel } from '@/services/reels.service';
import { getUsers } from '@/services/users.service';
import { getCompanies } from '@/services/companies.service';
import { createJob } from '@/services/jobs.service';
import type { Reel, User } from '@/types';

/* ─── Mock data ──────────────────────────────────────────── */
type MockUser = { name: string; handle: string };
const MOCK_SUGGESTED: MockUser[] = [
  { name: 'X_AE_A-13',       handle: '@xtheobliterator'    },
  { name: 'Mai Senpai',       handle: '@sakurajima_senpai'  },
  { name: 'Vermilion D. White', handle: '@vermilionwhite'   },
  { name: 'Oarack Babama',    handle: '@oarackbabama'       },
  { name: 'Saylor Twift',     handle: '@saylortwiftofficial'},
];
const MOCK_FOLLOWING: MockUser[] = [
  { name: 'Azunyan U. Wu',    handle: '@aurynyansenpai' },
  { name: 'Julie Green',      handle: '@juliegreen'     },
  { name: 'Sophie Brown',     handle: '@shophiebrown2241'},
  { name: 'Walter D. White',  handle: '@gmethisking22'  },
];
const COLORS = ['bg-violet-200','bg-pink-200','bg-blue-200','bg-green-200','bg-yellow-200','bg-orange-200','bg-teal-200','bg-rose-200'];

/* ─── Left sidebar ───────────────────────────────────────── */
function ReelsSidebar({ users }: { users: User[] }) {
  const suggested = users.slice(0, 5);
  const following  = users.slice(5, 9);

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      {[
        { label: 'For You',     icon: Home,  active: true  },
        { label: 'Following',   icon: Users, active: false },
        { label: 'Live Stream', icon: Radio, active: false },
      ].map(({ label, icon: Icon, active }) => (
        <button key={label}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
          }`}
        >
          <Icon size={18} strokeWidth={1.8} />
          {label}
        </button>
      ))}

      <hr className="my-3 border-gray-100" />

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 mb-1">Suggested Accounts</p>
      {(suggested.length > 0 ? suggested : MOCK_SUGGESTED).map((u, i) => {
        const name   = 'name' in u ? u.name : (u as MockUser).name;
        const handle = 'handle' in (u as MockUser) ? (u as MockUser).handle : `@${(u as User).name.toLowerCase().replace(/\s+/g, '_')}`;
        const pic    = 'profilePicture' in u ? (u as User).profilePicture : undefined;
        const color  = COLORS[i % COLORS.length];
        return (
          <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shrink-0 overflow-hidden ${!pic ? color : ''}`}>
              {pic ? <img src={pic} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
              <p className="text-[10px] text-gray-400 truncate">{handle}</p>
            </div>
          </button>
        );
      })}
      <button className="text-xs text-violet-600 font-semibold px-3 py-1 hover:underline text-left">See All</button>

      <hr className="my-3 border-gray-100" />

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 mb-1">Following Accounts</p>
      {(following.length > 0 ? following : MOCK_FOLLOWING).map((u, i) => {
        const name   = 'name' in u ? u.name : (u as MockUser).name;
        const handle = 'handle' in (u as MockUser) ? (u as MockUser).handle : `@${(u as User).name.toLowerCase().replace(/\s+/g, '_')}`;
        const pic    = 'profilePicture' in u ? (u as User).profilePicture : undefined;
        const color  = COLORS[(i + 5) % COLORS.length];
        return (
          <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shrink-0 overflow-hidden ${!pic ? color : ''}`}>
              {pic ? <img src={pic} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
              <p className="text-[10px] text-gray-400 truncate">{handle}</p>
            </div>
          </button>
        );
      })}
    </aside>
  );
}

/* ─── Reel card (matches design reference layout) ────────── */
function ReelCard({ reel, myId }: { reel: Reel; myId?: string }) {
  const videoRef          = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);

  const authorName   = reel.author && typeof reel.author === 'object' ? (reel.author as User).name : 'User';
  const authorHandle = `@${authorName.toLowerCase().replace(/\s+/g, '_')}`;
  const authorPic    = reel.author && typeof reel.author === 'object' ? (reel.author as User).profilePicture : undefined;

  return (
    <article className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-violet-300 border-2 border-violet-400 overflow-hidden shrink-0">
          {authorPic
            ? <img src={authorPic} alt={authorName} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-violet-700">{authorName.charAt(0)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900">{authorName}</span>
          <span className="text-xs text-violet-500 ml-1.5">{authorHandle}</span>
        </div>
        <button className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
          Following
        </button>
      </div>

      {reel.caption && <p className="text-sm text-gray-700 mb-1 leading-snug">{reel.caption}</p>}
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
        <Music2 size={11} className="text-gray-400" />
        Original Sound — {authorName}
      </p>

      <div className="flex items-end gap-4">
        <div className="relative bg-black rounded-2xl overflow-hidden shrink-0" style={{ width: 320, height: 420 }}>
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            loop autoPlay muted={muted} playsInline
          />
          <button
            onClick={() => setMuted(!muted)}
            className="absolute bottom-3 right-3 p-1.5 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <div className="flex flex-col items-center gap-5 pb-2">
          <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-red-100' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
            </div>
            <span className="text-xs text-gray-600 font-semibold">{((reel.likesCount ?? 0) + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <MessageCircle size={20} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">544</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">108</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Placeholder reel card ──────────────────────────────── */
function PlaceholderCard({ index }: { index: number }) {
  const [liked, setLiked] = useState(false);
  const BG = ['bg-slate-700', 'bg-gray-800', 'bg-zinc-800'];
  const MOCK_DATA = [
    { user: 'x_ae_b-449',  handle: '@xtheobliterator',   caption: 'Check out my latest dance move! #dance #trending', sound: 'Yellow Day',  likes: 187200 },
    { user: 'Mai Senpai',  handle: '@sakurajima_senpai',  caption: 'Do androids dream of electric sheep or not? #question #philosophy', sound: 'Dream Fever', likes: 92100 },
    { user: 'Oarack Babama', handle: '@oarackbabama',     caption: 'Amazing sunset at the office today 🌅 #worklife', sound: 'Chill Vibes',  likes: 45800 },
  ];
  const data = MOCK_DATA[index % MOCK_DATA.length];

  return (
    <article className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-violet-400 border-2 border-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {data.user.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900">{data.user}</span>
          <span className="text-xs text-violet-500 ml-1.5">{data.handle}</span>
        </div>
        <button className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
          Follow
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-1 leading-snug">{data.caption}</p>
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
        <Music2 size={11} />
        Original Sound — {data.sound}
      </p>

      <div className="flex items-end gap-4">
        <div className={`relative ${BG[index % BG.length]} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center`} style={{ width: 320, height: 420 }}>
          <div className="text-white/20 text-6xl font-black">▶</div>
          <div className="absolute bottom-3 right-3 p-1.5 bg-black/40 rounded-full text-white/60">
            <VolumeX size={14} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 pb-2">
          <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-red-100' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
            </div>
            <span className="text-xs text-gray-600 font-semibold">{(data.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <MessageCircle size={20} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">544</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">108</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Upload Reel Modal ──────────────────────────────────── */
function UploadModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile]       = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => uploadReel(token, file!, caption || undefined),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['reels'] }); onClose(); },
  });

  function handleFile(f: File) { setFile(f); setPreview(URL.createObjectURL(f)); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Upload Reel</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <button onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-6 hover:border-violet-400 hover:bg-violet-50 transition-colors">
            {preview
              ? <video src={preview} className="h-36 rounded-lg object-cover" muted />
              : (<><Upload size={28} className="text-gray-400" /><span className="text-sm text-gray-500">Click to select a video</span><span className="text-xs text-gray-400">MP4, MOV, WebM</span></>)
            }
          </button>
          <input ref={inputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption… #hashtags" rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
          {isError && <p className="text-xs text-red-500">{(error as Error).message}</p>}
          <button disabled={!file || isPending} onClick={() => mutate()}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
            {isPending ? 'Uploading…' : 'Publish Reel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Job Post Modal ───────────────────────────────── */
function QuickJobModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', company: '', location: '', tagsInput: '' });

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies, staleTime: 120_000 });
  const tags = form.tagsInput.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);

  const mutation = useMutation({
    mutationFn: () => createJob(token, { title: form.title, company: form.company, location: form.location, tags: tags.length > 0 ? tags : undefined }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['jobs'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-violet-500" />
            <h2 className="font-bold text-sm text-gray-900">Quick Job Post</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Job Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Full Stack Developer"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block"><Building2 size={10} className="inline mr-0.5" />Company *</label>
            <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300 bg-white">
              <option value="">Select company</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block"><MapPin size={10} className="inline mr-0.5" />Location *</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Remote, Bogotá, NYC…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block"><Tag size={10} className="inline mr-0.5" />Skills / Tags</label>
            <input value={form.tagsInput} onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="React, Node.js, TypeScript"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          {mutation.isError && <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>}
          <div className="flex gap-2 mt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            <button
              disabled={!form.title || !form.company || !form.location || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="flex-1 bg-brand-lime text-gray-900 font-black py-2 rounded-xl hover:brightness-95 disabled:opacity-50 text-sm"
            >
              {mutation.isPending ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ReelsPage() {
  const { data: session } = useSession();
  const token             = session?.accessToken;
  const myId              = session?.user?.id;
  const [modal, setModal] = useState<'reel' | 'job' | null>(null);

  const { data: reels = [] } = useQuery({ queryKey: ['reels'], queryFn: getReels, staleTime: 60_000 });
  const { data: users = [] } = useQuery({ queryKey: ['users-all'], queryFn: getUsers, staleTime: 120_000 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex gap-8">
      <ReelsSidebar users={users} />

      <main className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts and videos"
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
            />
          </div>
          {session?.user && (
            <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0 overflow-hidden">
              {session.user.image
                ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                : session.user.name?.charAt(0).toUpperCase() ?? 'U'
              }
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {reels.length > 0
            ? reels.map((r) => <ReelCard key={r._id} reel={r} myId={myId} />)
            : Array.from({ length: 3 }).map((_, i) => <PlaceholderCard key={i} index={i} />)
          }
        </div>
      </main>

      {token && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
          <button
            onClick={() => setModal('job')}
            title="Post a job"
            className="w-12 h-12 bg-brand-lime hover:brightness-95 text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all"
          >
            <Briefcase size={20} />
          </button>
          <button
            onClick={() => setModal('reel')}
            title="Upload reel"
            className="w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      {modal === 'reel' && token && <UploadModal token={token}  onClose={() => setModal(null)} />}
      {modal === 'job'  && token && <QuickJobModal token={token} onClose={() => setModal(null)} />}
    </div>
  );
}
