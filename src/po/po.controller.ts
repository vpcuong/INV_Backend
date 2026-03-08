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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PoService } from './po.service';
import { POQueryService } from './application/po-query.service';
import { CreatePOHeaderDto } from './dto/create-po-header.dto';
import { UpdatePOHeaderDto } from './dto/update-po-header.dto';
import { UpdatePOWithLinesDto } from './dto/update-po-with-lines.dto';
import { FindPOsDto } from './dto/find-pos.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('po')
export class PoController {
  constructor(
    private readonly poService: PoService,
    private readonly poQueryService: POQueryService,
  ) {}

  // ── Query ─────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Returns all purchase orders' })
  findAll(@Query() query: FindPOsDto) {
    return this.poQueryService.findAll(query);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get purchase orders by supplier ID' })
  @ApiResponse({ status: 200, description: 'Returns purchase orders for the supplier' })
  findBySupplierId(@Param('supplierId', ParseIntPipe) supplierId: number) {
    return this.poQueryService.findBySupplierId(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the purchase order' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poQueryService.findById(id);
  }

  // ── Command ───────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  create(
    @Body() createDto: CreatePOHeaderDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.poService.create(createDto, user.userId);
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
  @ApiResponse({ status: 200, description: 'Purchase order and lines updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  updateWithLines(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePOWithLinesDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.poService.updateWithLines(id, dto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order header' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePOHeaderDto
  ) {
    return this.poService.update(id, updateDto);
  }

  @Patch(':publicId/approve')
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order approved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  approve(@Param('publicId') publicId: string) {
    return this.poService.approve(publicId);
  }

  @Patch(':publicId/cancel')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  cancel(@Param('publicId') publicId: string) {
    return this.poService.cancel(publicId);
  }

  @Patch(':publicId/close')
  @ApiOperation({ summary: 'Close a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order closed successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  close(@Param('publicId') publicId: string) {
    return this.poService.close(publicId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.poService.remove(id);
  }
}
