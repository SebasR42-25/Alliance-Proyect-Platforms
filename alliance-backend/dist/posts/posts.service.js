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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./schemas/post.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let PostsService = class PostsService {
    postModel;
    userModel;
    notificationsGateway;
    constructor(postModel, userModel, notificationsGateway) {
        this.postModel = postModel;
        this.userModel = userModel;
        this.notificationsGateway = notificationsGateway;
    }
    async create(createPostDto, userId) {
        const newPost = new this.postModel({
            ...createPostDto,
            author: new mongoose_2.Types.ObjectId(userId),
        });
        return (await newPost.save()).populate('author', 'name profilePicture');
    }
    async findAll() {
        return this.postModel
            .find()
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .exec();
    }
    async findByUserId(userId) {
        return this.postModel
            .find({ author: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture')
            .exec();
    }
    async toggleLike(postId, userId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Publicación no encontrada');
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const likeIndex = post.likes.indexOf(userObjId);
        let isLiked = false;
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        }
        else {
            post.likes.push(userObjId);
            isLiked = true;
        }
        await post.save();
        if (isLiked && post.author.toString() !== userId) {
            const liker = await this.userModel.findById(userId);
            this.notificationsGateway.sendNotification(post.author.toString(), {
                type: 'NEW_LIKE',
                message: `${liker?.name} le dio me gusta a tu publicación.`,
                payload: { postId: post._id, likerName: liker?.name },
            });
        }
        return { likesCount: post.likes.length, isLiked };
    }
    async addComment(postId, userId, text) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Publicación no encontrada');
        const newComment = {
            user: new mongoose_2.Types.ObjectId(userId),
            text,
            createdAt: new Date(),
        };
        post.comments.push(newComment);
        await post.save();
        if (post.author.toString() !== userId) {
            const commenter = await this.userModel.findById(userId);
            this.notificationsGateway.sendNotification(post.author.toString(), {
                type: 'NEW_COMMENT',
                message: `${commenter?.name} comentó tu publicación: "${text.substring(0, 25)}..."`,
                payload: { postId: post._id, comment: text },
            });
        }
        return post.populate('comments.user', 'name profilePicture');
    }
    async remove(postId, userId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post no encontrado');
        if (post.author.toString() !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para borrar este post');
        }
        await post.deleteOne();
        return { message: 'Post eliminado correctamente' };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], PostsService);
//# sourceMappingURL=posts.service.js.map