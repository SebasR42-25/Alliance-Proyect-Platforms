'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Zap, ChevronRight, MessageSquare, UserPlus } from 'lucide-react';
import { getNetwork, sendConnectionRequest } from '@/services/users.service';
import { createConversation } from '@/services/chat.service';
import { showToast } from '@/lib/toast';
import type { User } from '@/types';

const MOCK_RECRUITERS = [
  { id: 'm1', name: 'Sabrina Williams',  role: 'HR Management',               company: 'ACG Automation Consulting Group at Apple',      hiring: 'Consulting, IT, and Software Development', photo: null },
  { id: 'm2', name: 'Peggy Hurtado',     role: 'Senior Project Manager',       company: 'Palantir Headhunter',                           hiring: 'Consulting, IT, and Software Development', photo: null },
  { id: 'm3', name: 'Maria Kluivert',    role: 'Senior Recruitment Consultant', company: 'Riverstate International, Consulting Microsoft', hiring: 'Industry and Engineering',                photo: null },
  { id: 'm4', name: 'Kirsten M. Kern',   role: 'HR Specialist',                company: 'Unknown',                                       hiring: 'Internet and Information Technology',      photo: null },
];

function RecruiterCard({
  user,
  token,
}: {
  user: { _id?: string; id?: string; name: string; role?: string; company?: string; hiring?: string; profilePicture?: string | null };
  token?: string;
}) {
  const qc     = useQueryClient();
  const router = useRouter();
  const userId = user._id ?? user.id ?? '';

  const connectMutation = useMutation({
    mutationFn: () => sendConnectionRequest(token!, userId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['network'] });
      showToast({ message: 'Connection request sent', sub: user.name, type: 'success' });
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => createConversation(token!, userId),
    onSuccess:  () => {
      showToast({ message: 'Opening chat', sub: user.name, type: 'info' });
      router.push(`/chat?with=${userId}`);
    },
  });

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
      <div className="relative">
        {user.profilePicture
          ? <img src={user.profilePicture} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
          : (
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-200 to-pink-200 flex items-center justify-center text-violet-700 font-black text-xl">
              {initials}
            </div>
          )
        }
        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
      </div>

      <span className="bg-brand-lime text-gray-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
        Hiring
      </span>

      <div>
        <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
        {user.role    && <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>}
        {user.company && <p className="text-[10px] text-gray-400 mt-0.5">{user.company}</p>}
      </div>

      {user.hiring && (
        <p className="text-[10px] text-gray-500 flex items-start gap-1">
          <Zap size={11} className="text-brand-lime shrink-0 mt-0.5" />
          <span>Hiring for {user.hiring}</span>
        </p>
      )}

      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => token && connectMutation.mutate()}
          disabled={!token || connectMutation.isPending || connectMutation.isSuccess}
          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <UserPlus size={12} />
          {connectMutation.isSuccess ? 'Sent ✓' : 'Connect'}
        </button>
        <button
          onClick={() => token && messageMutation.mutate()}
          disabled={!token || messageMutation.isPending || !userId}
          className="flex-1 flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-40"
        >
          <MessageSquare size={12} />
          {messageMutation.isPending ? '...' : 'Message'}
        </button>
      </div>
    </div>
  );
}

export default function NetworkingPage() {
  const { data: session } = useSession();
  const token             = session?.accessToken;

  const { data: networkUsers = [], isLoading } = useQuery({
    queryKey:  ['network'],
    enabled:   !!token,
    queryFn:   () => getNetwork(token!),
    staleTime: 60_000,
  });

  const realRecruiters = networkUsers.slice(0, 8).map((u: User) => ({
    _id:            u._id,
    name:           u.name,
    role:           u.bio ?? 'Professional',
    company:        u.location ?? '',
    hiring:         u.skills?.slice(0, 2).join(', ') ?? '',
    profilePicture: u.profilePicture,
  }));

  const recruiters = realRecruiters.length > 0 ? realRecruiters : MOCK_RECRUITERS;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center mb-10">
        <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
          Having a professional profile on{' '}
          <span className="font-black text-gray-900">ALLIANCE</span>{' '}
          significantly increases your chances of being found by HR professionals.
        </p>
        <Link
          href="/profile"
          className="mt-5 flex items-center gap-2 bg-brand-lime text-gray-900 font-bold px-6 py-2.5 rounded-full hover:brightness-95 transition-all text-sm"
        >
          <Users size={16} />
          Sign in now!
        </Link>
      </div>

      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            Are you looking for a part-time or full-time remote position?
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Network directly with employers offering remote work or other flexible arrangements
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors shrink-0">
          See next <ChevronRight size={14} />
        </button>
      </div>

      {isLoading && !token ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recruiters.map((r) => (
            <RecruiterCard key={'_id' in r ? r._id : r.id} user={r} token={token} />
          ))}
        </div>
      )}

      {!token && (
        <div className="mt-8 bg-brand-pink rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-700 font-semibold mb-2">
            Sign in to connect and message recruiters
          </p>
          <Link href="/login" className="inline-block bg-gray-900 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-gray-700 transition-colors">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
