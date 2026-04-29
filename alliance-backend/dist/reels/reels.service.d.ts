import { Model, Types } from 'mongoose';
import { Reel } from './schemas/reel.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
export declare class ReelsService {
    private reelModel;
    private readonly cloudinaryService;
    constructor(reelModel: Model<Reel>, cloudinaryService: CloudinaryService);
    create(file: Express.Multer.File, userId: string, caption?: string): Promise<Omit<import("mongoose").Document<unknown, {}, Reel, {}, import("mongoose").DefaultSchemaOptions> & Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Reel, {}, import("mongoose").DefaultSchemaOptions> & Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
