import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
interface RequestUser {
  userId: string;
  email: string;
}
@ApiTags('Publicaciones (Feed)')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva publicación' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: RequestUser,
  ) {
    return this.postsService.create(createPostDto, user.userId);
  }
  @Get()
  @ApiOperation({ summary: 'Obtener todas las publicaciones' })
  async findAll() {
    return this.postsService.findAll();
  }
  @Patch(':id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dar o quitar Like a un post' })
  async toggleLike(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.postsService.toggleLike(id, user.userId);
  }
  @Post(':id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Añadir un comentario' })
  async addComment(
    @Param('id') id: string,
    @Body('text') text: string,
    @GetUser() user: RequestUser,
  ) {
    return this.postsService.addComment(id, user.userId, text);
  }
}
