import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrainsService } from './trains.service';
import { CreateTrainDto, UpdateTrainDto, QueryTrainsDto } from './dto/train.dto';

@ApiTags('trains')
@Controller('admin/trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trains with pagination' })
  @ApiResponse({ status: 200, description: 'List of trains retrieved' })
  async findAll(@Query() query: QueryTrainsDto) {
    return this.trainsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get train by ID' })
  @ApiResponse({ status: 200, description: 'Train details retrieved' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  async findOne(@Param('id') id: string) {
    return this.trainsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new train' })
  @ApiResponse({ status: 201, description: 'Train created successfully' })
  @ApiResponse({ status: 409, description: 'Train number already exists' })
  async create(@Body() dto: CreateTrainDto) {
    return this.trainsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update train' })
  @ApiResponse({ status: 200, description: 'Train updated successfully' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrainDto) {
    return this.trainsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete train' })
  @ApiResponse({ status: 200, description: 'Train deleted successfully' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  @ApiResponse({ status: 409, description: 'Train has active journeys' })
  async remove(@Param('id') id: string) {
    return this.trainsService.remove(id);
  }
}
