import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Customer } from '../domain/customer.entity';
import { ICustomerRepository } from '../domain/customer.repository.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const data = customer.toPersistence();
    delete data.id; // Remove id for creation

    const created = await this.prisma.client.customer.create({
      data,
    });

    return Customer.fromPersistence(created);
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.client.customer.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { customerCode: 'asc' },
      ],
    });

    return customers.map((customer) => Customer.fromPersistence(customer));
  }

  async findOne(id: number): Promise<Customer | null> {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id },
    });

    return customer ? Customer.fromPersistence(customer) : null;
  }

  async findByCode(customerCode: string): Promise<Customer | null> {
    const customer = await this.prisma.client.customer.findUnique({
      where: { customerCode },
    });

    return customer ? Customer.fromPersistence(customer) : null;
  }

  async update(id: number, customer: Customer): Promise<Customer> {
    const data = customer.toPersistence();

    const updated = await this.prisma.client.customer.update({
      where: { id },
      data: {
        customerName: data.customerName,
        taxCode: data.taxCode,
        country: data.country,
        status: data.status,
        note: data.note,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      },
    });

    return Customer.fromPersistence(updated);
  }

  async remove(id: number): Promise<Customer> {
    const deleted = await this.prisma.client.customer.delete({
      where: { id },
    });

    return Customer.fromPersistence(deleted);
  }

  async activate(id: number): Promise<Customer> {
    const updated = await this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: true,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    return Customer.fromPersistence(updated);
  }

  async deactivate(id: number): Promise<Customer> {
    const updated = await this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
    });

    return Customer.fromPersistence(updated);
  }

  async blacklist(id: number): Promise<Customer> {
    const updated = await this.prisma.client.customer.update({
      where: { id },
      data: {
        isActive: false,
        status: 'BLACKLIST',
        updatedAt: new Date(),
      },
    });

    return Customer.fromPersistence(updated);
  }
}