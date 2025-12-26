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
import { PoService } from './po.service';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';

@ApiTags('Purchase Orders')
@Controller('po')
export class PoController {
  constructor(private readonly poService: PoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created successfully',
  })
  create(@Body() createDto: CreatePOHeaderDto) {
    return this.poService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns all purchase orders' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.poService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      supplierId: supplierId ? parseInt(supplierId) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the purchase order' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poService.findOne(id);
  }

  @Patch(':id/with-lines')
  @ApiOperation({
    summary: 'Update purchase order header and lines together',
    description: `
      Update PO header and lines in a single transaction. Supports:
      - Updating header fields (optional)
      - Adding new lines (omit id)
      - Updating existing lines (include id)
      - Deleting lines (provide linesToDelete array)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order and lines updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  updateWithLines(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePOWithLinesDto,
  ) {
    return this.poService.updateWithLines(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePOHeaderDto,
  ) {
    return this.poService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.poService.remove(id);
  }
}