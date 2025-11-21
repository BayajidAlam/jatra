import { Module } from '@nestjs/common';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [TrainsController],
  providers: [TrainsService, PrismaService],
  exports: [TrainsService],
})
export class TrainsModule {}
