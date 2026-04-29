import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
@ApiTags('Historias (24h)')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // Campo 'file' en el FormData
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una historia (Imagen o Video)' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ) {
    return this.storiesService.create(file, user.userId);
  }
  @Get()
  @ApiOperation({ summary: 'Obtener historias activas de las últimas 24h' })
  async findAll() {
    return this.storiesService.findAllActive();
  }
  @Patch(':id/view')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar historia como vista' })
  async markAsViewed(@Param('id') id: string, @GetUser() user: any) {
    return this.storiesService.markAsViewed(id, user.userId);
  }
}
