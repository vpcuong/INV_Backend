import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';

@Injectable()
export class CustomerAddressesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCustomerAddressDto) {
    // If setting as default, unset other defaults for same customer + addressType
    if (createDto.isDefault) {
      await this.prisma.client.customerAddress.updateMany({
        where: {
          customerId: createDto.customerId,
          addressType: createDto.addressType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.client.customerAddress.create({
      data: createDto,
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            customerName: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.client.customerAddress.findMany({
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            customerName: true,
          },
        },
      },
      orderBy: [
        { customerId: 'asc' },
        { isDefault: 'desc' },
      ],
    });
  }

  async findByCustomer(customerId: number) {
    return this.prisma.client.customerAddress.findMany({
      where: { customerId },
      orderBy: [
        { isDefault: 'desc' },
        { addressType: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const address = await this.prisma.client.customerAddress.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(id: number, updateDto: UpdateCustomerAddressDto) {
    const address = await this.findOne(id);

    // If setting as default, unset other defaults
    if (updateDto.isDefault) {
      await this.prisma.client.customerAddress.updateMany({
        where: {
          customerId: address.customerId,
          addressType: updateDto.addressType ?? address.addressType,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.client.customerAddress.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.customerAddress.delete({
      where: { id },
    });
  }
}
