import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reel } from './schemas/reel.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reel.name) private reelModel: Model<Reel>,
    private readonly cloudinaryService: CloudinaryService, // Inyectamos tu servicio corregido
  ) {}
  async create(file: Express.Multer.File, userId: string, caption?: string) {
    if (!file)
      throw new BadRequestException('El archivo de video es requerido');
    const result = await this.cloudinaryService.uploadFile(file);
    const newReel = new this.reelModel({
      videoUrl: result.secure_url,
      caption: caption || '',
      author: new Types.ObjectId(userId),
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
}
