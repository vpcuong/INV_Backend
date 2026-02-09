import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UomService } from '../../application/uom.service';
import { UomQueryService } from '../../application/uom-query.service';
import { CreateUomDto } from '../dto/create-uom.dto';

@ApiTags('UOMs')
@ApiBearerAuth()
@Controller('uoms')
export class UomController {
  constructor(
    private readonly service: UomService,
    private readonly queryService: UomQueryService,
  ) {}

  @Post('class/:classCode')
  @ApiOperation({ summary: 'Add UOM to Class' })
  @ApiParam({ name: 'classCode', description: 'UOM Class code' })
  create(@Param('classCode') classCode: string, @Body() dto: CreateUomDto) {
    return this.service.addUomToClass(classCode, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOMs' })
  findAll() {
    return this.queryService.findAllUoms();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active UOMs' })
  findAllActive() {
    return this.queryService.findActiveUoms();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get UOM by code' })
  @ApiParam({ name: 'code', description: 'UOM code' })
  async findByCode(@Param('code') code: string) {
    const result = await this.queryService.findUomByCode(code);
    if (!result) {
      throw new NotFoundException(`UOM ${code} not found`);
    }
    return result;
  }
}