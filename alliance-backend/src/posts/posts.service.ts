import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../users/schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}
  async create(createPostDto: CreatePostDto, userId: string) {
    const newPost = new this.postModel({
      ...createPostDto,
      author: new Types.ObjectId(userId),
    });
    return (await newPost.save()).populate('author', 'name profilePicture');
  }
  async findAll() {
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .exec();
  }
  async findByUserId(userId: string) {
    return this.postModel
      .find({ author: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture')
      .exec();
  }
  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');
    const userObjId = new Types.ObjectId(userId);
    const likeIndex = post.likes.indexOf(userObjId);
    let isLiked = false;
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userObjId);
      isLiked = true;
    }
    await post.save();
    if (isLiked && post.author.toString() !== userId) {
      const liker = await this.userModel.findById(userId);
      this.notificationsGateway.sendNotification(post.author.toString(), {
        type: 'NEW_LIKE',
        message: `${liker?.name} le dio me gusta a tu publicación.`,
        payload: { postId: post._id, likerName: liker?.name },
      });
    }
    return { likesCount: post.likes.length, isLiked };
  }
  async addComment(postId: string, userId: string, text: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');
    const newComment = {
      user: new Types.ObjectId(userId),
      text,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();
    if (post.author.toString() !== userId) {
      const commenter = await this.userModel.findById(userId);
      this.notificationsGateway.sendNotification(post.author.toString(), {
        type: 'NEW_COMMENT',
        message: `${commenter?.name} comentó tu publicación: "${text.substring(0, 25)}..."`,
        payload: { postId: post._id, comment: text },
      });
    }
    return post.populate('comments.user', 'name profilePicture');
  }
  async remove(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post no encontrado');
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para borrar este post');
    }
    await post.deleteOne();
    return { message: 'Post eliminado correctamente' };
  }
}
