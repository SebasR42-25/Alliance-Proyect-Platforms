import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getNotifSocket } from '../services/socket.service';
import { useToast } from './useToast';

export function useNotifications() {
  const { token, user } = useAuthStore();
  const toast = useToast();

  useEffect(() => {
    if (!token || !user) return;

    const socket = getNotifSocket(token);

    socket.on('connect', () => {
      socket.emit('join', { userId: user.id });
    });

    socket.on('connectionRequest', (data: { from: string }) => {
      toast.info(`Nueva solicitud de conexión de ${data.from}`);
    });

    socket.on('connectionAccepted', (data: { by: string }) => {
      toast.success(`${data.by} aceptó tu solicitud ✓`);
    });

    socket.on('newMessage', (data: { from: string }) => {
      toast.info(`Nuevo mensaje de ${data.from}`);
    });

    socket.on('jobApplication', (data: { job: string }) => {
      toast.success(`Aplicaste a "${data.job}" ✓`);
    });

    return () => {
      socket.off('connectionRequest');
      socket.off('connectionAccepted');
      socket.off('newMessage');
      socket.off('jobApplication');
      socket.off('connect');
    };
  }, [token, user]);
}
