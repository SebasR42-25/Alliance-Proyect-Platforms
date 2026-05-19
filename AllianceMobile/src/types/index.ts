export interface User {
  _id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  career?: string;
  seniority?: string;
  specialization?: string;
  sector?: string;
  skills: string[];
  profilePicture?: string;
  connections: string[];
  connectionRequests: string[];
  createdAt: string;
}

export interface Comment {
  user: User | string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
}

export interface Company {
  _id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  availableJobs: number;
  industry?: string;
  createdAt: string;
}

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
}

export interface Reel {
  _id: string;
  author: User;
  videoUrl: string;
  caption?: string;
  likesCount: number;
  createdAt: string;
}

export interface Story {
  _id: string;
  author: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  viewedBy: string[];
  createdAt: string;
}

export interface Message {
  _id?: string;
  conversationId?: string;
  sender: string;
  receiverId?: string;
  text?: string;
  content?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  user: User;
  lastMessage?: string;
  updatedAt: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  author?: { name: string };
  createdAt: string;
  imageUrl?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  career?: string;
  skills?: string[];
  profilePicture?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
