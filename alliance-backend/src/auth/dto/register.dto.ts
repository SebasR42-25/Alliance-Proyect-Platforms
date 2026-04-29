import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
  @ApiProperty({ example: 'Derik Camilo', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'derik@correo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
