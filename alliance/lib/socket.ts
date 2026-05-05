// socket.ts
'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

let chatSocket: Socket | null = null;
let notifSocket: Socket | null = null;

export function getChatSocket(token: string): Socket {
  if (!chatSocket || !chatSocket.connected) {
    chatSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      // Quitamos la línea de transports
    });
  }
  return chatSocket;
}

export function getNotifSocket(token: string): Socket {
  if (!notifSocket || !notifSocket.connected) {
    notifSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      autoConnect: false,
      // Quitamos la línea de transports
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