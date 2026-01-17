import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UomConversionsService } from './uom-conversions.service';
import { CreateUomConversionDto } from './dto/create-uom-conversion.dto';
import { UpdateUomConversionDto } from './dto/update-uom-conversion.dto';

@ApiTags('uom-conversions')
@Controller('uom-conversions')
export class UomConversionsController {
  constructor(private readonly uomConversionsService: UomConversionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new UOM conversion' })
  @ApiResponse({
    status: 201,
    description: 'UOM conversion created successfully',
  })
  @ApiResponse({ status: 404, description: 'From or To UOM not found' })
  @ApiResponse({ status: 409, description: 'Conversion already exists' })
  create(@Body() createUomConversionDto: CreateUomConversionDto) {
    return this.uomConversionsService.create(createUomConversionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOM conversions' })
  @ApiResponse({ status: 200, description: 'Returns all UOM conversions' })
  findAll() {
    return this.uomConversionsService.findAll();
  }

  @Get(':uomClassCode/:uomCode')
  @ApiOperation({
    summary: 'Get UOM conversion by UOM Class Code and UOM Code',
  })
  @ApiResponse({ status: 200, description: 'Returns the UOM conversion' })
  @ApiResponse({ status: 404, description: 'UOM conversion not found' })
  findOne(
    @Param('uomClassCode') uomClassCode: string,
    @Param('uomCode') uomCode: string
  ) {
    return this.uomConversionsService.findOne(uomClassCode, uomCode);
  }

  @Patch(':uomClassCode/:uomCode')
  @ApiOperation({ summary: 'Update UOM conversion' })
  @ApiResponse({
    status: 200,
    description: 'UOM conversion updated successfully',
  })
  @ApiResponse({ status: 404, description: 'UOM conversion or UOM not found' })
  update(
    @Param('uomClassCode') uomClassCode: string,
    @Param('uomCode') uomCode: string,
    @Body() updateUomConversionDto: UpdateUomConversionDto
  ) {
    return this.uomConversionsService.update(
      uomClassCode,
      uomCode,
      updateUomConversionDto
    );
  }

  @Delete(':uomClassCode/:uomCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete UOM conversion' })
  @ApiResponse({ status: 204, description: 'UOM conversion deleted' })
  @ApiResponse({ status: 404, description: 'UOM conversion not found' })
  remove(
    @Param('uomClassCode') uomClassCode: string,
    @Param('uomCode') uomCode: string
  ) {
    return this.uomConversionsService.remove(uomClassCode, uomCode);
  }

  @Patch(':uomClassCode/:uomCode/activate')
  @ApiOperation({ summary: 'Activate UOM conversion' })
  @ApiResponse({ status: 200, description: 'UOM conversion activated' })
  @ApiResponse({ status: 404, description: 'UOM conversion not found' })
  activate(
    @Param('uomClassCode') uomClassCode: string,
    @Param('uomCode') uomCode: string
  ) {
    return this.uomConversionsService.activate(uomClassCode, uomCode);
  }

  @Patch(':uomClassCode/:uomCode/deactivate')
  @ApiOperation({ summary: 'Deactivate UOM conversion' })
  @ApiResponse({ status: 200, description: 'UOM conversion deactivated' })
  @ApiResponse({ status: 404, description: 'UOM conversion not found' })
  deactivate(
    @Param('uomClassCode') uomClassCode: string,
    @Param('uomCode') uomCode: string
  ) {
    return this.uomConversionsService.deactivate(uomClassCode, uomCode);
  }
}
