import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

interface RequestUser {
  userId: string;
  email: string;
}

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Crear o encontrar conversación con otro usuario' })
  async createConversation(
    @GetUser() user: RequestUser,
    @Body() body: { targetUserId: string },
  ) {
    return this.chatService.findOrCreateConversation(user.userId, body.targetUserId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Obtener la lista de chats activos del usuario' })
  async getConversations(@GetUser() user: RequestUser) {
    return this.chatService.getUserConversations(user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obtener el historial de mensajes de un chat específico' })
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
