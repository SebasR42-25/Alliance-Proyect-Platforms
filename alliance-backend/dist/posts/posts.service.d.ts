import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../users/schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class PostsService {
    private postModel;
    private userModel;
    private readonly notificationsGateway;
    constructor(postModel: Model<Post>, userModel: Model<User>, notificationsGateway: NotificationsGateway);
    create(createPostDto: CreatePostDto, userId: string): Promise<Omit<import("mongoose").Document<unknown, {}, Post, {}, import("mongoose").DefaultSchemaOptions> & Post & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Post, {}, import("mongoose").DefaultSchemaOptions> & Post & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByUserId(userId: string): Promise<(import("mongoose").Document<unknown, {}, Post, {}, import("mongoose").DefaultSchemaOptions> & Post & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    toggleLike(postId: string, userId: string): Promise<{
        likesCount: number;
        isLiked: boolean;
    }>;
    addComment(postId: string, userId: string, text: string): Promise<Omit<import("mongoose").Document<unknown, {}, Post, {}, import("mongoose").DefaultSchemaOptions> & Post & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    remove(postId: string, userId: string): Promise<{
        message: string;
    }>;
}
