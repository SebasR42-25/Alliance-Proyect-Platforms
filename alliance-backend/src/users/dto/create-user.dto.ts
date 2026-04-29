import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({
    example: 'Derik Camilo Muñoz',
    description: 'Nombre completo del usuario',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;
  @ApiProperty({
    example: 'derik@javerianacali.edu.co',
    description: 'Correo electrónico institucional o personal',
  })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;
  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña de acceso (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
  @ApiProperty({
    example: 'Estudiante de Ingeniería de Sistemas en la Javeriana Cali',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
  @ApiProperty({
    example: ['NestJS', 'MongoDB', 'React'],
    description: 'Lista de habilidades técnicas',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
  @ApiProperty({
    example: 'Cali, Colombia',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;
}
