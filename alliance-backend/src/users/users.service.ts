import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
  async create(userData: CreateUserData): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }
  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }
  async getNetwork(userId: string): Promise<User[]> {
    return this.userModel
      .find({ _id: { $ne: userId } })
      .select('-password -connectionRequests')
      .exec();
  }
  async sendConnectionRequest(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException(
        'No puedes enviarte una solicitud a ti mismo',
      );
    }
    const [targetUser, currentUser] = await Promise.all([
      this.userModel.findById(targetUserId),
      this.userModel.findById(currentUserId),
    ]);
    if (!targetUser)
      throw new NotFoundException('Usuario destino no encontrado');
    if (!currentUser) throw new NotFoundException('Tu usuario no existe');
    const currentUserObjId = new Types.ObjectId(currentUserId);
    if (targetUser.connections.includes(currentUserObjId)) {
      throw new BadRequestException('Ya estás conectado con este usuario');
    }
    if (targetUser.connectionRequests.includes(currentUserObjId)) {
      throw new BadRequestException(
        'La solicitud ya fue enviada anteriormente',
      );
    }
    targetUser.connectionRequests.push(currentUserObjId);
    await targetUser.save();
    this.notificationsGateway.sendNotification(targetUserId, {
      type: 'CONNECTION_REQUEST',
      message: `${currentUser.name} quiere conectar contigo en Alliance.`,
      payload: {
        senderId: currentUserId,
        senderName: currentUser.name,
        senderPhoto: currentUser.profilePicture,
      },
    });
    return { message: 'Solicitud de conexión enviada con éxito' };
  }
  async searchGlobal(query: string) {
    const regex = new RegExp(query, 'i');
    const [users, jobs] = await Promise.all([
      this.userModel
        .find({
          $or: [{ name: regex }, { skills: { $in: [regex] } }, { bio: regex }],
        })
        .select('name profilePicture skills location')
        .limit(10)
        .exec(),
      this.userModel.db
        .model('Job')
        .find({
          $or: [
            { title: regex },
            { tags: { $in: [regex] } },
            { location: regex },
          ],
        })
        .populate('company', 'name logoUrl')
        .limit(10)
        .exec(),
    ]);
    return {
      results: {
        users,
        jobs,
        totalFound: users.length + jobs.length,
      },
    };
  }
  async acceptConnection(currentUserId: string, senderId: string) {
    const currentUser = await this.userModel.findById(currentUserId);
    const senderUser = await this.userModel.findById(senderId);
    if (!currentUser || !senderUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const senderObjId = new Types.ObjectId(senderId);
    if (!currentUser.connectionRequests.includes(senderObjId)) {
      throw new BadRequestException(
        'No tienes una solicitud pendiente de este usuario',
      );
    }
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      (id) => id.toString() !== senderId,
    );
    const currentObjId = new Types.ObjectId(currentUserId);
    if (!currentUser.connections.includes(senderObjId))
      currentUser.connections.push(senderObjId);
    if (!senderUser.connections.includes(currentObjId))
      senderUser.connections.push(currentObjId);
    await Promise.all([currentUser.save(), senderUser.save()]);
    this.notificationsGateway.sendNotification(senderId, {
      type: 'CONNECTION_ACCEPTED',
      message: `${currentUser.name} aceptó tu solicitud de conexión. ¡Ya pueden chatear!`,
      payload: { userId: currentUserId, userName: currentUser.name },
    });
    return { message: 'Conexión establecida con éxito' };
  }
  async rejectConnection(currentUserId: string, senderId: string) {
    await this.userModel.findByIdAndUpdate(currentUserId, {
      $pull: { connectionRequests: new Types.ObjectId(senderId) },
    });
    return { message: 'Solicitud rechazada correctamente' };
  }
}
