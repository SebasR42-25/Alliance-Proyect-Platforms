import { Server, Socket } from 'socket.io';
import { ChatService } from '../../chat.service';
interface SendMessagePayload {
    conversationId: string;
    senderId: string;
    content: string;
}
export declare class ChatGateway {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleJoin(userId: string, client: Socket): void;
    handleMessage(payload: SendMessagePayload): Promise<void>;
}
export {};
