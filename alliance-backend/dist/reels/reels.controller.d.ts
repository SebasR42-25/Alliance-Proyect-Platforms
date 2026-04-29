import { ReelsService } from './reels.service';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class ReelsController {
    private readonly reelsService;
    constructor(reelsService: ReelsService);
    create(user: RequestUser, file: Express.Multer.File, caption?: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/reel.schema").Reel, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/reel.schema").Reel & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/reel.schema").Reel, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/reel.schema").Reel & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
export {};
