import { IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class QueryJobDto {
  @ApiProperty({ example: 'Developer', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Cali', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '65239e23849...', required: false, description: 'ID de la empresa para filtrar vacantes' })
  @IsMongoId()
  @IsOptional()
  company?: string;
}
