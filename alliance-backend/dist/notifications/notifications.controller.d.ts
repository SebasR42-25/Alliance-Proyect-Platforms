import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class NotificationsController {
    private userModel;
    constructor(userModel: Model<User>);
    getUnreadCount(user: RequestUser): Promise<{
        count: number;
    }>;
    getPendingRequests(user: RequestUser): Promise<import("mongoose").Types.ObjectId[]>;
}
export {};
