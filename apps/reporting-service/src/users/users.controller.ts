import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/reports/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('growth')
  @ApiOperation({ summary: 'Get user growth metrics' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  async getGrowth(@Query('days') days?: number) {
    return this.usersService.getGrowth(days ? Number(days) : 30);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity patterns' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  async getActivity(@Query('days') days?: number) {
    return this.usersService.getActivity(days ? Number(days) : 30);
  }

  @Get('demographics')
  @ApiOperation({ summary: 'Get user demographics' })
  async getDemographics() {
    return this.usersService.getDemographics();
  }
}
