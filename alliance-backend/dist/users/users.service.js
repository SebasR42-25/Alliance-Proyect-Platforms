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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let UsersService = class UsersService {
    userModel;
    notificationsGateway;
    constructor(userModel, notificationsGateway) {
        this.userModel = userModel;
        this.notificationsGateway = notificationsGateway;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async create(userData) {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }
    async findById(id) {
        return this.userModel.findById(id).select('-password').exec();
    }
    async update(id, updateUserDto) {
        return this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();
    }
    async findAll() {
        return this.userModel.find().select('-password').exec();
    }
    async findOne(id) {
        return this.userModel.findById(id).select('-password').exec();
    }
    async getNetwork(userId) {
        return this.userModel
            .find({ _id: { $ne: userId } })
            .select('-password -connectionRequests')
            .exec();
    }
    async sendConnectionRequest(currentUserId, targetUserId) {
        if (currentUserId === targetUserId) {
            throw new common_1.BadRequestException('No puedes enviarte una solicitud a ti mismo');
        }
        const [targetUser, currentUser] = await Promise.all([
            this.userModel.findById(targetUserId),
            this.userModel.findById(currentUserId),
        ]);
        if (!targetUser)
            throw new common_1.NotFoundException('Usuario destino no encontrado');
        if (!currentUser)
            throw new common_1.NotFoundException('Tu usuario no existe');
        const currentUserObjId = new mongoose_2.Types.ObjectId(currentUserId);
        if (targetUser.connections.includes(currentUserObjId)) {
            throw new common_1.BadRequestException('Ya estás conectado con este usuario');
        }
        if (targetUser.connectionRequests.includes(currentUserObjId)) {
            throw new common_1.BadRequestException('La solicitud ya fue enviada anteriormente');
        }
        targetUser.connectionRequests.push(currentUserObjId);
        await targetUser.save();
        this.notificationsGateway.sendNotification(targetUserId, {
            type: 'CONNECTION_REQUEST',
            message: `${currentUser.name} quiere conectar contigo en Alliance.`,
            payload: {
                senderId: currentUserId,
                senderName: currentUser.name,
                senderPhoto: currentUser.profilePicture,
            },
        });
        return { message: 'Solicitud de conexión enviada con éxito' };
    }
    async searchGlobal(query) {
        const regex = new RegExp(query, 'i');
        const [users, jobs] = await Promise.all([
            this.userModel
                .find({
                $or: [{ name: regex }, { skills: { $in: [regex] } }, { bio: regex }],
            })
                .select('name profilePicture skills location')
                .limit(10)
                .exec(),
            this.userModel.db
                .model('Job')
                .find({
                $or: [
                    { title: regex },
                    { tags: { $in: [regex] } },
                    { location: regex },
                ],
            })
                .populate('company', 'name logoUrl')
                .limit(10)
                .exec(),
        ]);
        return {
            results: {
                users,
                jobs,
                totalFound: users.length + jobs.length,
            },
        };
    }
    async acceptConnection(currentUserId, senderId) {
        const currentUser = await this.userModel.findById(currentUserId);
        const senderUser = await this.userModel.findById(senderId);
        if (!currentUser || !senderUser) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const senderObjId = new mongoose_2.Types.ObjectId(senderId);
        if (!currentUser.connectionRequests.includes(senderObjId)) {
            throw new common_1.BadRequestException('No tienes una solicitud pendiente de este usuario');
        }
        currentUser.connectionRequests = currentUser.connectionRequests.filter((id) => id.toString() !== senderId);
        const currentObjId = new mongoose_2.Types.ObjectId(currentUserId);
        if (!currentUser.connections.includes(senderObjId))
            currentUser.connections.push(senderObjId);
        if (!senderUser.connections.includes(currentObjId))
            senderUser.connections.push(currentObjId);
        await Promise.all([currentUser.save(), senderUser.save()]);
        this.notificationsGateway.sendNotification(senderId, {
            type: 'CONNECTION_ACCEPTED',
            message: `${currentUser.name} aceptó tu solicitud de conexión. ¡Ya pueden chatear!`,
            payload: { userId: currentUserId, userName: currentUser.name },
        });
        return { message: 'Conexión establecida con éxito' };
    }
    async rejectConnection(currentUserId, senderId) {
        await this.userModel.findByIdAndUpdate(currentUserId, {
            $pull: { connectionRequests: new mongoose_2.Types.ObjectId(senderId) },
        });
        return { message: 'Solicitud rechazada correctamente' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], UsersService);
//# sourceMappingURL=users.service.js.map