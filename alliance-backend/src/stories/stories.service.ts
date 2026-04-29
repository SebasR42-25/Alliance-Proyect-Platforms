import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story } from './schemas/story.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(file: Express.Multer.File, userId: string): Promise<Story> {
    if (!file) {
      throw new BadRequestException('El archivo de la historia es obligatorio');
    }
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      const newStory = new this.storyModel({
        author: new Types.ObjectId(userId),
        mediaUrl: result.secure_url,
        // Detectamos automáticamente si es video o imagen
        mediaType: result.resource_type === 'video' ? 'video' : 'image',
        viewedBy: [],
      });
      const savedStory = await newStory.save();
      return savedStory.populate({
        path: 'author',
        select: 'name profilePicture',
      });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw new InternalServerErrorException(
        'Error al procesar la historia en la nube',
      );
    }
  }
  async findAllActive(): Promise<Story[]> {
    return this.storyModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture')
      .exec();
  }
  async markAsViewed(storyId: string, userId: string) {
    const story = await this.storyModel.findById(storyId).exec();
    if (!story) {
      throw new NotFoundException('La historia no existe o ya expiró (24h)');
    }
    const userIdStr = userId.toString();
    const alreadyViewed = story.viewedBy.some(
      (id) => id.toString() === userIdStr,
    );
    if (!alreadyViewed) {
      story.viewedBy.push(new Types.ObjectId(userId));
      await story.save();
    }
    return {
      message: 'Historia marcada como vista',
      viewsCount: story.viewedBy.length,
    };
  }
}
