import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthLoginDto {
  @ApiProperty({ example: 'google', description: 'Proveedor OAuth' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'juan@gmail.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Juan Rojas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
