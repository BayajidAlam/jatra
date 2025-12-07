import { Controller, Get, Post, Delete, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchJourneysDto } from './dto/search-journeys.dto';
import { AutocompleteStationsDto } from './dto/autocomplete-stations.dto';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('journeys')
  @ApiOperation({ summary: 'Search journeys with caching' })
  @ApiResponse({ status: 200, description: 'Journey search results' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async searchJourneys(@Query() dto: SearchJourneysDto) {
    return this.searchService.searchJourneys(dto);
  }

  @Get('popular-routes')
  @ApiOperation({ summary: 'Get popular routes based on search frequency' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of popular routes' })
  async getPopularRoutes(@Query('limit') limit?: number) {
    return this.searchService.getPopularRoutes(limit || 10);
  }

  @Get('autocomplete/stations')
  @ApiOperation({ summary: 'Station name autocomplete' })
  @ApiResponse({ status: 200, description: 'Matching stations' })
  async autocompleteStations(@Query() dto: AutocompleteStationsDto) {
    return this.searchService.autocompleteStations(dto);
  }

  @Get('stations')
  @ApiOperation({ summary: 'Get all stations (cached)' })
  @ApiResponse({ status: 200, description: 'All stations' })
  async getAllStations() {
    return this.searchService.getAllStations();
  }
}

@ApiTags('cache')
@Controller('search/cache')
export class CacheController {
  constructor(private readonly searchService: SearchService) {}

  @Post('invalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate specific cache entries' })
  @ApiResponse({ status: 200, description: 'Cache invalidated successfully' })
  async invalidateCache(@Body() dto: InvalidateCacheDto) {
    return this.searchService.invalidateCache(dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all search cache' })
  @ApiResponse({ status: 200, description: 'All cache cleared' })
  async clearCache() {
    return this.searchService.clearAllCache();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics' })
  async getCacheStats() {
    return this.searchService.getCacheStats();
  }
}

@ApiTags('analytics')
@Controller('search/analytics')
export class AnalyticsController {
  constructor(private readonly searchService: SearchService) {}

  @Get('popular-searches')
  @ApiOperation({ summary: 'Get most searched routes' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Search analytics data' })
  async getSearchAnalytics(@Query('limit') limit?: number) {
    return this.searchService.getSearchAnalytics(limit || 20);
  }
}
