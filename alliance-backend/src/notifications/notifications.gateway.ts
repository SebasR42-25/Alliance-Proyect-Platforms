import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'notifications' })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('joinNotifications')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`notify_${userId}`);
    console.log(`Usuario ${userId} suscrito a notificaciones`);
  }
  sendNotification(
    userId: string,
    data: { type: string; message: string; payload?: any },
  ) {
    this.server.to(`notify_${userId}`).emit('newNotification', data);
  }
}
