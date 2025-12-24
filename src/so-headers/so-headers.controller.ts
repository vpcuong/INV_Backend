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
import { SoHeadersService } from './so-headers.service';
import { CreateSOHeaderDto } from './dto/create-so-header.dto';
import { UpdateSOHeaderDto } from './dto/update-so-header.dto';

@ApiTags('Sales Orders')
@Controller('so-headers')
export class SoHeadersController {
  constructor(private readonly soHeadersService: SoHeadersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({
    status: 201,
    description: 'Sales order created successfully',
  })
  create(@Body() createDto: CreateSOHeaderDto) {
    return this.soHeadersService.create(createDto);
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
    return this.soHeadersService.findAll({
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
    return this.soHeadersService.findByCustomer(customerId);
  }

  @Get('sonum/:soNum')
  @ApiOperation({ summary: 'Get sales order by SO number' })
  @ApiResponse({ status: 200, description: 'Returns the sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  findBySONum(@Param('soNum') soNum: string) {
    return this.soHeadersService.findBySONum(soNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the sales order' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soHeadersService.findOne(id);
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
    return this.soHeadersService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order cancelled successfully',
  })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.soHeadersService.cancel(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order closed successfully',
  })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.soHeadersService.close(id);
  }

  @Patch(':id/hold')
  @ApiOperation({ summary: 'Put sales order on hold' })
  @ApiResponse({
    status: 200,
    description: 'Sales order put on hold successfully',
  })
  hold(@Param('id', ParseIntPipe) id: number) {
    return this.soHeadersService.hold(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'Sales order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soHeadersService.remove(id);
  }
}
