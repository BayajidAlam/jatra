import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JourneysService } from './journeys.service';
import { CreateJourneyDto, UpdateJourneyDto } from './dto/journey.dto';

@ApiTags('journeys')
@Controller('admin/journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Get()
  @ApiOperation({ summary: 'Get all journeys with pagination' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.journeysService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey by ID' })
  async findOne(@Param('id') id: string) {
    return this.journeysService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new journey' })
  async create(@Body() createJourneyDto: CreateJourneyDto) {
    return this.journeysService.create(createJourneyDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update journey' })
  async update(@Param('id') id: string, @Body() updateJourneyDto: UpdateJourneyDto) {
    return this.journeysService.update(id, updateJourneyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete journey' })
  async remove(@Param('id') id: string) {
    return this.journeysService.remove(id);
  }
}
