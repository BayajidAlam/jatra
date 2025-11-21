import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TrainsService } from './trains.service';
import { CreateTrainDto } from './dto/create-train.dto';

@ApiTags('trains')
@Controller('trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new train' })
  @ApiResponse({ status: 201, description: 'Train created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTrainDto: CreateTrainDto) {
    return this.trainsService.create(createTrainDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active trains' })
  @ApiResponse({ status: 200, description: 'List of all active trains with coaches and seats' })
  findAll() {
    return this.trainsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get train by ID' })
  @ApiParam({ name: 'id', description: 'Train ID' })
  @ApiResponse({ status: 200, description: 'Train details with coaches, seats, and upcoming journeys' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  findOne(@Param('id') id: string) {
    return this.trainsService.findOne(id);
  }

  @Get('number/:trainNumber')
  @ApiOperation({ summary: 'Get train by train number' })
  @ApiParam({ name: 'trainNumber', description: 'Train number (e.g., SUBORNO-EXPRESS-701)' })
  @ApiResponse({ status: 200, description: 'Train details' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  findByTrainNumber(@Param('trainNumber') trainNumber: string) {
    return this.trainsService.findByTrainNumber(trainNumber);
  }
}
