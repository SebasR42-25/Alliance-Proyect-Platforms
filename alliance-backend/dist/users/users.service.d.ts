import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export interface CreateUserData {
    name: string;
    email: string;
    password?: string;
    profilePicture?: string;
}
export declare class UsersService {
    private userModel;
    private readonly notificationsGateway;
    constructor(userModel: Model<User>, notificationsGateway: NotificationsGateway);
    findByEmail(email: string): Promise<User | null>;
    create(userData: CreateUserData): Promise<User>;
    findById(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    getNetwork(userId: string): Promise<User[]>;
    sendConnectionRequest(currentUserId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    searchGlobal(query: string): Promise<{
        results: {
            users: (import("mongoose").Document<unknown, {}, User, {}, import("mongoose").DefaultSchemaOptions> & User & Required<{
                _id: Types.ObjectId;
            }> & {
                __v: number;
            } & {
                id: string;
            })[];
            jobs: any[];
            totalFound: number;
        };
    }>;
    acceptConnection(currentUserId: string, senderId: string): Promise<{
        message: string;
    }>;
    rejectConnection(currentUserId: string, senderId: string): Promise<{
        message: string;
    }>;
}
