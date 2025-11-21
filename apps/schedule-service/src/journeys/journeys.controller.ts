import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JourneysService } from './journeys.service';
import { SearchJourneysDto } from './dto/search-journeys.dto';

@ApiTags('journeys')
@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for available train journeys' })
  @ApiQuery({ name: 'from', description: 'From station code (e.g., DHK)', required: true })
  @ApiQuery({ name: 'to', description: 'To station code (e.g., CTG)', required: true })
  @ApiQuery({ name: 'date', description: 'Journey date (YYYY-MM-DD)', required: true })
  @ApiQuery({ name: 'trainType', description: 'Train type filter', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of available journeys with train details, seats, and route information',
  })
  search(@Query() searchDto: SearchJourneysDto) {
    return this.journeysService.searchJourneys(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey details by ID' })
  @ApiParam({ name: 'id', description: 'Journey ID' })
  @ApiResponse({ status: 200, description: 'Journey details with train, route, and seat availability' })
  @ApiResponse({ status: 404, description: 'Journey not found' })
  findOne(@Param('id') id: string) {
    return this.journeysService.findOne(id);
  }

  @Get('train/:trainId')
  @ApiOperation({ summary: 'Get all journeys for a specific train' })
  @ApiParam({ name: 'trainId', description: 'Train ID' })
  @ApiQuery({ name: 'fromDate', description: 'Start date (YYYY-MM-DD)', required: false })
  @ApiResponse({ status: 200, description: 'List of journeys for the train' })
  findByTrainId(
    @Param('trainId') trainId: string,
    @Query('fromDate') fromDate?: string,
  ) {
    return this.journeysService.findByTrainId(trainId, fromDate);
  }
}
