import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findOrCreateConversation(
    userId: string,
    targetUserId: string,
  ): Promise<Conversation> {
    const userObjId = new Types.ObjectId(userId);
    const targetObjId = new Types.ObjectId(targetUserId);

    let conversation = await this.conversationModel
      .findOne({ participants: { $all: [userObjId, targetObjId] } })
      .populate('participants', 'name profilePicture bio')
      .populate('lastMessage')
      .exec();

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: [userObjId, targetObjId],
      });
      await conversation.save();
      conversation = await this.conversationModel
        .findById(conversation._id)
        .populate('participants', 'name profilePicture bio')
        .exec();
    }

    return conversation!;
  }

  async getConversationParticipants(conversationId: string): Promise<Types.ObjectId[]> {
    const conv = await this.conversationModel.findById(conversationId).exec();
    if (!conv) throw new NotFoundException('Conversación no encontrada');
    return conv.participants;
  }

  async saveMessageByConvId(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const convObjId = new Types.ObjectId(conversationId);
    const senderObjId = new Types.ObjectId(senderId);

    const conversation = await this.conversationModel.findById(convObjId);
    if (!conversation) throw new NotFoundException('Conversación no encontrada');

    const newMessage = new this.messageModel({
      conversationId: convObjId,
      sender: senderObjId,
      content,
    });
    const savedMessage = await newMessage.save();

    await this.conversationModel.findByIdAndUpdate(convObjId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date(),
    });

    const sender = await this.userModel.findById(senderId).select('name').exec();
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== senderId,
    );
    for (const receiverId of otherParticipants) {
      this.notificationsGateway.sendNotification(receiverId.toString(), {
        type: 'NEW_CHAT_MESSAGE',
        message: `Mensaje de ${sender?.name}: "${content.substring(0, 30)}..."`,
        payload: { conversationId, senderName: sender?.name },
      });
    }

    return savedMessage;
  }

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
    file?: Express.Multer.File,
  ): Promise<Message> {
    const senderObjId = new Types.ObjectId(senderId);
    const receiverObjId = new Types.ObjectId(receiverId);

    let attachmentUrl: string | null = null;
    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      attachmentUrl = upload.secure_url;
    }

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [senderObjId, receiverObjId] },
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: [senderObjId, receiverObjId],
      });
      await conversation.save();
    }

    const newMessage = new this.messageModel({
      conversationId: conversation._id,
      sender: senderObjId,
      content,
      attachmentUrl,
    });
    const savedMessage = await newMessage.save();

    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      lastMessage: savedMessage._id,
      updatedAt: new Date(),
    });

    const sender = await this.userModel.findById(senderId);
    const notificationText = content ? content.substring(0, 30) : '📷 Envió una imagen';

    this.notificationsGateway.sendNotification(receiverId, {
      type: 'NEW_CHAT_MESSAGE',
      message: `Mensaje de ${sender?.name}: "${notificationText}..."`,
      payload: {
        conversationId: conversation._id,
        senderName: sender?.name,
        attachmentUrl,
      },
    });

    return savedMessage;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'name profilePicture bio')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 })
      .exec();

    if (!messages) throw new NotFoundException('No se encontraron mensajes');
    return messages;
  }
}
