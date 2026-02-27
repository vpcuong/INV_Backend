import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SOAnalyticsService } from './application/so-analytics.service';
import {
  SOAnalyticsBaseDto,
  SORevenueAnalyticsDto,
  SOTopCustomersDto,
  SOTopSkusDto,
} from './dto/so-analytics.dto';

@ApiTags('SO Analytics')
@ApiBearerAuth()
@Controller('so/analytics')
export class SOAnalyticsController {
  constructor(private readonly analyticsService: SOAnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Sales order overview statistics',
    description: 'Returns total revenue, order count, avg order value, and breakdown by status. Excludes CANCELLED and DRAFT orders.',
  })
  @ApiResponse({ status: 200, description: 'Overview statistics' })
  getOverview(@Query() dto: SOAnalyticsBaseDto) {
    return this.analyticsService.getOverview(dto);
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Revenue series grouped by time period',
    description: 'Returns revenue and order count grouped by day, week, or month.',
  })
  @ApiResponse({ status: 200, description: 'Revenue time series' })
  getRevenueSeries(@Query() dto: SORevenueAnalyticsDto) {
    return this.analyticsService.getRevenueSeries(dto);
  }

  @Get('by-customer')
  @ApiOperation({
    summary: 'Revenue breakdown by customer',
    description: 'Returns top customers ranked by revenue descending.',
  })
  @ApiResponse({ status: 200, description: 'Revenue by customer' })
  getRevenueByCustomer(@Query() dto: SOTopCustomersDto) {
    return this.analyticsService.getRevenueByCustomer(dto);
  }

  @Get('top-skus')
  @ApiOperation({
    summary: 'Top selling SKUs',
    description: 'Returns top SKUs ranked by revenue descending.',
  })
  @ApiResponse({ status: 200, description: 'Top SKUs' })
  getTopSkus(@Query() dto: SOTopSkusDto) {
    return this.analyticsService.getTopSkus(dto);
  }
}
