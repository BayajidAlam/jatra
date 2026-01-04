import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { QueryStationsDto, CreateStationDto, UpdateStationDto } from './dto/station.dto';

@ApiTags('stations')
@Controller('admin/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations with pagination' })
  async findAll(@Query() query: QueryStationsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const skip = (page - 1) * limit;
    return this.stationsService.findAll({ skip, take: limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  async findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new station' })
  async create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update station' })
  async update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete station' })
  async remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}
