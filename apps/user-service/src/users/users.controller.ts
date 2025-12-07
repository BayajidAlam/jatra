import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePassengerDto, UpdatePassengerDto } from './dto/passenger.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';
import { TravelHistoryQueryDto } from './dto/travel-history.dto';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req: any) {
    // In production, userId comes from JWT token via AuthGuard
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated' })
  async deactivateAccount(@Request() req: any) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.deactivateAccount(userId);
  }
}

@ApiTags('passengers')
@Controller('api/users/passengers')
export class PassengersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved passengers' })
  @ApiResponse({ status: 200, description: 'List of saved passengers' })
  async getSavedPassengers(@Request() req: any) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.getSavedPassengers(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add new saved passenger' })
  @ApiResponse({ status: 201, description: 'Passenger added successfully' })
  async addPassenger(@Request() req: any, @Body() dto: CreatePassengerDto) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.addPassenger(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update saved passenger' })
  @ApiResponse({ status: 200, description: 'Passenger updated successfully' })
  async updatePassenger(
    @Request() req: any,
    @Param('id') passengerId: string,
    @Body() dto: UpdatePassengerDto,
  ) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.updatePassenger(userId, passengerId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete saved passenger' })
  @ApiResponse({ status: 200, description: 'Passenger deleted successfully' })
  async deletePassenger(@Request() req: any, @Param('id') passengerId: string) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.deletePassenger(userId, passengerId);
  }
}

@ApiTags('preferences')
@Controller('api/users/preferences')
export class PreferencesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved' })
  async getPreferences(@Request() req: any) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.getPreferences(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.updatePreferences(userId, dto);
  }
}

@ApiTags('history')
@Controller('api/users/travel-history')
export class TravelHistoryController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user travel history and statistics' })
  @ApiResponse({ status: 200, description: 'Travel history retrieved' })
  async getTravelHistory(@Request() req: any, @Query() query: TravelHistoryQueryDto) {
    const userId = req.headers['x-user-id'] || 'mock-user-id';
    return this.usersService.getTravelHistory(userId, query);
  }
}
