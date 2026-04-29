import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
@ApiTags('Desarrollo (Seed)')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}
  @Get()
  @ApiOperation({ summary: 'Reiniciar base de datos con datos de prueba' })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
