import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCompanyDto {
  @ApiProperty({ example: 'Zonamerica', description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'https://logo.com/img.png', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;
  @ApiProperty({ example: 'Parque tecnológico y de negocios', required: false })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({ example: 'Tecnología', required: false })
  @IsString()
  @IsOptional()
  industry?: string;
}
