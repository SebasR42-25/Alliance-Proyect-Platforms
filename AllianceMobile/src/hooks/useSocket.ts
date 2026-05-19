import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../services/api';

const SOCKET_URL = BASE_URL.replace('/api', '');

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    return () => { socketRef.current?.disconnect(); };
  }, [token]);

  return socketRef.current;
}
