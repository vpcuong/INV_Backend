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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CustomerAddressService } from './application/customer-address.service';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';

@ApiTags('customer-addresses')
@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(private readonly service: CustomerAddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer address' })
  create(@Body() createDto: CreateCustomerAddressDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer addresses' })
  findAll() {
    return this.service.findAll();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all addresses for a customer' })
  @ApiParam({ name: 'customerId' })
  findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.service.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an address by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCustomerAddressDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
