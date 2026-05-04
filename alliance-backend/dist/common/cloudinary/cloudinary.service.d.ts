import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly logger;
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse>;
    private doUpload;
}
