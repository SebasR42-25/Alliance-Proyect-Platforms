import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
@ApiTags('Empresas')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}
  @Get()
  @ApiOperation({ summary: 'Obtener lista de todas las empresas' })
  async findAll() {
    return this.companiesService.findAll();
  }
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva empresa' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener el perfil detallado de una empresa' })
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los datos o el banner de la empresa' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa del sistema' })
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
  @Get(':id/jobs')
  @ApiOperation({ summary: 'Obtener las vacantes específicas de una empresa' })
  async findJobs(@Param('id') id: string) {
    return this.companiesService.findJobsByCompany(id);
  }
}
