import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateReelDto {
  @ApiProperty({
    example: 'https://mi-storage.com/alianza-reel.mp4',
    description: 'URL del video',
  })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsNotEmpty()
  videoUrl: string;
  @ApiProperty({
    example: 'Mi primer día en Alliance #tech #networking',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300, {
    message: 'La descripción no puede superar los 300 caracteres',
  })
  caption?: string;
}
