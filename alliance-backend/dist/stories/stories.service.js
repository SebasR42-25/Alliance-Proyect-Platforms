"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const story_schema_1 = require("./schemas/story.schema");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
let StoriesService = class StoriesService {
    storyModel;
    cloudinaryService;
    constructor(storyModel, cloudinaryService) {
        this.storyModel = storyModel;
        this.cloudinaryService = cloudinaryService;
    }
    async create(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('El archivo de la historia es obligatorio');
        }
        try {
            const result = await this.cloudinaryService.uploadFile(file);
            const newStory = new this.storyModel({
                author: new mongoose_2.Types.ObjectId(userId),
                mediaUrl: result.secure_url,
                mediaType: result.resource_type === 'video' ? 'video' : 'image',
                viewedBy: [],
            });
            const savedStory = await newStory.save();
            return savedStory.populate({
                path: 'author',
                select: 'name profilePicture',
            });
        }
        catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw new common_1.InternalServerErrorException('Error al procesar la historia en la nube');
        }
    }
    async findAllActive() {
        return this.storyModel
            .find()
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture')
            .exec();
    }
    async markAsViewed(storyId, userId) {
        const story = await this.storyModel.findById(storyId).exec();
        if (!story) {
            throw new common_1.NotFoundException('La historia no existe o ya expiró (24h)');
        }
        const userIdStr = userId.toString();
        const alreadyViewed = story.viewedBy.some((id) => id.toString() === userIdStr);
        if (!alreadyViewed) {
            story.viewedBy.push(new mongoose_2.Types.ObjectId(userId));
            await story.save();
        }
        return {
            message: 'Historia marcada como vista',
            viewsCount: story.viewedBy.length,
        };
    }
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_schema_1.Story.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], StoriesService);
//# sourceMappingURL=stories.service.js.map