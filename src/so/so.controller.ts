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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SOService } from './application/so.service';
import { SOQueryService } from './application/so-query.service';
import { CreateSOHeaderDto } from './dto/create-so-header.dto';
import { UpdateSOHeaderDto } from './dto/update-so-header.dto';
import { UpdateSOWithLinesDto } from './dto/update-so-with-lines.dto';
import { SOCursorFilterDto, SOFilterDto } from './dto/so-filter.dto';
import { CreateSOLineDto } from './dto/composed/create-so-line.dto';
import { UpdateSOLineDto } from './dto/update-so-line.dto';
import { ULIDValidationPipe } from '../common/pipes/ulid-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Sales Orders')
@ApiBearerAuth()
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
  async create(
    @Body() createDto: CreateSOHeaderDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.soService.create(createDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders with filters' })
  @ApiResponse({ status: 200, description: 'Returns all sales orders' })
  findAll(@Query() filterDto: SOFilterDto) {
    return this.soQueryService.findAllWithFilters(filterDto);
  }

  @Get('cursor')
  @ApiOperation({
    summary: 'Get sales orders with cursor-based pagination',
    description: 'Use nextCursor from response as cursor param for next page. Suitable for infinite scroll.',
  })
  @ApiResponse({ status: 200, description: 'Returns sales orders with cursor info' })
  findAllWithCursor(@Query() filterDto: SOCursorFilterDto) {
    return this.soQueryService.findAllWithCursor(filterDto);
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

  @Get(':publicId')
  @ApiOperation({ summary: 'Get sales order by public ID' })
  @ApiResponse({ status: 200, description: 'Returns sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format' })
  async findByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.findByPublicId(publicId);
  }

  @Patch(':publicId')
  @ApiOperation({ summary: 'Update sales order by public ID' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format or data' })
  async updateByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Body() updateDto: UpdateSOHeaderDto
  ) {
    return this.soService.updateByPublicId(publicId, updateDto);
  }

  @Patch(':publicId/with-lines')
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
  async updateWithLinesByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Body() dto: UpdateSOWithLinesDto
  ) {
    return this.soService.updateWithLinesByPublicId(publicId, dto);
  }

  @Post(':publicId/lines')
  @ApiOperation({
    summary: 'Add a new line to existing sales order',
    description: 'Add a single line to an existing SO. Line number will be auto-generated if not provided.'
  })
  @ApiResponse({
    status: 201,
    description: 'Line added successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or business rule violation',
  })
  async addLineByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Body() lineDto: CreateSOLineDto
  ) {
    return this.soService.addLineByPublicId(publicId, lineDto);
  }

  @Patch(':publicId/lines/:linePublicId')
  @ApiOperation({
    summary: 'Update a single sales order line',
    description: 'Update a specific line in an existing SO by public IDs. Pricing is auto-recalculated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Line updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order or line not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ULID format or data',
  })
  async updateLineByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Param('linePublicId', ULIDValidationPipe) linePublicId: string,
    @Body() updateDto: UpdateSOLineDto
  ) {
    return this.soService.updateLineByPublicId(publicId, linePublicId, updateDto);
  }

  @Patch(':publicId/cancel')
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
  async cancelByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.cancelByPublicId(publicId);
  }

  @Patch(':publicId/complete')
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
  async completeByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.completeByPublicId(publicId);
  }

  @Patch(':publicId/hold')
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
  async holdByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.holdByPublicId(publicId);
  }

  @Patch(':publicId/release')
  @ApiOperation({ summary: 'Release sales order from hold' })
  @ApiResponse({
    status: 200,
    description: 'Sales order released successfully',
  })
  @ApiResponse({ status: 404, description: 'Order is not on hold' })
  async releaseByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.releaseByPublicId(publicId);
  }

  @Delete(':publicId/lines/:linePublicId')
  @ApiOperation({ summary: 'Delete sales order line by public IDs' })
  @ApiResponse({ status: 200, description: 'Line deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sales order or line not found' })
  @ApiResponse({ status: 400, description: 'Invalid ULID format' })
  async deleteLineByPublicId(
    @Param('publicId', ULIDValidationPipe) publicId: string,
    @Param('linePublicId', ULIDValidationPipe) linePublicId: string
  ) {
    return this.soService.deleteLineByPublicId(publicId, linePublicId);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete order in current status',
  })
  async removeByPublicId(@Param('publicId', ULIDValidationPipe) publicId: string) {
    return this.soService.removeByPublicId(publicId);
  }

  @Get('sonum/:soNum')
  @ApiOperation({ summary: 'Get sales order by SO number' })
  @ApiResponse({ status: 200, description: 'Returns sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findBySONum(@Param('soNum') soNum: string) {
    return this.soService.findBySONum(soNum);
  }
}
