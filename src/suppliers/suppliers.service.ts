import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.client.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.client.supplier.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      include: {
        items: true,
      },
    });
  }

  async findOne(id: number) {
    const supplier = await this.prisma.client.supplier.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true,
            fromUOM: true,
            toUOM: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.prisma.client.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.supplier.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.supplier.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
