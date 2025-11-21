import { Module } from '@nestjs/common';
import { JourneysController } from './journeys.controller';
import { JourneysService } from './journeys.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [JourneysController],
  providers: [JourneysService, PrismaService],
  exports: [JourneysService],
})
export class JourneysModule {}
