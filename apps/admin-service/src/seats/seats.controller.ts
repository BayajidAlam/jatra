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
import { SeatsService } from './seats.service';
import { CreateSeatDto, UpdateSeatDto, QuerySeatsDto, BulkCreateSeatsDto } from './dto/seat.dto';

@ApiTags('seats')
@Controller('admin/seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seats with pagination' })
  @ApiResponse({ status: 200, description: 'List of seats retrieved' })
  async findAll(@Query() query: QuerySeatsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const skip = (page - 1) * limit;
    return this.seatsService.findAll({ skip, take: limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seat by ID' })
  @ApiResponse({ status: 200, description: 'Seat details retrieved' })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  async findOne(@Param('id') id: string) {
    return this.seatsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new seat' })
  @ApiResponse({ status: 201, description: 'Seat created successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 409, description: 'Seat number already exists for this coach' })
  async create(@Body() dto: CreateSeatDto) {
    return this.seatsService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create seats for a coach' })
  @ApiResponse({ status: 201, description: 'Seats created successfully' })
  async bulkCreate(@Body() dto: BulkCreateSeatsDto) {
    return this.seatsService.bulkCreate(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update seat' })
  @ApiResponse({ status: 200, description: 'Seat updated successfully' })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSeatDto) {
    return this.seatsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete seat' })
  @ApiResponse({ status: 200, description: 'Seat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  async remove(@Param('id') id: string) {
    return this.seatsService.remove(id);
  }
}
