import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto, QueryCoachesDto } from './dto/coach.dto';

@ApiTags('coaches')
@Controller('api/admin/coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coaches with pagination' })
  @ApiResponse({ status: 200, description: 'List of coaches retrieved' })
  async findAll(@Query() query: QueryCoachesDto) {
    return this.coachesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coach by ID' })
  @ApiResponse({ status: 200, description: 'Coach details retrieved' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  async findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  @ApiResponse({ status: 404, description: 'Train not found' })
  @ApiResponse({ status: 409, description: 'Coach code already exists for this train' })
  async create(@Body() dto: CreateCoachDto) {
    return this.coachesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coach' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
    return this.coachesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete coach' })
  @ApiResponse({ status: 200, description: 'Coach deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  async remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
