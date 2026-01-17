import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupplierService } from './application/supplier.service';
import { SupplierQueryService } from './application/supplier-query.service';
import { SupplierAggregationService } from './application/supplier-aggregation.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierFilterDto } from './dto/supplier-filter.dto';
import { SupplierAggregationRequestDto } from './dto/supplier-aggregation.dto';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SupplierService,
    private readonly supplierQueryService: SupplierQueryService,
    private readonly supplierAggregationService: SupplierAggregationService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all suppliers with filtering, sorting, and pagination',
    description:
      'Supports search, filters, sorting, pagination, and field selection. Use query parameters for quick filters or advanced JSON-based filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated suppliers with metadata',
    schema: {
      example: {
        data: [
          {
            id: 1,
            code: 'SUP001',
            name: 'ABC Textiles Co.',
            email: 'contact@abctextiles.com',
            status: 'Active',
            category: 'Fabric',
            isActive: true,
          },
        ],
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findAll(@Query() filterDto: SupplierFilterDto) {
    return this.supplierQueryService.findAllWithFilters(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Return the supplier' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier activated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.deactivate(id);
  }

  @Get('filter/active')
  @ApiOperation({
    summary: 'Get active suppliers only',
    description:
      'Returns only active suppliers (isActive = true) with filtering support',
  })
  @ApiResponse({ status: 200, description: 'Return active suppliers' })
  findActive(@Query() filterDto: SupplierFilterDto) {
    filterDto.isActive = true;
    return this.supplierQueryService.findAllWithFilters(filterDto);
  }

  @Get('filter/category/:category')
  @ApiOperation({
    summary: 'Get suppliers by category',
    description:
      'Filter suppliers by specific category (Fabric, Accessories, Packaging, Yarn)',
  })
  @ApiResponse({ status: 200, description: 'Return suppliers by category' })
  findByCategory(
    @Param('category') category: string,
    @Query() filterDto: SupplierFilterDto
  ) {
    filterDto.category = category as any;
    return this.supplierQueryService.findAllWithFilters(filterDto);
  }

  @Get('aggregations/active-status')
  @ApiOperation({
    summary: 'Get active/inactive supplier counts',
    description:
      'Returns count and percentage of active (isActive=true) and inactive (isActive=false) suppliers. Supports all quick filters except isActive.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return active/inactive statistics',
    schema: {
      example: {
        total: 150,
        active: 120,
        inactive: 30,
        activePercentage: 80.0,
        inactivePercentage: 20.0,
      },
    },
  })
  getActiveStatusStatistics(@Query() filterDto: SupplierAggregationRequestDto) {
    return this.supplierAggregationService.getActiveStatusStatistics(filterDto);
  }

  @Get('aggregations/statistics')
  @ApiOperation({
    summary: 'Get comprehensive supplier statistics',
    description:
      'Returns detailed statistics including counts, ratings, distributions by category/status/country, and time-based metrics. Supports all quick filters from SupplierFilterDto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return comprehensive supplier statistics',
    schema: {
      example: {
        total: 150,
        active: 120,
        inactive: 25,
        blacklisted: 5,
        averageRating: 4.2,
        minRating: 2.5,
        maxRating: 5.0,
        suppliersWithRating: 140,
        suppliersWithoutRating: 10,
        byCategory: [
          { category: 'Fabric', count: 80, percentage: 53.33 },
          { category: 'Accessories', count: 40, percentage: 26.67 },
          { category: 'Yarn', count: 30, percentage: 20.0 },
        ],
        byStatus: [
          { status: 'Active', count: 120, percentage: 80.0 },
          { status: 'Inactive', count: 25, percentage: 16.67 },
        ],
        byCountry: [
          { country: 'Vietnam', count: 100, percentage: 66.67 },
          { country: 'China', count: 50, percentage: 33.33 },
        ],
        ratingDistribution: [
          { range: '4-5', count: 90, percentage: 60.0 },
          { range: '3-4', count: 40, percentage: 26.67 },
        ],
        createdThisMonth: 5,
        createdThisYear: 45,
      },
    },
  })
  getStatistics(@Query() filterDto: SupplierAggregationRequestDto) {
    return this.supplierAggregationService.getStatistics(filterDto);
  }

  @Get('aggregations/custom')
  @ApiOperation({
    summary: 'Get custom aggregations with groupBy and metrics',
    description:
      'Flexible aggregation endpoint. Group by fields (category, status, country, etc.) and apply metrics (count, avg, sum, min, max). Supports all quick filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return custom aggregations',
    schema: {
      example: {
        groups: [
          {
            groupBy: { category: 'Fabric', status: 'Active' },
            count: 70,
            avg: { rating: 4.5 },
            min: { rating: 3.0 },
            max: { rating: 5.0 },
          },
          {
            groupBy: { category: 'Accessories', status: 'Active' },
            count: 35,
            avg: { rating: 4.2 },
            min: { rating: 2.5 },
            max: { rating: 5.0 },
          },
        ],
        total: 150,
        appliedFilters: {
          groupBy: ['category', 'status'],
          metrics: ['count', 'avg', 'min', 'max'],
        },
      },
    },
  })
  getCustomAggregation(@Query() requestDto: SupplierAggregationRequestDto) {
    return this.supplierAggregationService.getCustomAggregation(requestDto);
  }
}
