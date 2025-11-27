import { Module, Global } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { HttpRetryService } from './http-retry.service';

@Global()
@Module({
  imports: [
    NestHttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [HttpRetryService],
  exports: [NestHttpModule, HttpRetryService],
})
export class HttpModule {}
