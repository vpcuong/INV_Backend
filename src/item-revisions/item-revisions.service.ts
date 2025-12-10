import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemRevisionDto } from './dto/create-item-revision.dto';
import { UpdateItemRevisionDto } from './dto/update-item-revision.dto';

@Injectable()
export class ItemRevisionsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemRevisionDto: CreateItemRevisionDto) {
    return this.prisma.client.itemRevision.create({
      data: {
        itemId: createItemRevisionDto.itemId,
        revision: createItemRevisionDto.revision,
        name: createItemRevisionDto.name,
        notes: createItemRevisionDto.notes,
        status: createItemRevisionDto.status || 'Draft',
        effectiveAt: createItemRevisionDto.effectiveAt,
      },
      include: {
        item: true,
        skus: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.itemRevision.findMany({
      include: {
        item: true,
        skus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const revision = await this.prisma.client.itemRevision.findUnique({
      where: { id },
      include: {
        item: true,
        skus: true,
      },
    });

    if (!revision) {
      throw new NotFoundException(`Item revision with ID ${id} not found`);
    }

    return revision;
  }

  async findByItemId(itemId: number) {
    return this.prisma.client.itemRevision.findMany({
      where: { itemId },
      include: {
        item: true,
        skus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updateItemRevisionDto: UpdateItemRevisionDto) {
    await this.findOne(id);

    return this.prisma.client.itemRevision.update({
      where: { id },
      data: {
        ...updateItemRevisionDto,
      },
      include: {
        item: true,
        skus: true,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemRevision.update({
      where: { id },
      data: { status: 'Approved' },
      include: {
        item: true,
        skus: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemRevision.update({
      where: { id },
      data: { status: 'Draft' },
      include: {
        item: true,
        skus: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.itemRevision.delete({
      where: { id },
    });
  }
}
