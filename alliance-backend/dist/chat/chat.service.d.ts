import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
export declare class ChatService {
    private conversationModel;
    private messageModel;
    private userModel;
    private readonly notificationsGateway;
    private readonly cloudinaryService;
    constructor(conversationModel: Model<Conversation>, messageModel: Model<Message>, userModel: Model<User>, notificationsGateway: NotificationsGateway, cloudinaryService: CloudinaryService);
    findOrCreateConversation(userId: string, targetUserId: string): Promise<Conversation>;
    getConversationParticipants(conversationId: string): Promise<Types.ObjectId[]>;
    saveMessageByConvId(conversationId: string, senderId: string, content: string): Promise<Message>;
    saveMessage(senderId: string, receiverId: string, content: string, file?: Express.Multer.File): Promise<Message>;
    getUserConversations(userId: string): Promise<Conversation[]>;
    getMessages(conversationId: string): Promise<Message[]>;
}
