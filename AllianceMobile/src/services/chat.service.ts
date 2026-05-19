import { createAuthClient } from './api';
import type { Conversation, Message } from '../types';

export async function getConversations(token: string): Promise<Conversation[]> {
  const res = await createAuthClient(token).get<Conversation[]>('/chat/conversations');
  return res.data;
}

export async function getMessages(token: string, conversationId: string): Promise<Message[]> {
  const res = await createAuthClient(token).get<Message[]>(`/chat/conversations/${conversationId}/messages`);
  return res.data;
}

export async function createConversation(token: string, targetUserId: string): Promise<Conversation> {
  const res = await createAuthClient(token).post<Conversation>('/chat/conversations', { targetUserId });
  return res.data;
}
