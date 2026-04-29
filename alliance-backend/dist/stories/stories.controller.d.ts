import { StoriesService } from './stories.service';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    create(file: Express.Multer.File, user: any): Promise<import("./schemas/story.schema").Story>;
    findAll(): Promise<import("./schemas/story.schema").Story[]>;
    markAsViewed(id: string, user: any): Promise<{
        message: string;
        viewsCount: number;
    }>;
}
