import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

const SOCKET_URL = BASE_URL.replace('/api', '');

let chatSocket: Socket | null = null;
let notifSocket: Socket | null = null;

export function getChatSocket(token: string): Socket {
  if (!chatSocket || !chatSocket.connected) {
    chatSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
  }
  return chatSocket;
}

export function getNotifSocket(token: string): Socket {
  if (!notifSocket || !notifSocket.connected) {
    notifSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
  }
  return notifSocket;
}

export function disconnectSockets() {
  chatSocket?.disconnect();
  notifSocket?.disconnect();
  chatSocket = null;
  notifSocket = null;
}
