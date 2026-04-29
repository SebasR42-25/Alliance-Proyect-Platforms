import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
interface RequestUser {
  userId: string;
  email: string;
}
@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Patch('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir o actualizar mi foto de perfil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadAvatar(
    @GetUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es obligatorio');
    }
    const result = await this.cloudinaryService.uploadFile(file);
    return this.usersService.update(user.userId, {
      profilePicture: result.secure_url,
    });
  }
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener mi perfil' })
  async getProfile(@GetUser() user: RequestUser) {
    return this.usersService.findById(user.userId);
  }
  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar mis datos de perfil' })
  async updateProfile(
    @GetUser() user: RequestUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateUserDto);
  }
  @Get('network')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener sugerencias de profesionales' })
  async getNetwork(@GetUser() user: RequestUser) {
    return this.usersService.getNetwork(user.userId);
  }
  @Get('search')
  @ApiOperation({ summary: 'Buscador global de profesionales y empleos' })
  async globalSearch(@Query('q') query: string) {
    if (!query) throw new BadRequestException('Debes proporcionar un término');
    return this.usersService.searchGlobal(query);
  }
  @Post('connections/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enviar solicitud de conexión' })
  async sendConnectionRequest(
    @Param('id') targetId: string,
    @GetUser() user: RequestUser,
  ) {
    return this.usersService.sendConnectionRequest(user.userId, targetId);
  }
  @Patch('connections/accept/:senderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aceptar una solicitud de conexión' })
  async accept(
    @GetUser() user: RequestUser, // CAMBIO: any -> RequestUser
    @Param('senderId') senderId: string,
  ) {
    return this.usersService.acceptConnection(user.userId, senderId);
  }
  @Delete('connections/reject/:senderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rechazar una solicitud de conexión' })
  async reject(
    @GetUser() user: RequestUser, // CAMBIO: any -> RequestUser
    @Param('senderId') senderId: string,
  ) {
    return this.usersService.rejectConnection(user.userId, senderId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil público por ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  async findAll() {
    return this.usersService.findAll();
  }
}
