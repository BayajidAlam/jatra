import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UsersController,
  PassengersController,
  PreferencesController,
  TravelHistoryController,
} from './users.controller';

@Module({
  controllers: [
    UsersController,
    PassengersController,
    PreferencesController,
    TravelHistoryController,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
