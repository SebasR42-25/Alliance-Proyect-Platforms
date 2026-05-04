'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Briefcase, Building2, Users, MessageCircle,
  Film, HelpCircle, LayoutGrid, Bell, LogOut, User,
  Search, X, MapPin, UserCheck, UserX, CheckCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuthClient, api } from '@/lib/api';
import { acceptConnection, rejectConnection } from '@/services/users.service';
import type { User as UserType } from '@/types';

const NAV_LINKS = [
  { href: '/jobs',       label: 'Job Offers',  icon: Briefcase    },
  { href: '/companies',  label: 'Companies',   icon: Building2    },
  { href: '/networking', label: 'Networking',  icon: Users        },
  { href: '/chat',       label: 'Chat',        icon: MessageCircle },
  { href: '/reels',      label: 'Reels',       icon: Film         },
  { href: '/help',       label: 'Help',        icon: HelpCircle   },
  { href: '/',           label: 'Posts',       icon: LayoutGrid   },
];

interface SearchResults {
  results: {
    users: UserType[];
    jobs: { _id: string; title: string; location: string; tags: string[]; company?: { name: string } }[];
    totalFound: number;
  };
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const router       = useRouter();
  const inputRef     = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey:  ['search', debouncedQ],
    enabled:   debouncedQ.trim().length >= 2,
    queryFn:   () => api.get('/users/search', { params: { q: debouncedQ } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const users = data?.results?.users ?? [];
  const jobs  = data?.results?.jobs ?? [];
  const total = data?.results?.totalFound ?? 0;

  function navigate(path: string) {
    router.push(path);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, companies, people, tags…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <button onClick={onClose} className="text-xs text-gray-400 font-semibold hover:text-gray-600 shrink-0 ml-1">
            Esc
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isFetching && (
            <div className="px-4 py-6 text-center">
              <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!isFetching && debouncedQ.length >= 2 && total === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{debouncedQ}&rdquo;
            </div>
          )}

          {users.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">People</p>
              {users.slice(0, 4).map((u) => (
                <button key={u._id} onClick={() => navigate('/networking')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-xs shrink-0 overflow-hidden">
                    {u.profilePicture ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.skills?.slice(0, 2).join(' · ') || u.location || 'Alliance member'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {jobs.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Jobs</p>
              {jobs.slice(0, 4).map((j) => (
                <button key={j._id} onClick={() => navigate('/jobs')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Briefcase size={15} className="text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{j.title}</p>
                    <div className="flex items-center gap-2">
                      {j.company?.name && <span className="text-xs text-gray-500 truncate">{j.company.name}</span>}
                      {j.location && <span className="flex items-center gap-0.5 text-xs text-gray-400"><MapPin size={9} />{j.location}</span>}
                    </div>
                    {j.tags?.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {j.tags.slice(0, 3).map((t) => <span key={t} className="bg-violet-50 text-violet-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!debouncedQ && (
            <div className="px-4 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Find Jobs',     href: '/jobs',       icon: Briefcase    },
                  { label: 'Companies',     href: '/companies',  icon: Building2    },
                  { label: 'Network',       href: '/networking', icon: Users        },
                  { label: 'Messages',      href: '/chat',       icon: MessageCircle },
                ].map(({ label, href, icon: Icon }) => (
                  <button key={href} onClick={() => navigate(href)}
                    className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 transition-all text-left">
                    <Icon size={14} className="text-violet-400" />
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{total} result{total !== 1 ? 's' : ''} found</span>
            <button onClick={() => navigate(`/jobs?q=${debouncedQ}`)} className="text-xs text-violet-600 font-semibold hover:underline">
              View all →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<UserType[]>({
    queryKey:  ['notification-requests'],
    queryFn:   async () => {
      const client = createAuthClient(token);
      const res    = await client.get<UserType[]>('/notifications/requests');
      return res.data;
    },
    staleTime: 10_000,
  });

  const acceptMutation = useMutation({
    mutationFn: (senderId: string) => acceptConnection(token, senderId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notification-requests'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (senderId: string) => rejectConnection(token, senderId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notification-requests'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-violet-500" />
          <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && requests.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <CheckCheck size={28} className="text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">You're all caught up!</p>
            <p className="text-xs text-gray-300">No pending connection requests.</p>
          </div>
        )}

        {requests.map((u) => (
          <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0 overflow-hidden">
              {u.profilePicture
                ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                : u.name.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{u.bio ?? 'wants to connect with you'}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => acceptMutation.mutate(u._id)}
                disabled={acceptMutation.isPending}
                className="p-1.5 bg-brand-lime hover:brightness-95 rounded-lg transition-all"
                title="Accept"
              >
                <UserCheck size={14} className="text-gray-900" />
              </button>
              <button
                onClick={() => rejectMutation.mutate(u._id)}
                disabled={rejectMutation.isPending}
                className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-gray-500"
                title="Reject"
              >
                <UserX size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {requests.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <Link href="/networking" onClick={onClose} className="text-xs text-violet-600 font-semibold hover:underline">
            View all in Networking →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname          = usePathname();
  const { data: session } = useSession();
  const [showSearch, setShowSearch]   = useState(false);
  const [showNotifs, setShowNotifs]   = useState(false);
  const notifRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    enabled:  !!session?.accessToken,
    staleTime: 30_000,
    queryFn:  async () => {
      const client = createAuthClient(session!.accessToken!);
      const res    = await client.get<{ count: number }>('/notifications/unread-count');
      return res.data;
    },
  });

  const unreadCount = notifData?.count ?? 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-brand-pink/80 backdrop-blur-md border-b border-pink-200 h-16">
        <nav className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-black text-gray-900 tracking-tight">Alliance</span>
            <span className="text-xl" aria-hidden>🤝</span>
          </Link>

          <button
            onClick={() => setShowSearch(true)}
            className="hidden md:flex items-center gap-2 bg-white/60 hover:bg-white/80 border border-pink-200 rounded-xl px-3 py-1.5 text-sm text-gray-400 transition-all min-w-40"
          >
            <Search size={14} />
            <span className="flex-1 text-left text-xs">Search…</span>
            <span className="text-[10px] text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-white/70 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowSearch(true)} className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors">
              <Search size={20} className="text-gray-700" strokeWidth={1.8} />
            </button>
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifs((v) => !v)}
                className="relative p-2 rounded-xl hover:bg-white/50 transition-colors"
              >
                <Bell size={20} className="text-gray-700" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && session?.accessToken && (
                <NotificationsPanel token={session.accessToken} onClose={() => setShowNotifs(false)} />
              )}
            </div>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  {session.user.image
                    ? <img src={session.user.image} alt={session.user.name ?? 'avatar'} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow cursor-pointer hover:opacity-90" />
                    : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-90"><User size={16} className="text-gray-500" /></div>
                  }
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-xl hover:bg-white/50 transition-colors text-gray-600 hover:text-red-500"
                  title="Sign out"
                >
                  <LogOut size={18} strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-brand-lime text-gray-900 font-bold text-sm px-4 py-1.5 rounded-full hover:brightness-95 transition-all">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
