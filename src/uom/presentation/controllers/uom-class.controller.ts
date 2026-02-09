import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UomService } from '../../application/uom.service';
import { UomQueryService } from '../../application/uom-query.service';
import { CreateUomClassDto } from '../dto/create-uom-class.dto';

@ApiTags('UOMs')
@ApiBearerAuth()
@Controller('uom-classes')
export class UomClassController {
  constructor(
    private readonly service: UomService,
    private readonly queryService: UomQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create UOM Class' })
  create(@Body() dto: CreateUomClassDto) {
    return this.service.createClass(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOM Classes' })
  findAll() {
    return this.queryService.findAllClasses();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active UOM Classes with active UOMs' })
  findAllActive() {
    return this.queryService.findActiveClasses();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get UOM Class by code' })
  @ApiParam({ name: 'code', description: 'UOM Class code' })
  async findByCode(@Param('code') code: string) {
    const result = await this.queryService.findClassByCode(code);
    if (!result) {
      throw new NotFoundException(`UOM Class ${code} not found`);
    }
    return result;
  }

  @Get(':code/uoms')
  @ApiOperation({ summary: 'Get all UOMs in a class' })
  @ApiParam({ name: 'code', description: 'UOM Class code' })
  findUomsByClass(@Param('code') code: string) {
    return this.queryService.findUomsByClassCode(code);
  }

  @Get(':code/conversions')
  @ApiOperation({ summary: 'Get all conversions in a class' })
  @ApiParam({ name: 'code', description: 'UOM Class code' })
  findConversionsByClass(@Param('code') code: string) {
    return this.queryService.findConversionsByClassCode(code);
  }
}