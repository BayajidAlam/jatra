import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrainsModule } from './trains/trains.module';
import { StationsModule } from './stations/stations.module';
import { RoutesModule } from './routes/routes.module';
import { JourneysModule } from './journeys/journeys.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrainsModule,
    StationsModule,
    RoutesModule,
    JourneysModule,
  ],
})
export class AppModule {}
