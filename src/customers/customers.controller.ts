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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Customer code already exists' })
  create(@Body() createDto: CreateCustomerDto) {
    return this.customersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Return all customers with addresses, contacts, and payment terms' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Return the customer' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Get('code/:customerCode')
  @ApiOperation({ summary: 'Get a customer by customer code' })
  @ApiParam({ name: 'customerCode', description: 'Customer code' })
  @ApiResponse({ status: 200, description: 'Return the customer' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findByCode(@Param('customerCode') customerCode: string) {
    return this.customersService.findByCode(customerCode);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCustomerDto
  ) {
    return this.customersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a customer' })
  @ApiResponse({ status: 200, description: 'Customer activated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a customer' })
  @ApiResponse({ status: 200, description: 'Customer deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.deactivate(id);
  }

  @Patch(':id/blacklist')
  @ApiOperation({ summary: 'Blacklist a customer' })
  @ApiResponse({ status: 200, description: 'Customer blacklisted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  blacklist(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.blacklist(id);
  }
}
