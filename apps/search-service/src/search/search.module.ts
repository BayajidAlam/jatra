import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { SearchService } from './search.service';
import { SearchController, CacheController, AnalyticsController } from './search.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController, CacheController, AnalyticsController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
