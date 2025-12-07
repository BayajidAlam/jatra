import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OperationsService } from './operations.service';

@ApiTags('operations')
@Controller('api/reports/operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get('trains')
  @ApiOperation({ summary: 'Get train utilization report' })
  async getTrainUtilization() {
    return this.operationsService.getTrainUtilization();
  }

  @Get('routes')
  @ApiOperation({ summary: 'Get route performance report' })
  async getRoutePerformance() {
    return this.operationsService.getRoutePerformance();
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get seat occupancy report' })
  async getOccupancy() {
    return this.operationsService.getOccupancy();
  }
}
