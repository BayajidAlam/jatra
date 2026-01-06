import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { TrainsModule } from './trains/trains.module';
import { RoutesModule } from './routes/routes.module';
import { JourneysModule } from './journeys/journeys.module';
import { StationsModule } from './stations/stations.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { StatsModule } from './stats/stats.module';
import { CoachesModule } from './coaches/coaches.module';
import { SeatsModule } from './seats/seats.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentsModule } from './payments/payments.module';
import { RabbitMQService } from './common/rabbitmq.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    TrainsModule,
    RoutesModule,
    JourneysModule,
    StationsModule,
    UsersModule,
    BookingsModule,
    StatsModule,
    CoachesModule,
    CoachesModule, // Duplicate removal
    SeatsModule,
    SettingsModule,
    PaymentsModule,
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class AppModule {}
