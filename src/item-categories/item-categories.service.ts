import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ItemCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    return this.prisma.client.itemCategory.create({
      data: createProductCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.client.itemCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.client.itemCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Item category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    await this.findOne(id); // Check if category exists

    return this.prisma.client.itemCategory.update({
      where: { id },
      data: updateProductCategoryDto,
    });
  }

  async activate(id: number) {
    await this.findOne(id); // Check if category exists

    return this.prisma.client.itemCategory.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id); // Check if category exists

    return this.prisma.client.itemCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
