import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [StationsController],
  providers: [StationsService, PrismaService],
  exports: [StationsService],
})
export class StationsModule {}
