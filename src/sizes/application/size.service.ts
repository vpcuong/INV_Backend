import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Size } from '../domain/size.entity';
import { ISizeRepository } from '../domain/size.repository.interface';
import { SIZE_REPOSITORY } from '../constant/size.token';
import { CreateSizeDto } from '../dto/create-size.dto';
import { UpdateSizeDto } from '../dto/update-size.dto';

@Injectable()
export class SizeService {
  constructor(
    @Inject(SIZE_REPOSITORY)
    private readonly sizeRepository: ISizeRepository
  ) {}

  async create(createSizeDto: CreateSizeDto): Promise<Size> {
    // Check if code already exists
    const existing = await this.sizeRepository.findByCode(createSizeDto.code);
    if (existing) {
      throw new ConflictException(
        `Size with code ${createSizeDto.code} already exists`
      );
    }

    const size = new Size({
      code: createSizeDto.code,
      desc: createSizeDto.desc,
      sortOrder: createSizeDto.sortOrder,
      createdBy: createSizeDto.createdBy,
    });

    return this.sizeRepository.create(size);
  }

  async findAll(): Promise<Size[]> {
    return this.sizeRepository.findAll();
  }

  async findOne(id: number): Promise<Size> {
    const size = await this.sizeRepository.findOne(id);
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    return size;
  }

  async update(id: number, updateSizeDto: UpdateSizeDto): Promise<Size> {
    const size = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateSizeDto.code && updateSizeDto.code !== size.getCode()) {
      const existing = await this.sizeRepository.findByCode(updateSizeDto.code);
      if (existing && existing.getId() !== id) {
        throw new ConflictException(
          `Size with code ${updateSizeDto.code} already exists`
        );
      }
    }

    // Update size entity
    size.updateDetails({
      code: updateSizeDto.code,
      desc: updateSizeDto.desc,
      sortOrder: updateSizeDto.sortOrder,
    });

    return this.sizeRepository.update(id, size);
  }

  async activate(id: number): Promise<Size> {
    await this.findOne(id); // Check if size exists
    return this.sizeRepository.activate(id);
  }

  async deactivate(id: number): Promise<Size> {
    await this.findOne(id); // Check if size exists
    return this.sizeRepository.deactivate(id);
  }

  async remove(id: number): Promise<Size> {
    await this.findOne(id); // Check if size exists
    return this.sizeRepository.remove(id);
  }
}
