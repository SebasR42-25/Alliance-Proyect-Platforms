"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    logger = new common_1.Logger(CloudinaryService_1.name);
    async uploadFile(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo');
        }
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return await this.doUpload(file);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.warn(`Cloudinary attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`);
                if (attempt < MAX_RETRIES) {
                    await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
                }
                else {
                    throw err;
                }
            }
        }
        throw new Error('Upload failed after retries');
    }
    doUpload(file) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary_1.v2.uploader.upload_stream({
                folder: 'alliance_profiles',
                resource_type: 'auto',
                timeout: 120000,
            }, (error, result) => {
                if (error)
                    return reject(new Error(error.message));
                if (!result)
                    return reject(new Error('Resultado de Cloudinary vacío'));
                resolve(result);
            });
            upload.on('error', reject);
            const stream = new stream_1.Readable({ read() { } });
            stream.push(file.buffer);
            stream.push(null);
            stream.pipe(upload);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map