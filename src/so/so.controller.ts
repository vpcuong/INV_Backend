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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SoService } from './so.service';
import { CreateSOHeaderDto } from './dto/create-so-header.dto';
import { UpdateSOHeaderDto } from './dto/update-so-header.dto';
import { UpdateSOWithLinesDto } from './dto/update-so-with-lines.dto';

@ApiTags('Sales Orders')
@Controller('so')
export class SoController {
  constructor(private readonly soService: SoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({
    status: 201,
    description: 'Sales order created successfully',
  })
  create(@Body() createDto: CreateSOHeaderDto) {
    return this.soService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'orderStatus', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns all sales orders' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('customerId') customerId?: string,
    @Query('orderStatus') orderStatus?: string,
  ) {
    return this.soService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      orderStatus,
    });
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get sales orders by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all sales orders for the customer',
  })
  findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.soService.findByCustomer(customerId);
  }

  @Get('sonum/:soNum')
  @ApiOperation({ summary: 'Get sales order by SO number' })
  @ApiResponse({ status: 200, description: 'Returns the sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  findBySONum(@Param('soNum') soNum: string) {
    return this.soService.findBySONum(soNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soService.findOne(id);
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
  updateWithLines(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSOWithLinesDto,
  ) {
    return this.soService.updateWithLines(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSOHeaderDto,
  ) {
    return this.soService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order cancelled successfully',
  })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.soService.cancel(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order closed successfully',
  })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.soService.close(id);
  }

  @Patch(':id/hold')
  @ApiOperation({ summary: 'Put sales order on hold' })
  @ApiResponse({
    status: 200,
    description: 'Sales order put on hold successfully',
  })
  hold(@Param('id', ParseIntPipe) id: number) {
    return this.soService.hold(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soService.remove(id);
  }
}
