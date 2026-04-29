import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Juan Sebastián', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Cali, Colombia', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'Ingeniero de Sistemas apasionado por el Backend', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: ['NestJS', 'TypeScript', 'MongoDB'], required: false })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ example: 'https://mi-foto.com/perfil.jpg', required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ example: 'Senior', required: false })
  @IsString()
  @IsOptional()
  seniority?: string;

  @ApiProperty({ example: 'Backend Development', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: 'Technology', required: false })
  @IsString()
  @IsOptional()
  sector?: string;
}
