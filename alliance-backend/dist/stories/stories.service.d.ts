import { Model } from 'mongoose';
import { Story } from './schemas/story.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
export declare class StoriesService {
    private readonly storyModel;
    private readonly cloudinaryService;
    constructor(storyModel: Model<Story>, cloudinaryService: CloudinaryService);
    create(file: Express.Multer.File, userId: string): Promise<Story>;
    findAllActive(): Promise<Story[]>;
    markAsViewed(storyId: string, userId: string): Promise<{
        message: string;
        viewsCount: number;
    }>;
}
