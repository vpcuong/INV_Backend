import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Injectable()
export class GendersService {
  constructor(private prisma: PrismaService) {}

  async create(createGenderDto: CreateGenderDto) {
    return this.prisma.client.gender.create({
      data: createGenderDto,
    });
  }

  async findAll() {
    return this.prisma.client.gender.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: number) {
    const gender = await this.prisma.client.gender.findUnique({
      where: { id },
    });

    if (!gender) {
      throw new NotFoundException(`Gender with ID ${id} not found`);
    }

    return gender;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto) {
    await this.findOne(id);

    return this.prisma.client.gender.update({
      where: { id },
      data: updateGenderDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.gender.delete({
      where: { id },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.client.gender.update({
      where: { id },
      data: { status: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.client.gender.update({
      where: { id },
      data: { status: false },
    });
  }
}
