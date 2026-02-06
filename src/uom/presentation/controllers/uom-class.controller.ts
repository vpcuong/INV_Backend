import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UomService } from '../../application/uom.service';
import { CreateUomClassDto } from '../dto/create-uom-class.dto';

@ApiTags('uom-classes')
@Controller('uom-classes')
export class UomClassController {
    constructor(private readonly service: UomService) {}

    @Post()
    @ApiOperation({ summary: 'Create UOM Class' })
    create(@Body() dto: CreateUomClassDto) {
        return this.service.createClass(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get All UOM Classes' })
    findAll() {
        return this.service.findAllClasses();
    }

    @Get(':code')
    @ApiOperation({ summary: 'Get UOM Class details' })
    find(@Param('code') code: string) {
        return this.service.findClassByCode(code);
    }
}
