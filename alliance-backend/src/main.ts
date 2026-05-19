import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3001', // Next.js web
      'http://localhost:3000', // Web dev
      'http://localhost:8081', // Expo web
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,  // LAN física
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,   // Android emulator
      /^exp:\/\//,                               // Expo Go deep link
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Alliance API')
    .setDescription(
      'Red social para profesionales de ingeniería - Pontificia Universidad Javeriana Cali',
    )
    .setVersion('1.0')
    .addBearerAuth() // Habilita el candadito para el JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Alliance Backend corriendo en: http://0.0.0.0:${port}/api`);
  console.log(
    `📖 Documentación disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
