import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCustomerDto) {
    return this.prisma.client.customer.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.client.customer.findMany({
      orderBy: [{ sortOrder: 'asc' }, { customerCode: 'asc' }],
      include: {
        addresses: true,
        contacts: true,
        paymentTerms: true,
      },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { addressType: 'asc' }],
        },
        contacts: {
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { fullName: 'asc' }],
        },
        paymentTerms: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByCode(customerCode: string) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { customerCode },
      include: {
        addresses: true,
        contacts: { where: { isActive: true } },
        paymentTerms: { where: { isActive: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with code ${customerCode} not found`
      );
    }

    return customer;
  }

  async update(id: number, updateDto: UpdateCustomerDto) {
    await this.findOne(id);

    return this.prisma.client.customer.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.customer.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: true,
        status: 'ACTIVE',
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: false,
        status: 'INACTIVE',
      },
    });
  }

  async blacklist(id: number) {
    await this.findOne(id);

    return this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: false,
        status: 'BLACKLIST',
      },
    });
  }
}
