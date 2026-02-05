import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CustomerService } from './application/customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryService } from './application/customer-query.service';
import { CustomerFilterDto } from './dto/customer-filter.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomerService,
    private readonly customerQueryService: CustomerQueryService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Customer code already exists' })
  create(@Body() createDto: CreateCustomerDto) {
    return this.customersService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all customers with filtering, sorting, and pagination',
    description:
      'Supports search, filters, sorting, pagination, and field selection. Use query parameters for quick filters or advanced JSON-based filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated customers with metadata',
    schema: {
      example: {
        data: [
          {
            id: 1,
            customerCode: 'CUST001',
            customerName: 'ABC Company',
            email: 'contact@abc.com',
            status: 'ACTIVE',
            country: 'Vietnam',
            isActive: true,
          },
        ],
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findAll(@Query() filterDto: CustomerFilterDto) {
    return this.customerQueryService.findAllWithFilters(filterDto);
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
  @ApiResponse({
    status: 200,
    description: 'Customer deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.deactivate(id);
  }

  @Patch(':id/blacklist')
  @ApiOperation({ summary: 'Blacklist a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer blacklisted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  blacklist(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.blacklist(id);
  }
}
