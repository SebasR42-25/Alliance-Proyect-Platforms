import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../../chat.service';

interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(userId);
    console.log(`Cliente unido a sala: ${userId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const { conversationId, senderId, content } = payload;

    const savedMessage = await this.chatService.saveMessageByConvId(
      conversationId,
      senderId,
      content,
    );

    const participants = await this.chatService.getConversationParticipants(conversationId);
    for (const participantId of participants) {
      this.server.to(participantId.toString()).emit('newMessage', savedMessage);
    }
  }
}
