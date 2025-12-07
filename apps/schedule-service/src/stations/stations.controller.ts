import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';

@ApiTags('stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Station code already exists' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active stations' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city name' })
  @ApiResponse({ status: 200, description: 'List of all active stations' })
  findAll(@Query('city') city?: string) {
    if (city) {
      return this.stationsService.findByCity(city);
    }
    return this.stationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiResponse({ status: 200, description: 'Station details' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get station by code' })
  @ApiParam({ name: 'code', description: 'Station code (e.g., DHK, CTG)' })
  @ApiResponse({ status: 200, description: 'Station details' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findByCode(@Param('code') code: string) {
    return this.stationsService.findByCode(code);
  }
}
