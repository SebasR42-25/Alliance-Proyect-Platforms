import { ChatService } from './chat.service';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(user: RequestUser, body: {
        targetUserId: string;
    }): Promise<import("./schemas/conversation.schema").Conversation>;
    getConversations(user: RequestUser): Promise<import("./schemas/conversation.schema").Conversation[]>;
    getMessages(conversationId: string): Promise<import("./schemas/message.schema").Message[]>;
}
export {};
