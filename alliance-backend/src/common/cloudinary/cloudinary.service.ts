import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.doUpload(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Cloudinary attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
        } else {
          throw err;
        }
      }
    }
    throw new Error('Upload failed after retries');
  }

  private doUpload(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder:        'alliance_profiles',
          resource_type: 'auto',
          timeout:       120000,
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Resultado de Cloudinary vacío'));
          resolve(result);
        },
      );

      upload.on('error', reject);

      const stream = new Readable({ read() {} });
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(upload);
    });
  }
}
