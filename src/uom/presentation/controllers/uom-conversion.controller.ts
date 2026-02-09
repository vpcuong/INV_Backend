import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UomService } from '../../application/uom.service';
import { UomQueryService } from '../../application/uom-query.service';
import { UpdateUomConversionDto, ConvertUomDto } from '../dto/update-uom-conversion.dto';

@ApiTags('UOM Conversions')
@ApiBearerAuth()
@Controller('uom-conversions')
export class UomConversionListController {
  constructor(private readonly queryService: UomQueryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all UOM conversions' })
  findAll() {
    return this.queryService.findAllConversions();
  }
}

@ApiTags('UOM Conversions')
@ApiBearerAuth()
@Controller('uom-classes/:classCode/conversions')
export class UomConversionController {
  constructor(
    private readonly service: UomService,
    private readonly queryService: UomQueryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversions in a UOM class' })
  @ApiParam({ name: 'classCode', description: 'UOM Class code' })
  findAll(@Param('classCode') classCode: string) {
    return this.queryService.findConversionsByClassCode(classCode);
  }

  @Get(':uomCode')
  @ApiOperation({ summary: 'Get conversion for a specific UOM' })
  @ApiParam({ name: 'classCode', description: 'UOM Class code' })
  @ApiParam({ name: 'uomCode', description: 'UOM code' })
  async findOne(
    @Param('classCode') classCode: string,
    @Param('uomCode') uomCode: string,
  ) {
    const result = await this.queryService.findConversion(classCode, uomCode);
    if (!result) {
      throw new NotFoundException(
        `Conversion for UOM ${uomCode} not found in class ${classCode}`,
      );
    }
    return result;
  }

  @Patch(':uomCode')
  @ApiOperation({ summary: 'Update conversion factor for a UOM' })
  @ApiParam({ name: 'classCode', description: 'UOM Class code' })
  @ApiParam({ name: 'uomCode', description: 'UOM code' })
  updateFactor(
    @Param('classCode') classCode: string,
    @Param('uomCode') uomCode: string,
    @Body() dto: UpdateUomConversionDto,
  ) {
    return this.service.updateConversion(classCode, uomCode, dto.toBaseFactor);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert value between UOMs in the same class' })
  @ApiParam({ name: 'classCode', description: 'UOM Class code' })
  convert(
    @Param('classCode') classCode: string,
    @Body() dto: ConvertUomDto,
  ) {
    return this.queryService.convertValue(
      classCode,
      dto.fromUomCode,
      dto.toUomCode,
      dto.value,
    );
  }
}