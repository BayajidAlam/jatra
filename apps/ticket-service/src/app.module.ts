import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TicketsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
