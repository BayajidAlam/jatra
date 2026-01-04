import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';

@ApiTags('financial')
@Controller('api/reports/financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.getSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('by-route')
  @ApiOperation({ summary: 'Get revenue by route' })
  async getByRoute() {
    return this.financialService.getByRoute();
  }

  @Get('by-train')
  @ApiOperation({ summary: 'Get revenue by train' })
  async getByTrain() {
    return this.financialService.getByTrain();
  }
}
