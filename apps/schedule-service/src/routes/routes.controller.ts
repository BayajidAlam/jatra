import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route with stops' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data or stop orders' })
  @ApiResponse({ status: 404, description: 'One or more stations not found' })
  @ApiResponse({ status: 409, description: 'Route with this name already exists' })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active routes' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by route name' })
  @ApiResponse({ status: 200, description: 'List of all active routes with stops' })
  findAll(@Query('name') name?: string) {
    if (name) {
      return this.routesService.findByName(name);
    }
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiResponse({ status: 200, description: 'Route details with all stops' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }
}
