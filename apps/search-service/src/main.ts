import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env.API_TITLE || 'Search Service API')
    .setDescription(
      process.env.API_DESCRIPTION ||
        'Optimized search service with Redis caching for Jatra Railway',
    )
    .setVersion(process.env.API_VERSION || '1.0')
    .addBearerAuth()
    .addTag('search', 'Journey search with caching')
    .addTag('cache', 'Cache management')
    .addTag('analytics', 'Search analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3009;
  await app.listen(port);

  console.log(`🚀 Search Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Redis caching enabled for optimized searches`);
}

bootstrap();
