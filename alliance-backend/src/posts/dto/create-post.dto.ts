import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePostDto {
  @ApiProperty({
    example: '¡Acabo de terminar mi primer sprint en Alliance!',
    description: 'Contenido del post',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
  @ApiProperty({
    example: 'https://imagen-de-ejemplo.com/foto.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
  @ApiProperty({ example: ['#tech', '#networking'], required: false })
  @IsArray()
  @IsOptional()
  hashtags?: string[];
}
