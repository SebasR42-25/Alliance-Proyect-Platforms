import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { ReelsService } from './reels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
interface RequestUser {
  userId: string;
  email: string;
}
@ApiTags('Reels (Videos Cortos)')
@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir un nuevo reel (Video)' })
  async create(
    @GetUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    return this.reelsService.create(file, user.userId, caption);
  }
  @Get()
  @ApiOperation({ summary: 'Obtener el feed de reels' })
  async findAll() {
    return this.reelsService.findAll();
  }
}
