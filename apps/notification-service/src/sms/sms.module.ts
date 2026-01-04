import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
