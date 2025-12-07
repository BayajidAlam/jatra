import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription(
      'User profile management, saved passengers, and preferences for Jatra Railway',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', 'User profile operations')
    .addTag('passengers', 'Saved passenger management')
    .addTag('preferences', 'User preferences')
    .addTag('history', 'Travel history and stats')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3008;
  await app.listen(port);

  console.log(`🚀 User Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`👤 Manage profiles, passengers, and preferences`);
}

bootstrap();
