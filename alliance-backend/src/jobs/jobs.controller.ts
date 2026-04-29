import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
interface RequestUser {
  userId: string;
  email: string;
}
@ApiTags('Empleos (Vacantes)')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  @Get()
  @ApiOperation({
    summary:
      'Obtener todas las ofertas de empleo (soporta filtros de título o ubicación)',
  })
  async findAll(@Query() query: QueryJobDto) {
    return this.jobsService.findAll(query);
  }
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva vacante de empleo (Admin/Empresa)',
  })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de una vacante específica' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los datos de una vacante' })
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una oferta de trabajo' })
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
  @Post(':id/apply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Postularse a una oferta' })
  async apply(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.jobsService.applyToJob(id, user.userId);
  }
  @Post(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar/Quitar oferta (Bookmark)' })
  async saveJob(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.jobsService.saveJob(id, user.userId);
  }
}
