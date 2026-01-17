import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerAddress } from '../domain/customer-address.entity';
import { ICustomerAddressRepository } from '../domain/customer-address.repository.interface';
import { AddressType } from '../enums/address-type.enum';

@Injectable()
export class CustomerAddressRepository implements ICustomerAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(address: CustomerAddress): Promise<CustomerAddress> {
    const data = address.toPersistence();
    delete data.id; // Remove id for creation

    const created = await this.prisma.client.customerAddress.create({
      data,
    });

    return CustomerAddress.fromPersistence(created);
  }

  async findAll(): Promise<CustomerAddress[]> {
    const addresses = await this.prisma.client.customerAddress.findMany({
      orderBy: [{ customerId: 'asc' }, { isDefault: 'desc' }],
    });

    return addresses.map((address) => CustomerAddress.fromPersistence(address));
  }

  async findByCustomer(customerId: number): Promise<CustomerAddress[]> {
    const addresses = await this.prisma.client.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { addressType: 'asc' }],
    });

    return addresses.map((address) => CustomerAddress.fromPersistence(address));
  }

  async findOne(id: number): Promise<CustomerAddress | null> {
    const address = await this.prisma.client.customerAddress.findUnique({
      where: { id },
    });

    return address ? CustomerAddress.fromPersistence(address) : null;
  }

  async findDefaultByCustomerAndType(
    customerId: number,
    addressType: AddressType
  ): Promise<CustomerAddress | null> {
    const address = await this.prisma.client.customerAddress.findFirst({
      where: {
        customerId,
        addressType,
        isDefault: true,
      },
    });

    return address ? CustomerAddress.fromPersistence(address) : null;
  }

  async update(id: number, address: CustomerAddress): Promise<CustomerAddress> {
    const data = address.toPersistence();

    const updated = await this.prisma.client.customerAddress.update({
      where: { id },
      data: {
        addressType: data.addressType,
        addressLine: data.addressLine,
        ward: data.ward,
        district: data.district,
        city: data.city,
        province: data.province,
        country: data.country,
        postalCode: data.postalCode,
        isDefault: data.isDefault,
        updatedAt: new Date(),
      },
    });

    return CustomerAddress.fromPersistence(updated);
  }

  async remove(id: number): Promise<CustomerAddress> {
    const deleted = await this.prisma.client.customerAddress.delete({
      where: { id },
    });

    return CustomerAddress.fromPersistence(deleted);
  }

  async unsetDefaultsByCustomerAndType(
    customerId: number,
    addressType: AddressType,
    exceptId?: number
  ): Promise<void> {
    await this.prisma.client.customerAddress.updateMany({
      where: {
        customerId,
        addressType,
        isDefault: true,
        ...(exceptId && { id: { not: exceptId } }),
      },
      data: {
        isDefault: false,
        updatedAt: new Date(),
      },
    });
  }
}
