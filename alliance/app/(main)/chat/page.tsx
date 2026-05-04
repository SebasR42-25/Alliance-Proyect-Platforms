'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, Plus, Phone, Paperclip, Send,
  FileText, Image as ImageIcon, X, Users,
} from 'lucide-react';
import { getConversations, getMessages, createConversation } from '@/services/chat.service';
import { getUsers } from '@/services/users.service';
import { getChatSocket } from '@/lib/socket';
import { showToast } from '@/lib/toast';
import type { Conversation, Message, User } from '@/types';

function getOtherParticipant(conv: Conversation, myId?: string): User | null {
  const other = conv.participants.find((p) => {
    const id = typeof p === 'object' ? (p as User)._id : p;
    return id !== myId;
  });
  return other && typeof other === 'object' ? (other as User) : null;
}

function formatTime(iso: string): string {
  const diffM = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffM < 1) return 'now';
  if (diffM < 60) return `${diffM}m`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h`;
  return `${Math.floor(diffH / 24)}d`;
}

function NewChatModal({
  token,
  myId,
  onSelect,
  onClose,
}: {
  token: string;
  myId?: string;
  onSelect: (convId: string) => void;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: allUsers = [] } = useQuery({
    queryKey:  ['users-all'],
    queryFn:   getUsers,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (targetId: string) => createConversation(token, targetId),
    onSuccess: (conv, targetId) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      const other = allUsers.find((u) => u._id === targetId);
      showToast({ message: 'Chat started', sub: other?.name ?? 'New conversation', type: 'info' });
      onSelect(conv._id);
      onClose();
    },
  });

  const filtered = allUsers.filter(
    (u) => u._id !== myId && u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900">New Conversation</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="relative px-4 py-3 border-b border-gray-50">
          <Search size={13} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-violet-300"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Users size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No users found</p>
            </div>
          )}
          {filtered.map((u) => (
            <button
              key={u._id}
              onClick={() => createMutation.mutate(u._id)}
              disabled={createMutation.isPending}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 disabled:opacity-60"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-200 to-pink-200 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0 overflow-hidden">
                {u.profilePicture
                  ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                  : u.name.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{u.name}</p>
                {u.bio && <p className="text-[10px] text-gray-400 truncate max-w-45">{u.bio}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  selected,
  onSelect,
  onNewChat,
  myId,
  isLoading,
}: {
  conversations: Conversation[];
  selected: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  myId?: string;
  isLoading: boolean;
}) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c, myId);
    return !search || (other?.name ?? '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-64 shrink-0 flex flex-col border-r border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm text-gray-900">Messages</h2>
          {conversations.length > 0 && (
            <span className="bg-brand-lime text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        <button
          onClick={onNewChat}
          title="New conversation"
          className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors"
        >
          <Plus size={16} className="text-violet-600" />
        </button>
      </div>

      <div className="relative px-3 py-2 border-b border-gray-50">
        <Search size={13} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search messages"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 rounded-lg pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-violet-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2.5 px-4 py-3 border-b border-gray-50 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-2 bg-gray-100 rounded w-32" />
            </div>
          </div>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-gray-400 mb-2">No conversations yet</p>
            <button
              onClick={onNewChat}
              className="text-xs text-violet-600 font-semibold hover:underline"
            >
              Start one →
            </button>
          </div>
        )}

        {!isLoading && filtered.map((c) => {
          const other   = getOtherParticipant(c, myId);
          const name    = other?.name ?? 'Unknown';
          const lastMsg = c.lastMessage && typeof c.lastMessage === 'object'
            ? (c.lastMessage as Message).content : '';
          const time    = c.updatedAt ? formatTime(c.updatedAt) : '';

          return (
            <button
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={`w-full flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                selected === c._id ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-200 to-pink-200 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0 overflow-hidden">
                {other?.profilePicture
                  ? <img src={other.profilePicture} alt={name} className="w-full h-full object-cover" />
                  : name.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900 truncate">{name}</p>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-1">{time}</span>
                </div>
                {lastMsg && <p className="text-[10px] text-gray-500 truncate mt-0.5">{lastMsg}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const AUTO_REPLIES = [
  '¡Interesante! Cuéntame más sobre eso.',
  'Claro, estoy disponible. ¿Cuándo podemos coordinar una llamada?',
  'Me parece una excelente propuesta. Lo revisaré con detalle.',
  '¡Gracias por el mensaje! Estaba esperando noticias tuyas.',
  'Perfecto, te confirmo en unos minutos.',
  '¿Podrías enviarme más información? Me gustaría revisarlo bien.',
  '¡Genial! Quedamos en contacto entonces.',
  'Entendido, lo tendré en cuenta para la próxima semana.',
];

type LocalMsg = {
  id:        string;
  content:   string;
  isMe:      boolean;
  ts:        string;
};

function ChatWindow({ convId, conv, myId }: { convId: string; conv?: Conversation; myId?: string }) {
  const { data: session } = useSession();
  const token             = session?.accessToken;
  const qc                = useQueryClient();
  const [text, setText]     = useState('');
  const [localMsgs, setLocalMsgs] = useState<LocalMsg[]>([]);
  const [typing, setTyping]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = conv ? getOtherParticipant(conv, myId) : null;

  useEffect(() => { setLocalMsgs([]); }, [convId]);

  const { data: dbMessages = [], isLoading } = useQuery({
    queryKey:  ['messages', convId],
    queryFn:   () => token ? getMessages(token, convId) : Promise.resolve([]),
    enabled:   !!token && !!convId,
    staleTime: 10_000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dbMessages, localMsgs, typing, convId]);

  useEffect(() => {
    if (!token || !myId) return;
    const socket = getChatSocket(token);
    socket.connect();
    socket.emit('join', myId);
    return () => { socket.disconnect(); };
  }, [token, myId]);

  const handleSend = () => {
    if (!text.trim() || !token || !myId) return;
    const content = text.trim();
    setText('');
    setLocalMsgs((prev) => [...prev, {
      id:      `me-${Date.now()}`,
      content,
      isMe:    true,
      ts:      new Date().toISOString(),
    }]);
    const socket = getChatSocket(token);
    socket.emit('sendMessage', { conversationId: convId, senderId: myId, content });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    const delay = 1400 + Math.random() * 1800;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setLocalMsgs((prev) => [...prev, {
        id:      `bot-${Date.now()}`,
        content: reply,
        isMe:    false,
        ts:      new Date().toISOString(),
      }]);
    }, delay);
  };

  if (!convId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center">
          <Send size={24} className="text-violet-300" />
        </div>
        <p className="text-sm font-semibold">Select a conversation</p>
        <p className="text-xs">or start a new one with the + button</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-200 to-pink-200 flex items-center justify-center text-violet-700 font-bold text-sm overflow-hidden">
            {other?.profilePicture
              ? <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
              : (other?.name?.charAt(0).toUpperCase() ?? '?')
            }
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{other?.name ?? 'Chat'}</p>
            <p className="text-[10px] text-green-500 font-semibold">● Online</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
          <Phone size={13} />
          Call
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
            <div className={`h-8 rounded-2xl ${i % 2 === 0 ? 'bg-gray-200 w-40' : 'bg-violet-100 w-32'}`} />
          </div>
        ))}

        {!isLoading && dbMessages.map((m) => {
          const senderObj = m.sender && typeof m.sender === 'object' ? (m.sender as User) : null;
          const senderId  = senderObj ? String(senderObj._id) : String(m.sender);
          const isMe      = !!myId && senderId === String(myId);
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700 shrink-0 self-end overflow-hidden">
                  {senderObj?.profilePicture
                    ? <img src={senderObj.profilePicture} alt="" className="w-full h-full object-cover" />
                    : (senderObj?.name?.charAt(0).toUpperCase() ?? '?')
                  }
                </div>
              )}
              <div className={`max-w-[65%] px-3.5 py-2 rounded-2xl text-sm leading-snug ${
                isMe ? 'bg-brand-purple text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {localMsgs.map((m) => (
          <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'} gap-2`}>
            {!m.isMe && (
              <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700 shrink-0 self-end overflow-hidden">
                {other?.profilePicture
                  ? <img src={other.profilePicture} alt="" className="w-full h-full object-cover" />
                  : (other?.name?.charAt(0).toUpperCase() ?? '?')
                }
              </div>
            )}
            <div className={`max-w-[65%] px-3.5 py-2 rounded-2xl text-sm leading-snug ${
              m.isMe
                ? 'bg-brand-purple text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700 shrink-0 self-end overflow-hidden">
              {other?.profilePicture
                ? <img src={other.profilePicture} alt="" className="w-full h-full object-cover" />
                : (other?.name?.charAt(0).toUpperCase() ?? '?')
              }
            </div>
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <Paperclip size={16} />
        </button>
        <input
          type="text"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2 bg-brand-purple text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const MOCK_FILES = [
  { id: 'f1', name: '48.pdf',         type: 'pdf', size: '9kB'  },
  { id: 'f2', name: 'Screenshot.png', type: 'img', size: '8kB'  },
  { id: 'f3', name: 'sharefix.docx',  type: 'doc', size: '55kB' },
];

function RightPanel({ participants }: { participants: (User | string)[] }) {
  const members = participants.filter((p): p is User => typeof p === 'object');
  return (
    <div className="w-56 shrink-0 flex flex-col border-l border-gray-100 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-900">Team Members</h3>
          <span className="text-xs text-gray-400 font-semibold">{members.length || '—'}</span>
        </div>
        <div className="flex flex-col gap-2">
          {members.length === 0 && <p className="text-[10px] text-gray-400">Select a conversation</p>}
          {members.map((u, i) => (
            <div key={u._id ?? i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-bold text-violet-700 shrink-0 overflow-hidden">
                {u.profilePicture
                  ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                  : u.name.charAt(0).toUpperCase()
                }
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 truncate">{u.name}</p>
                <p className="text-[9px] text-gray-400 truncate">{u.bio ?? 'Member'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-900">Files</h3>
          <span className="text-xs text-gray-400 font-semibold">125</span>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_FILES.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                f.type === 'pdf' ? 'bg-red-100 text-red-500' :
                f.type === 'img' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'
              }`}>
                {f.type === 'img' ? <ImageIcon size={13} /> : <FileText size={13} />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-700 truncate">{f.name}</p>
                <p className="text-[9px] text-gray-400">{f.type.toUpperCase()} · {f.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">Alliance 🤝 · All rights reserved</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { data: session }  = useSession();
  const token              = session?.accessToken;
  const myId               = session?.user?.id;
  const router             = useRouter();
  const searchParams       = useSearchParams();
  const [selectedConv, setSelectedConv] = useState('');
  const [showNewChat, setShowNewChat]   = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey:  ['conversations'],
    queryFn:   () => token ? getConversations(token) : Promise.resolve([]),
    enabled:   !!token,
    staleTime: 30_000,
  });

  const withUserId = searchParams.get('with');
  const qc = useQueryClient();
  useEffect(() => {
    if (!token || !withUserId) return;
    createConversation(token, withUserId).then((conv) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConv(conv._id);
      router.replace('/chat');
    }).catch(() => {});
  }, [token, withUserId, qc, router]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConv && !withUserId) {
      setSelectedConv(conversations[0]._id);
    }
  }, [conversations, selectedConv, withUserId]);

  const selectedConvObj = conversations.find((c) => c._id === selectedConv);

  if (!token) {
    return (
      <div
        className="max-w-7xl mx-auto flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm"
        style={{ height: 'calc(100vh - 5rem)' }}
      >
        <div className="text-center">
          <p className="text-gray-500 font-semibold mb-2">Sign in to access your messages</p>
          <a href="/login" className="inline-block bg-gray-900 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-gray-700 transition-colors">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="max-w-7xl mx-auto flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        style={{ height: 'calc(100vh - 5rem)' }}
      >
        <ConversationList
          conversations={conversations}
          selected={selectedConv}
          onSelect={setSelectedConv}
          onNewChat={() => setShowNewChat(true)}
          myId={myId}
          isLoading={isLoading}
        />
        <ChatWindow convId={selectedConv} conv={selectedConvObj} myId={myId} />
        <RightPanel participants={selectedConvObj?.participants ?? []} />
      </div>

      {showNewChat && token && (
        <NewChatModal
          token={token}
          myId={myId}
          onSelect={setSelectedConv}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </>
  );
}
