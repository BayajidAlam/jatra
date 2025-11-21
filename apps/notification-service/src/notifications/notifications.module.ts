import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../common/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
