import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UomService } from '../../application/uom.service';
import { CreateUomDto } from '../dto/create-uom.dto';

@ApiTags('uoms')
@Controller('uoms')
export class UomController {
    constructor(private readonly service: UomService) {}

    @Post('class/:classCode')
    @ApiOperation({ summary: 'Add UOM to Class' })
    create(@Param('classCode') classCode: string, @Body() dto: CreateUomDto) {
        return this.service.addUomToClass(classCode, dto);
    }
    
    // Note: The legacy CreateUomDto has 'classCode' inside body. 
    // If we want to support legacy POST /uoms with body containing classCode, we might need a wrapper.
    // For now, I'm separating it to be clearer: /uoms/class/:classCode
    
    // Additional read methods can be added here
}
