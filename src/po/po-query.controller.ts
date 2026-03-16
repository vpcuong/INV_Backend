import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { POQueryService } from './application/po-query.service';
import { FindPOsDto, POCursorFilterDto } from './dto/find-pos.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('po')
export class PoQueryController {
  constructor(private readonly poQueryService: POQueryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Returns all purchase orders' })
  findAll(@Query() query: FindPOsDto) {
    return this.poQueryService.findAll(query);
  }

  @Get('cursor')
  @ApiOperation({
    summary: 'Get purchase orders with cursor-based pagination',
    description: 'Use nextCursor from response as cursor param for next page. Suitable for infinite scroll.',
  })
  @ApiResponse({ status: 200, description: 'Returns purchase orders with cursor info' })
  findAllWithCursor(@Query() filterDto: POCursorFilterDto) {
    return this.poQueryService.findAllWithCursor(filterDto);
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
}
