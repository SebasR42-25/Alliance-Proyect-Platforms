'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

// Singleton: reutiliza la misma conexión en toda la app
let chatSocket: Socket | null = null;
let notifSocket: Socket | null = null;

export function getChatSocket(token: string): Socket {
  if (!chatSocket || !chatSocket.connected) {
    chatSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return chatSocket;
}

export function getNotifSocket(token: string): Socket {
  if (!notifSocket || !notifSocket.connected) {
    notifSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket'],
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
