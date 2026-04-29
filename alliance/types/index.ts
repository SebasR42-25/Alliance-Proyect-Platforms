/* ═══════════════════════════════════════════════════════
   Tipos derivados de los schemas Mongoose del backend
   ═══════════════════════════════════════════════════════ */

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  skills: string[];
  profilePicture?: string;
  seniority?: string;
  specialization?: string;
  sector?: string;
  connections: string[];
  connectionRequests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// ─── Post ────────────────────────────────────────────────────────────────────
export interface Comment {
  _id?: string;
  user: User | string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User | string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Company ─────────────────────────────────────────────────────────────────
export interface Company {
  _id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  availableJobs: number;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Job ─────────────────────────────────────────────────────────────────────
export interface Job {
  _id: string;
  title: string;
  company: Company | string;
  location: string;
  salaryRange?: string;
  description?: string;
  tags: string[];
  applicants: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Reel ────────────────────────────────────────────────────────────────────
export interface Reel {
  _id: string;
  author: User | string;
  videoUrl: string;
  caption?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Story ───────────────────────────────────────────────────────────────────
export interface Story {
  _id: string;
  author: User | string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  viewedBy: string[];
  createdAt: string;
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: (User | string)[];
  lastMessage?: Message | string;
  createdAt: string;
  updatedAt: string;
}

// ─── News ────────────────────────────────────────────────────────────────────
export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: { name: string };
  author?: string;
}

// ─── API responses genéricos ─────────────────────────────────────────────────
export interface ApiMessage {
  message: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}
