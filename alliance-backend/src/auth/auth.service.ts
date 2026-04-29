import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Encuentra o crea un usuario vía OAuth y retorna el JWT del backend */
  async oauthLogin(dto: OAuthLoginDto) {
    const { email, name, avatar } = dto;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Primera vez — crear usuario sin contraseña (es OAuth)
      user = await this.usersService.create({
        name,
        email,
        profilePicture: avatar,
      });
    } else if (avatar && !user.profilePicture) {
      // Actualiza avatar si el usuario no tiene uno todavía
      await this.usersService.update(user._id.toString(), { profilePicture: avatar });
    }

    const payload = { sub: user._id.toString(), email: user.email };
    return {
      message: 'OAuth login exitoso',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id:    user._id.toString(),
        name:  user.name,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });
    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { sub: user._id.toString(), email: user.email };
    return {
      message: 'Inicio de sesión exitoso',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
