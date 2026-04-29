"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("./schemas/message.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
let ChatService = class ChatService {
    conversationModel;
    messageModel;
    userModel;
    notificationsGateway;
    cloudinaryService;
    constructor(conversationModel, messageModel, userModel, notificationsGateway, cloudinaryService) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
        this.userModel = userModel;
        this.notificationsGateway = notificationsGateway;
        this.cloudinaryService = cloudinaryService;
    }
    async findOrCreateConversation(userId, targetUserId) {
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const targetObjId = new mongoose_2.Types.ObjectId(targetUserId);
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
        return conversation;
    }
    async getConversationParticipants(conversationId) {
        const conv = await this.conversationModel.findById(conversationId).exec();
        if (!conv)
            throw new common_1.NotFoundException('Conversación no encontrada');
        return conv.participants;
    }
    async saveMessageByConvId(conversationId, senderId, content) {
        const convObjId = new mongoose_2.Types.ObjectId(conversationId);
        const senderObjId = new mongoose_2.Types.ObjectId(senderId);
        const conversation = await this.conversationModel.findById(convObjId);
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
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
        const otherParticipants = conversation.participants.filter((p) => p.toString() !== senderId);
        for (const receiverId of otherParticipants) {
            this.notificationsGateway.sendNotification(receiverId.toString(), {
                type: 'NEW_CHAT_MESSAGE',
                message: `Mensaje de ${sender?.name}: "${content.substring(0, 30)}..."`,
                payload: { conversationId, senderName: sender?.name },
            });
        }
        return savedMessage;
    }
    async saveMessage(senderId, receiverId, content, file) {
        const senderObjId = new mongoose_2.Types.ObjectId(senderId);
        const receiverObjId = new mongoose_2.Types.ObjectId(receiverId);
        let attachmentUrl = null;
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
    async getUserConversations(userId) {
        return this.conversationModel
            .find({ participants: new mongoose_2.Types.ObjectId(userId) })
            .populate('participants', 'name profilePicture bio')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }
    async getMessages(conversationId) {
        const messages = await this.messageModel
            .find({ conversationId: new mongoose_2.Types.ObjectId(conversationId) })
            .populate('sender', 'name profilePicture')
            .sort({ createdAt: 1 })
            .exec();
        if (!messages)
            throw new common_1.NotFoundException('No se encontraron mensajes');
        return messages;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway,
        cloudinary_service_1.CloudinaryService])
], ChatService);
//# sourceMappingURL=chat.service.js.map