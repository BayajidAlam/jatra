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
    .setTitle('Admin Service API')
    .setDescription(
      'Administrative operations for Jatra Railway - trains, routes, users, and system management',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('trains', 'Train management')
    .addTag('routes', 'Route management')
    .addTag('journeys', 'Journey scheduling')
    .addTag('stations', 'Station management')
    .addTag('users', 'User administration')
    .addTag('bookings', 'Booking oversight')
    .addTag('stats', 'System statistics')
    .addTag('coaches', 'Coach management')
    .addTag('seats', 'Seat management')
    .addTag('settings', 'Global system settings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3010;
  await app.listen(port);

  console.log(`🚀 Admin Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🔐 Admin operations - requires ADMIN role`);
}

bootstrap();
