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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SOService } from './application/so.service';
import { SOQueryService } from './application/so-query.service';
import { CreateSOHeaderDto } from './dto/create-so-header.dto';
import { UpdateSOHeaderDto } from './dto/update-so-header.dto';
import { UpdateSOWithLinesDto } from './dto/update-so-with-lines.dto';
import { SOFilterDto } from './dto/so-filter.dto';
import { ULIDValidationPipe } from '../common/pipes/ulid-validation.pipe';

@ApiTags('Sales Orders')
@Controller('so')
export class SalesOrdersController {
  constructor(
    private readonly soService: SOService,
    private readonly soQueryService: SOQueryService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({
    status: 201,
    description: 'Sales order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or business rule violation',
  })
  async create(@Body() createDto: CreateSOHeaderDto) {
    return this.soService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders with filters' })
  @ApiResponse({ status: 200, description: 'Returns all sales orders' })
  findAll(@Query() filterDto: SOFilterDto) {
    return this.soQueryService.findAllWithFilters(filterDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sales orders by text' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns matching sales orders' })
  search(
    @Query('q') query: string,
    @Query('customerId', ParseIntPipe) customerId?: number
  ) {
    return this.soQueryService.search(query, customerId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get sales orders by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all sales orders for the customer',
  })
  findByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() filterDto: SOFilterDto
  ) {
    return this.soQueryService.findByCustomer(customerId, filterDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get sales orders by status' })
  @ApiResponse({
    status: 200,
    description: 'Returns orders with specified status',
  })
  findByStatus(
    @Param('status') status: string,
    @Query() filterDto: SOFilterDto
  ) {
    return this.soQueryService.findByStatus(status, filterDto);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get open sales orders' })
  @ApiResponse({ status: 200, description: 'Returns all open sales orders' })
  findOpen(@Query() filterDto: SOFilterDto) {
    return this.soQueryService.findOpen(filterDto);
  }

  @Get('on-hold')
  @ApiOperation({ summary: 'Get sales orders on hold' })
  @ApiResponse({ status: 200, description: 'Returns all orders on hold' })
  findOnHold(@Query() filterDto: SOFilterDto) {
    return this.soQueryService.findOnHold(filterDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sales order summary statistics' })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns summary statistics' })
  getSummary(@Query('customerId', ParseIntPipe) customerId?: number) {
    return this.soQueryService.getSummary(customerId);
  }

  // ========================================
  // NEW SECURE API ENDPOINTS (using publicId)
  // ========================================

  @Get('public/:publicId')
  @ApiOperation({
    summary: 'Get sales order by public ID (RECOMMENDED)',
    description: 'Use public ID (ULID) instead of sequential ID for better security'
  })
  @ApiResponse({ status: 200, description: 'Returns sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format' })
  async findByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.findByPublicId(publicId);
  }

  @Patch('public/:publicId')
  @ApiOperation({
    summary: 'Update sales order by public ID (RECOMMENDED)',
    description: 'Use public ID (ULID) instead of sequential ID for better security'
  })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format or data' })
  async updateByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Body() updateDto: UpdateSOHeaderDto
  ) {
    return this.soService.updateByPublicId(publicId, updateDto);
  }

  @Delete('public/:publicId/lines/:linePublicId')
  @ApiOperation({
    summary: 'Delete sales order line by public IDs (RECOMMENDED)',
    description: 'Use public IDs (ULID) for both SO and line for better security'
  })
  @ApiResponse({ status: 200, description: 'Line deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sales order or line not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format' })
  async deleteLineByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Param('linePublicId', ULIDValidationPipe) linePublicId: string
  ) {
    return this.soService.deleteLineByPublicId(publicId, linePublicId);
  }

  // ========================================
  // OLD API ENDPOINTS (using sequential ID)
  // For backwards compatibility - consider deprecating
  // ========================================

  @Get('sonum/:soNum')
  @ApiOperation({ summary: 'Get sales order by SO number' })
  @ApiResponse({ status: 200, description: 'Returns sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findBySONum(@Param('soNum') soNum: string) {
    const result = await this.soService.findBySONum(soNum);
    if (result.isFailure()) {
      throw new NotFoundException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get sales order by ID',
    deprecated: true,
    description: 'DEPRECATED: Use GET /so/public/:publicId instead for better security'
  })
  @ApiResponse({ status: 200, description: 'Returns sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a sales order',
    deprecated: true,
    description: 'DEPRECATED: Use PATCH /so/public/:publicId instead for better security'
  })
  @ApiResponse({
    status: 200,
    description: 'Sales order updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or business rule violation',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSOHeaderDto
  ) {
    const result = await this.soService.update(id, updateDto);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Patch(':id/with-lines')
  @ApiOperation({
    summary: 'Update sales order header and lines together',
    description: `
      Update SO header and lines in a single transaction. Supports:
      - Updating header fields (optional)
      - Adding new lines (omit id)
      - Updating existing lines (include id)
      - Deleting lines (provide linesToDelete array)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sales order and lines updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or business rule violation',
  })
  async updateWithLines(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSOWithLinesDto
  ) {
    const result = await this.soService.updateWithLines(id, dto);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  // Status management endpoints
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel order in current status',
  })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const result = await this.soService.cancel(id);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order completed successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot complete order with open lines',
  })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.soService.complete(id);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Patch(':id/hold')
  @ApiOperation({ summary: 'Put sales order on hold' })
  @ApiResponse({
    status: 200,
    description: 'Sales order put on hold successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot hold order in current status',
  })
  async hold(@Param('id', ParseIntPipe) id: number) {
    const result = await this.soService.hold(id);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Patch(':id/release')
  @ApiOperation({ summary: 'Release sales order from hold' })
  @ApiResponse({
    status: 200,
    description: 'Sales order released successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({ status: 400, description: 'Order is not on hold' })
  async release(@Param('id', ParseIntPipe) id: number) {
    const result = await this.soService.release(id);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }

  @Delete(':id/lines/:lineNum')
  @ApiOperation({
    summary: 'Delete a sales order line',
    deprecated: true,
    description: 'DEPRECATED: Use DELETE /so/public/:publicId/lines/:linePublicId instead for better security'
  })
  @ApiResponse({
    status: 200,
    description: 'Sales order line deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order or line not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete line from order in current status',
  })
  async deleteLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineNum', ParseIntPipe) lineNum: number
  ) {
    return this.soService.deleteLine(id, lineNum);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a sales order',
    deprecated: true,
    description: 'DEPRECATED: Sequential ID endpoints expose business information'
  })
  @ApiResponse({
    status: 200,
    description: 'Sales order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete order in current status',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.soService.remove(id);
    if (result.isFailure()) {
      throw new BadRequestException(result.getError()?.message);
    }
    return result.getValue();
  }
}
