import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SkuUomService } from './sku-uom.service';
import { CreateSkuUomDto } from './dto/create-sku-uom.dto';
import { UpdateSkuUomDto } from './dto/update-sku-uom.dto';

@ApiTags('SKU UOM')
@Controller('sku-uom')
export class SkuUomController {
  constructor(private readonly skuUomService: SkuUomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SKUUOM' })
  @ApiResponse({ status: 201, description: 'SKUUOM created successfully' })
  @ApiResponse({ status: 404, description: 'SKU or UOM not found' })
  @ApiResponse({ status: 409, description: 'SKUUOM already exists' })
  create(@Body() createSkuUomDto: CreateSkuUomDto) {
    return this.skuUomService.create(createSkuUomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all SKUUOMs with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'skuId', required: false, type: Number })
  @ApiQuery({ name: 'uomCode', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPurchasingUom', required: false, type: Boolean })
  @ApiQuery({ name: 'isSalesUom', required: false, type: Boolean })
  @ApiQuery({ name: 'isManufacturingUom', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all SKUUOMs' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('skuId') skuId?: string,
    @Query('uomCode') uomCode?: string,
    @Query('isActive') isActive?: string,
    @Query('isPurchasingUom') isPurchasingUom?: string,
    @Query('isSalesUom') isSalesUom?: string,
    @Query('isManufacturingUom') isManufacturingUom?: string
  ) {
    return this.skuUomService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      skuId: skuId ? parseInt(skuId) : undefined,
      uomCode: uomCode,
      isActive: isActive ? isActive === 'true' : undefined,
      isPurchasingUom: isPurchasingUom ? isPurchasingUom === 'true' : undefined,
      isSalesUom: isSalesUom ? isSalesUom === 'true' : undefined,
      isManufacturingUom: isManufacturingUom
        ? isManufacturingUom === 'true'
        : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SKUUOM by ID' })
  @ApiResponse({ status: 200, description: 'Return the SKUUOM' })
  @ApiResponse({ status: 404, description: 'SKUUOM not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skuUomService.findOne(id);
  }

  @Get('sku/:skuId')
  @ApiOperation({ summary: 'Get all UOMs for a SKU' })
  @ApiResponse({ status: 200, description: 'Return all UOMs for the SKU' })
  @ApiResponse({ status: 404, description: 'SKU not found' })
  findBySkuId(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuUomService.findBySkuId(skuId);
  }

  @Get('sku/:skuId/available-uoms')
  @ApiOperation({
    summary:
      'Get all available UOMs for a SKU (with Item UOMs inheritance logic)',
    description: `
      Returns available UOMs based on business rules:
      - If Item.uomCode === SKU.uomCode: Return ItemUOMs (not overridden) + SKUUOMs
      - If Item.uomCode ≠ SKU.uomCode: Return only SKUUOMs
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all available UOMs with source information',
    schema: {
      example: {
        skuId: 1,
        skuCode: 'SKU-001',
        itemId: 10,
        itemName: 'T-Shirt',
        itemUomCode: 'PCS',
        skuUomCode: 'PCS',
        sameBaseUom: true,
        availableUoms: [
          {
            uomCode: 'PCS',
            uomName: 'Pieces',
            source: 'BASE',
            toBaseFactor: 1,
            roundingPrecision: 2,
          },
          {
            uomCode: 'DOZ',
            uomName: 'Dozen',
            source: 'ITEM',
            toBaseFactor: 12,
            roundingPrecision: 2,
          },
          {
            uomCode: 'CTN',
            uomName: 'Carton',
            source: 'SKU_OVERRIDE',
            toBaseFactor: 144,
            roundingPrecision: 0,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'SKU not found' })
  getAvailableUomsForSku(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuUomService.getAvailableUomsForSku(skuId);
  }

  @Get('sku/:skuId/uom/:uomCode')
  @ApiOperation({ summary: 'Get SKUUOM by SKU ID and UOM code' })
  @ApiResponse({ status: 200, description: 'Return the SKUUOM' })
  @ApiResponse({ status: 404, description: 'SKUUOM not found' })
  findBySkuAndUom(
    @Param('skuId', ParseIntPipe) skuId: number,
    @Param('uomCode') uomCode: string
  ) {
    return this.skuUomService.findBySkuAndUom(skuId, uomCode);
  }

  @Get('convert/:skuId/:fromUomCode/:toUomCode/:quantity')
  @ApiOperation({ summary: 'Convert quantity between UOMs' })
  @ApiResponse({ status: 200, description: 'Return converted quantity' })
  @ApiResponse({ status: 404, description: 'SKUUOM not found' })
  async convertQuantity(
    @Param('skuId', ParseIntPipe) skuId: number,
    @Param('fromUomCode') fromUomCode: string,
    @Param('toUomCode') toUomCode: string,
    @Param('quantity') quantity: string
  ) {
    const result = await this.skuUomService.convertQuantity(
      skuId,
      fromUomCode,
      toUomCode,
      parseFloat(quantity)
    );

    return {
      skuId,
      fromUomCode,
      toUomCode,
      originalQuantity: parseFloat(quantity),
      convertedQuantity: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SKUUOM' })
  @ApiResponse({ status: 200, description: 'SKUUOM updated successfully' })
  @ApiResponse({ status: 404, description: 'SKUUOM not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkuUomDto: UpdateSkuUomDto
  ) {
    return this.skuUomService.update(id, updateSkuUomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SKUUOM' })
  @ApiResponse({ status: 200, description: 'SKUUOM deleted successfully' })
  @ApiResponse({ status: 404, description: 'SKUUOM not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skuUomService.remove(id);
  }
}
