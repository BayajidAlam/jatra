import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { SalesModule } from './sales/sales.module';
import { OperationsModule } from './operations/operations.module';
import { UsersModule } from './users/users.module';
import { FinancialModule } from './financial/financial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SalesModule,
    OperationsModule,
    UsersModule,
    FinancialModule,
  ],
})
export class AppModule {}
