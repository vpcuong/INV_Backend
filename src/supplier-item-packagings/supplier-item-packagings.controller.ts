import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierItemPackagingsService } from './supplier-item-packagings.service';
import { CreateSupplierItemPackagingDto } from './dto/create-supplier-item-packaging.dto';
import { UpdateSupplierItemPackagingDto } from './dto/update-supplier-item-packaging.dto';

@ApiTags('supplier-item-packagings')
@ApiBearerAuth()
@Controller('supplier-item-packagings')
export class SupplierItemPackagingsController {
  constructor(
    private readonly supplierItemPackagingsService: SupplierItemPackagingsService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new packaging level for a supplier item' })
  @ApiResponse({ status: 201, description: 'Packaging created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or missing previous level',
  })
  @ApiResponse({ status: 404, description: 'Supplier item or UOM not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - level already exists for this supplier item',
  })
  create(@Body() createDto: CreateSupplierItemPackagingDto) {
    return this.supplierItemPackagingsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supplier item packagings' })
  @ApiResponse({ status: 200, description: 'Return all packagings' })
  findAll() {
    return this.supplierItemPackagingsService.findAll();
  }

  @Get('supplier-item/:supplierItemId')
  @ApiOperation({
    summary: 'Get all packaging levels for a specific supplier item',
  })
  @ApiParam({ name: 'supplierItemId', description: 'Supplier item ID' })
  @ApiResponse({
    status: 200,
    description: 'Return packagings for the supplier item',
  })
  @ApiResponse({ status: 404, description: 'Supplier item not found' })
  findBySupplierItem(
    @Param('supplierItemId', ParseIntPipe) supplierItemId: number
  ) {
    return this.supplierItemPackagingsService.findBySupplierItem(
      supplierItemId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a packaging by ID' })
  @ApiResponse({ status: 200, description: 'Return the packaging' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierItemPackagingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a packaging' })
  @ApiResponse({ status: 200, description: 'Packaging updated successfully' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  @ApiResponse({ status: 409, description: 'Conflict - level already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSupplierItemPackagingDto
  ) {
    return this.supplierItemPackagingsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a packaging' })
  @ApiResponse({ status: 200, description: 'Packaging deleted successfully' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierItemPackagingsService.remove(id);
  }

  @Post('supplier-item/:supplierItemId/recalculate')
  @ApiOperation({
    summary:
      'Recalculate qtyToBase for all packaging levels of a supplier item',
    description:
      'Useful after updating lower level packagings to ensure all qtyToBase values are correct',
  })
  @ApiParam({ name: 'supplierItemId', description: 'Supplier item ID' })
  @ApiResponse({
    status: 200,
    description: 'Recalculated all packaging levels',
  })
  @ApiResponse({ status: 404, description: 'Supplier item not found' })
  recalculate(@Param('supplierItemId', ParseIntPipe) supplierItemId: number) {
    return this.supplierItemPackagingsService.recalculateQtyToBase(
      supplierItemId
    );
  }
}
