import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class UsersController {
    private readonly usersService;
    private readonly cloudinaryService;
    constructor(usersService: UsersService, cloudinaryService: CloudinaryService);
    uploadAvatar(user: RequestUser, file: Express.Multer.File): Promise<import("./schemas/user.schema").User | null>;
    getProfile(user: RequestUser): Promise<import("./schemas/user.schema").User | null>;
    updateProfile(user: RequestUser, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").User | null>;
    getNetwork(user: RequestUser): Promise<import("./schemas/user.schema").User[]>;
    globalSearch(query: string): Promise<{
        results: {
            users: (import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            } & {
                id: string;
            })[];
            jobs: any[];
            totalFound: number;
        };
    }>;
    sendConnectionRequest(targetId: string, user: RequestUser): Promise<{
        message: string;
    }>;
    accept(user: RequestUser, senderId: string): Promise<{
        message: string;
    }>;
    reject(user: RequestUser, senderId: string): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<import("./schemas/user.schema").User | null>;
    findAll(): Promise<import("./schemas/user.schema").User[]>;
}
export {};
