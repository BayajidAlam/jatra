import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService, PrismaService],
  exports: [RoutesService],
})
export class RoutesModule {}
