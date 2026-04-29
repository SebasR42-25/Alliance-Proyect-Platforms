import { createAuthClient } from '@/lib/api';
import type { Conversation, Message } from '@/types';

export async function getConversations(token: string): Promise<Conversation[]> {
  const client = createAuthClient(token);
  const res    = await client.get<Conversation[]>('/chat/conversations');
  return res.data;
}

export async function getMessages(token: string, conversationId: string): Promise<Message[]> {
  const client = createAuthClient(token);
  const res    = await client.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
  return res.data;
}

export async function createConversation(token: string, targetUserId: string): Promise<Conversation> {
  const client = createAuthClient(token);
  const res    = await client.post<Conversation>('/chat/conversations', { targetUserId });
  return res.data;
}
