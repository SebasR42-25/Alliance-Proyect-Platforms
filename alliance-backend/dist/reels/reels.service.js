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
exports.ReelsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reel_schema_1 = require("./schemas/reel.schema");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
let ReelsService = class ReelsService {
    reelModel;
    cloudinaryService;
    constructor(reelModel, cloudinaryService) {
        this.reelModel = reelModel;
        this.cloudinaryService = cloudinaryService;
    }
    async create(file, userId, caption) {
        if (!file)
            throw new common_1.BadRequestException('El archivo de video es requerido');
        const result = await this.cloudinaryService.uploadFile(file);
        const newReel = new this.reelModel({
            videoUrl: result.secure_url,
            caption: caption || '',
            author: new mongoose_2.Types.ObjectId(userId),
        });
        return (await newReel.save()).populate('author', 'name profilePicture');
    }
    async findAll() {
        return this.reelModel
            .find()
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture')
            .exec();
    }
};
exports.ReelsService = ReelsService;
exports.ReelsService = ReelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reel_schema_1.Reel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], ReelsService);
//# sourceMappingURL=reels.service.js.map