import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { QueryRoutesDto, CreateRouteDto, UpdateRouteDto } from './dto/route.dto';

@ApiTags('routes')
@Controller('admin/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all routes with pagination' })
  async findAll(@Query() query: QueryRoutesDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const skip = (page - 1) * limit;
    return this.routesService.findAll({ skip, take: limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  async create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update route' })
  async update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete route' })
  async remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}
