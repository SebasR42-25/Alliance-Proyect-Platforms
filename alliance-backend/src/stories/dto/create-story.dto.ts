import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateStoryDto {
  @ApiProperty({ example: 'https://mi-storage.com/historia.mp4' })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;
  @ApiProperty({ example: 'video', enum: ['image', 'video'] })
  @IsEnum(['image', 'video'], { message: 'El tipo debe ser image o video' })
  @IsNotEmpty()
  mediaType: string;
}
