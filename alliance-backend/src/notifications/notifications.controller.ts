import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';

interface RequestUser { userId: string; email: string; }

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Cantidad de notificaciones no leídas (solicitudes pendientes)' })
  async getUnreadCount(@GetUser() user: RequestUser) {
    const dbUser = await this.userModel.findById(user.userId).select('connectionRequests').lean();
    return { count: dbUser?.connectionRequests?.length ?? 0 };
  }

  @Get('requests')
  @ApiOperation({ summary: 'Solicitudes de conexión pendientes con datos del remitente' })
  async getPendingRequests(@GetUser() user: RequestUser) {
    const dbUser = await this.userModel
      .findById(user.userId)
      .populate('connectionRequests', 'name profilePicture bio location')
      .select('connectionRequests')
      .lean();
    return dbUser?.connectionRequests ?? [];
  }
}
