import { CloudinaryService } from './common/cloudinary/cloudinary.service';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    private readonly cloudinaryService;
    constructor(appService: AppService, cloudinaryService: CloudinaryService);
    getHello(): string;
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        public_id: string;
    }>;
}
