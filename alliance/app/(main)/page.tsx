'use client';

import { useState, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, PlusCircle, ThumbsUp, MessageCircle, Share2,
  Bookmark, MoreHorizontal, Send, Users, Settings,
  HelpCircle, Zap, BarChart2, BookOpen, Star, X, Hash,
  ImageIcon, Briefcase, Newspaper, MapPin, ExternalLink,
  Clock, ChevronRight, UserPlus, Camera, Loader2,
} from 'lucide-react';
import { getPosts, toggleLike, addComment, createPost } from '@/services/posts.service';
import { getNetwork }  from '@/services/users.service';
import { getStories }  from '@/services/stories.service';
import { getJobs }     from '@/services/jobs.service';
import { getTechNews } from '@/services/news.service';
import type { Post, User, Story, Job, NewsArticle } from '@/types';

/* ─── helpers ────────────────────────────────────────────── */
function UserAvatar({ user, size = 36 }: { user?: User | string | null; size?: number }) {
  const name = user && typeof user === 'object' ? user.name ?? 'U' : 'U';
  const pic  = user && typeof user === 'object' ? user.profilePicture : undefined;
  if (pic) return <img src={pic} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />;
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Left Sidebar ───────────────────────────────────────── */
const LEFT_NAV = [
  { label: 'Feed',          icon: BarChart2,  badge: 19, href: '/'           },
  { label: 'Stories',       icon: BookOpen,   badge: 0,  href: '/reels'      },
  { label: 'Friends',       icon: Users,      badge: 3,  href: '/networking' },
  { label: 'Settings',      icon: Settings,   badge: 0,  href: '#'           },
  { label: 'Help & Support',icon: HelpCircle, badge: 0,  href: '/help'       },
];

function LeftSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-2">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <span className="text-xl font-black text-gray-900">Alliance</span>
        <span className="text-xl">🤝</span>
      </div>

      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search..." className="w-full bg-gray-100 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      <nav className="flex flex-col gap-1">
        {LEFT_NAV.map(({ label, icon: Icon, badge, href }) => (
          <Link key={label} href={href} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors group">
            <span className="flex items-center gap-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </span>
            {badge > 0 && <span className="bg-brand-lime text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-6 bg-violet-50 border border-violet-100 rounded-2xl p-4 text-xs text-gray-600">
        <Zap size={16} className="text-violet-500 mb-2" />
        <p className="font-semibold text-gray-800 mb-1">Enjoy unlimited access</p>
        <p className="text-gray-500 mb-3">Upgrade to Pro for all premium features monthly.</p>
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">Dismiss</button>
          <span className="bg-brand-lime text-gray-900 font-bold px-3 py-1 rounded-full hover:brightness-95 transition-all cursor-pointer">Go Pro</span>
        </div>
      </div>
    </aside>
  );
}

/* ─── Add Story Modal ────────────────────────────────────── */
function AddStoryModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function handleSubmit() {
    if (!file) { setError('Selecciona una imagen o video primero.'); return; }
    setUploading(true);
    try {
      const { createAuthClient } = await import('@/lib/api');
      const client = createAuthClient(token);
      const formData = new FormData();
      formData.append('file', file);
      await client.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      qc.invalidateQueries({ queryKey: ['stories'] });
      onClose();
    } catch {
      setError('No se pudo subir la historia. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 flex items-center gap-2"><Camera size={18} className="text-violet-500" /> Nueva Historia</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {preview ? (
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black">
              {file?.type.startsWith('video') ? (
                <video src={preview} className="w-full h-full object-cover" muted autoPlay loop />
              ) : (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              )}
              <button onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl h-52 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
              <Camera size={32} className="text-gray-300" />
              <span className="text-sm text-gray-400">Toca para seleccionar imagen o video</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            </label>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleSubmit} disabled={!file || uploading}
            className="w-full bg-brand-lime text-gray-900 font-bold py-3 rounded-xl hover:brightness-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</> : 'Publicar Historia'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Stories Bar ────────────────────────────────────────── */
const STORY_COLORS = ['bg-pink-200','bg-violet-200','bg-blue-200','bg-green-200','bg-yellow-200','bg-orange-200','bg-teal-200','bg-rose-200'];

function StoriesBar({ stories, token }: { stories: Story[]; token?: string }) {
  const [showAddStory, setShowAddStory] = useState(false);

  const addBtn = (
    <button onClick={() => token && setShowAddStory(true)}
      className="flex flex-col items-center gap-1 shrink-0 group">
      <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-violet-400 group-hover:bg-violet-50 transition-all">
        <span className="text-gray-400 group-hover:text-violet-500 text-xl font-light transition-colors">+</span>
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-violet-500 transition-colors">Add Story</span>
    </button>
  );

  if (stories.length === 0) {
    return (
      <>
        <div className="flex items-center gap-4 py-1">
          {addBtn}
          <span className="text-xs text-gray-400">No hay historias aún — ¡sube la primera!</span>
        </div>
        {showAddStory && token && <AddStoryModal token={token} onClose={() => setShowAddStory(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {addBtn}
        {stories.map((s, idx) => {
          const author = s.author && typeof s.author === 'object' ? s.author as User : null;
          const name   = author?.name ?? 'User';
          const pic    = author?.profilePicture;
          return (
            <button key={s._id} className="flex flex-col items-center gap-1 shrink-0 group">
              <div className={`w-12 h-12 rounded-full ring-2 ring-violet-400 ring-offset-2 overflow-hidden flex items-center justify-center group-hover:ring-violet-600 transition-all ${!pic ? STORY_COLORS[idx % STORY_COLORS.length] : ''}`}>
                {pic ? <img src={pic} alt={name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-gray-700">{name.charAt(0).toUpperCase()}</span>}
              </div>
              <span className="text-[10px] text-gray-500 truncate w-12 text-center">{name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
      {showAddStory && token && <AddStoryModal token={token} onClose={() => setShowAddStory(false)} />}
    </>
  );
}

/* ─── Create Post Modal ──────────────────────────────────── */
function CreatePostModal({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [content,   setContent]   = useState('');
  const [imageUrl,  setImageUrl]  = useState('');
  const [hashInput, setHashInput] = useState('');

  const hashtags = hashInput.split(/[\s,#]+/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean);

  const mutation = useMutation({
    mutationFn: () => createPost(token, { content, imageUrl: imageUrl.trim() || undefined, hashtags: hashtags.length > 0 ? hashtags : undefined }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['posts'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">New Post</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <textarea autoFocus placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-gray-400 shrink-0" />
            <input type="url" placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Hashtags (space or comma separated)" value={hashInput} onChange={(e) => setHashInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((h) => <span key={h} className="bg-violet-50 text-violet-600 text-xs font-semibold px-2 py-0.5 rounded-full">#{h}</span>)}
            </div>
          )}
          {mutation.isError && <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          <button disabled={!content.trim() || mutation.isPending} onClick={() => mutation.mutate()}
            className="flex-1 bg-brand-lime text-gray-900 font-black py-2.5 rounded-xl hover:brightness-95 transition-all text-sm disabled:opacity-50">
            {mutation.isPending ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Post Card ──────────────────────────────────────────── */
function PostCard({ post, token }: { post: Post; token?: string }) {
  const qc = useQueryClient();
  const [commentText,   setCommentText]   = useState('');
  const [showComments, setShowComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(token!, post._id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
  const commentMutation = useMutation({
    mutationFn: () => addComment(token!, post._id, commentText),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['posts'] }); setCommentText(''); },
  });

  const authorName = post.author && typeof post.author === 'object' ? post.author.name : 'Usuario';

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} size={40} />
          <div>
            <p className="font-semibold text-sm text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal size={18} className="text-gray-400" /></button>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {post.content}
          {post.hashtags?.map((h) => <span key={h} className="text-violet-500 font-medium ml-1">#{h}</span>)}
        </p>
      </div>

      {post.imageUrl && (
        <div className="relative w-full aspect-video">
          <Image src={post.imageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-t border-gray-50">
        <span>{post.likes?.length ?? 0} Likes</span>
        <button onClick={() => setShowComments(!showComments)}>{post.comments?.length ?? 0} Comments</button>
      </div>

      <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-100">
        <button onClick={() => token && likeMutation.mutate()} disabled={!token}
          className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-xl hover:bg-gray-50 text-sm text-gray-500 hover:text-violet-600 transition-colors disabled:opacity-40">
          <ThumbsUp size={16} strokeWidth={1.8} /> Like
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-xl hover:bg-gray-50 text-sm text-gray-500 hover:text-violet-600 transition-colors">
          <MessageCircle size={16} strokeWidth={1.8} /> Comment
        </button>
        <button className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-xl hover:bg-gray-50 text-sm text-gray-500 hover:text-violet-600 transition-colors">
          <Share2 size={16} strokeWidth={1.8} /> Share
        </button>
        <button className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
          <Bookmark size={16} strokeWidth={1.8} />
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex flex-col gap-2">
          {post.comments?.slice(-3).map((c, i) => (
            <div key={i} className="flex gap-2">
              <UserAvatar user={typeof c.user === 'object' ? c.user : undefined} size={28} />
              <div className="bg-gray-50 rounded-xl px-3 py-1.5 text-xs text-gray-700 flex-1">
                <span className="font-semibold">{c.user && typeof c.user === 'object' ? c.user.name : 'Usuario'}</span>{' '}{c.text}
              </div>
            </div>
          ))}
          {token && (
            <div className="flex items-center gap-2 mt-1">
              <input type="text" placeholder="Write your comment..." value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commentText.trim() && commentMutation.mutate()}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-300" />
              <button onClick={() => commentText.trim() && commentMutation.mutate()}
                className="p-2 bg-violet-100 hover:bg-violet-200 text-violet-600 rounded-xl transition-colors">
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── Feed Job Card ──────────────────────────────────────── */
function FeedJobCard({ job }: { job: Job }) {
  const companyName = typeof job.company === 'object' ? job.company.name : 'Company';
  const logoUrl     = typeof job.company === 'object' ? job.company.logoUrl : undefined;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {logoUrl ? <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-1" /> : <Briefcase size={18} className="text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">{job.title}</p>
        <p className="text-[10px] text-gray-500 truncate">{companyName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MapPin size={9} />{job.location}</span>
          {job.tags?.slice(0, 2).map((t) => (
            <span key={t} className="bg-violet-50 text-violet-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>
      <Link href="/jobs" className="text-[10px] font-bold text-violet-600 border border-violet-200 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors shrink-0">Apply</Link>
    </div>
  );
}

/* ─── News Article Card ──────────────────────────────────── */
function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      className="flex gap-3 py-2 group hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
      {article.urlToImage && (
        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-violet-700 transition-colors leading-snug">{article.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400 font-medium">{article.source.name}</span>
          <span className="text-[10px] text-gray-300">·</span>
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Clock size={9} />{timeAgo(article.publishedAt)}</span>
          <ExternalLink size={9} className="text-gray-300 ml-auto group-hover:text-violet-400" />
        </div>
      </div>
    </a>
  );
}

/* ─── Right Sidebar ──────────────────────────────────────── */
function RightSidebar({ users, jobs, news }: { users: User[]; jobs: Job[]; news: NewsArticle[] }) {
  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-900">Friend Suggestions</h3>
          <Link href="/networking" className="text-xs text-violet-600 font-semibold hover:underline">See All</Link>
        </div>
        <div className="flex flex-col gap-3">
          {users.slice(0, 5).length === 0
            ? [1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-2 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1"><div className="h-3 bg-gray-200 rounded w-24" /><div className="h-2 bg-gray-100 rounded w-16" /></div>
                </div>
              ))
            : users.slice(0, 6).map((u) => (
                <div key={u._id} className="flex items-center gap-2">
                  <UserAvatar user={u} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.bio ?? `@${u.name.toLowerCase().replace(/\s+/g, '')}`}</p>
                  </div>
                  <button className="text-[10px] font-bold text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full hover:bg-violet-50 transition-colors shrink-0 flex items-center gap-0.5">
                    <UserPlus size={9} /> Add
                  </button>
                </div>
              ))
          }
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-900">Featured Jobs</h3>
          <Link href="/jobs" className="text-xs text-violet-600 font-semibold hover:underline">See All</Link>
        </div>
        {jobs.slice(0, 3).length === 0
          ? [1,2,3].map((i) => (
              <div key={i} className="flex gap-2 py-2 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1"><div className="h-3 bg-gray-200 rounded w-32" /><div className="h-2 bg-gray-100 rounded w-24" /></div>
              </div>
            ))
          : <div className="divide-y divide-gray-50">{jobs.slice(0, 3).map((j) => <FeedJobCard key={j._id} job={j} />)}</div>
        }
      </div>

      {/* Profile Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-sm text-gray-900 mb-3">Profile Activity</h3>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex -space-x-2">
            {['bg-pink-300','bg-violet-300','bg-blue-300','bg-green-300'].map((c, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
            ))}
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">+1,158</p>
            <p className="text-[10px] text-gray-400">Followers</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-brand-lime fill-brand-lime" />
          <span className="text-xs text-green-600 font-bold">+23%</span>
          <span className="text-[10px] text-gray-400">vs last month</span>
        </div>
        <p className="text-[10px] text-gray-500">You gained a substantial amount of followers this month!</p>
      </div>

      {/* Tech News */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper size={14} className="text-violet-500" />
            <h3 className="font-bold text-sm text-gray-900">Tech News</h3>
          </div>
          <Link href="#news" className="text-xs text-violet-600 font-semibold hover:underline flex items-center gap-0.5">
            More <ChevronRight size={12} />
          </Link>
        </div>
        {news.length === 0
          ? [1,2,3].map((i) => (
              <div key={i} className="flex gap-2 py-2 animate-pulse">
                <div className="w-16 h-12 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1"><div className="h-3 bg-gray-200 rounded" /><div className="h-3 bg-gray-100 rounded w-4/5" /><div className="h-2 bg-gray-100 rounded w-24" /></div>
              </div>
            ))
          : <div className="flex flex-col divide-y divide-gray-50">{news.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} />)}</div>
        }
      </div>
    </aside>
  );
}

/* ─── Featured Jobs in Feed ──────────────────────────────── */
function FeedJobsBanner({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-violet-500" />
          <h3 className="font-bold text-sm text-gray-900">Jobs For You</h3>
        </div>
        <Link href="/jobs" className="text-xs text-violet-600 font-semibold hover:underline flex items-center gap-0.5">
          See all <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {jobs.slice(0, 4).map((j) => {
          const companyName = typeof j.company === 'object' ? j.company.name : 'Company';
          const logoUrl     = typeof j.company === 'object' ? j.company.logoUrl : undefined;
          return (
            <div key={j._id} className="border border-gray-100 rounded-xl p-3 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {logoUrl ? <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-0.5" /> : <Briefcase size={14} className="text-gray-400" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{j.title}</p>
                  <p className="text-[10px] text-gray-500">{companyName}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {j.tags?.slice(0, 3).map((t) => <span key={t} className="bg-violet-50 text-violet-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{t}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><MapPin size={9} />{j.location}</span>
                <Link href="/jobs" className="text-[10px] font-bold text-violet-600 hover:underline">Apply →</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── News in Feed ───────────────────────────────────────── */
function FeedNewsBanner({ news }: { news: NewsArticle[] }) {
  if (news.length === 0) return null;
  return (
    <section id="news" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={18} className="text-violet-500" />
        <h3 className="font-bold text-gray-900">Latest Tech News</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {news.slice(0, 6).map((article, i) => (
          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
            className="flex gap-3 group hover:bg-gray-50 rounded-xl p-2 transition-colors">
            {article.urlToImage && (
              <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-violet-700 transition-colors leading-snug">{article.title}</p>
              {article.description && <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{article.description}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-500 font-semibold">{article.source.name}</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">{timeAgo(article.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─── People You May Know ─────────────────────────────────── */
function PeopleYouMayKnow({ users, token }: { users: User[]; token?: string }) {
  const qc = useQueryClient();
  if (users.length < 3) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-violet-500" />
          <h3 className="font-bold text-sm text-gray-900">People You May Know</h3>
        </div>
        <Link href="/networking" className="text-xs text-violet-600 font-semibold hover:underline flex items-center gap-0.5">
          See all <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {users.slice(0, 6).map((u) => (
          <div key={u._id} className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-xl hover:border-violet-200 transition-colors">
            <UserAvatar user={u} size={48} />
            <div className="text-center min-w-0 w-full">
              <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
              {u.bio && <p className="text-[10px] text-gray-400 truncate">{u.bio}</p>}
            </div>
            <button
              onClick={() => {}}
              className="w-full text-[10px] font-bold text-violet-600 border border-violet-200 py-1 rounded-lg hover:bg-violet-50 transition-colors flex items-center justify-center gap-1"
            >
              <UserPlus size={10} /> Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function FeedPage() {
  const { data: session }  = useSession();
  const token              = session?.accessToken;
  const [showPostModal, setShowPostModal] = useState(false);

  const { data: posts = [],   isLoading: loadingPosts }   = useQuery({ queryKey: ['posts'],   queryFn: getPosts,    staleTime: 30_000 });
  const { data: stories = [],  isLoading: loadingStories } = useQuery({ queryKey: ['stories'], queryFn: getStories,  staleTime: 60_000 });
  const { data: jobs = [] }     = useQuery({ queryKey: ['jobs'],   queryFn: () => getJobs(),   staleTime: 120_000 });
  const { data: news = [] }     = useQuery({ queryKey: ['news'],   queryFn: getTechNews,        staleTime: 300_000 });
  const { data: networkUsers = [] } = useQuery({
    queryKey: ['network'],
    enabled:  !!token,
    queryFn:  () => getNetwork(token!),
    staleTime: 60_000,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <LeftSidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search for friends, groups, pages"
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 shadow-sm" />
          </div>
          <button onClick={() => token ? setShowPostModal(true) : undefined}
            className="flex items-center gap-2 bg-brand-lime text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl hover:brightness-95 transition-all shrink-0">
            <PlusCircle size={16} />
            Add New Post
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          {loadingStories
            ? <div className="flex gap-4 overflow-x-auto pb-1">{[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 ring-2 ring-gray-100 ring-offset-2" />
                  <div className="w-10 h-2 bg-gray-200 rounded" />
                </div>))}</div>
            : <StoriesBar stories={stories} token={token} />
          }
        </div>

        <PeopleYouMayKnow users={networkUsers} token={token} />

        {loadingPosts
          ? [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1"><div className="h-3 bg-gray-200 rounded w-32" /><div className="h-2 bg-gray-100 rounded w-20" /></div>
                </div>
                <div className="space-y-2 mb-4"><div className="h-3 bg-gray-100 rounded" /><div className="h-3 bg-gray-100 rounded w-5/6" /></div>
                <div className="h-48 bg-gray-100 rounded-xl" />
              </div>
            ))
          : posts.map((post, idx) => (
              <Fragment key={post._id}>
                <PostCard post={post} token={token} />
                {idx === 1 && <FeedJobsBanner jobs={jobs} />}
              </Fragment>
            ))
        }

        {posts.length === 0 && !loadingPosts && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No posts yet. Be the first to share something!</p>
            {token && (
              <button onClick={() => setShowPostModal(true)}
                className="mt-4 bg-brand-lime text-gray-900 font-bold text-sm px-5 py-2 rounded-full hover:brightness-95 transition-all">
                Write a post
              </button>
            )}
          </div>
        )}

        <FeedNewsBanner news={news} />
      </main>

      <RightSidebar users={networkUsers} jobs={jobs} news={news} />

      {showPostModal && token && <CreatePostModal token={token} onClose={() => setShowPostModal(false)} />}
    </div>
  );
}
