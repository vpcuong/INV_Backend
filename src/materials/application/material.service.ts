import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Material } from '../domain/material.entity';
import { IMaterialRepository } from '../domain/material.repository.interface';
import { MATERIAL_REPOSITORY } from '../constant/material.token';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import {
  MaterialNotFoundException,
  MaterialCodeAlreadyExistsException,
  MaterialInUseException,
} from '../domain/exceptions/material-domain.exception';

@Injectable()
export class MaterialService {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: IMaterialRepository
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    // Check if code already exists
    const existing = await this.materialRepository.findByCode(
      createMaterialDto.code
    );
    if (existing) {
      throw new ConflictException(
        `Material with code ${createMaterialDto.code} already exists`
      );
    }

    const material = new Material({
      code: createMaterialDto.code,
      desc: createMaterialDto.desc,
      status: createMaterialDto.status,
      sortOrder: createMaterialDto.sortOrder,
      createdBy: createMaterialDto.createdBy,
    });

    return this.materialRepository.create(material);
  }

  async findAll(): Promise<Material[]> {
    return this.materialRepository.findAll();
  }

  async findOne(id: number): Promise<Material> {
    const material = await this.materialRepository.findOne(id);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return material;
  }

  async update(
    id: number,
    updateMaterialDto: UpdateMaterialDto
  ): Promise<Material> {
    const material = await this.findOne(id);

    // If updating code, check for conflicts
    if (
      updateMaterialDto.code &&
      updateMaterialDto.code !== material.getCode()
    ) {
      const existing = await this.materialRepository.findByCode(
        updateMaterialDto.code
      );
      if (existing && existing.getId() !== id) {
        throw new ConflictException(
          `Material with code ${updateMaterialDto.code} already exists`
        );
      }
    }

    // Update material entity
    material.updateDetails({
      code: updateMaterialDto.code,
      desc: updateMaterialDto.desc,
      sortOrder: updateMaterialDto.sortOrder,
    });

    return this.materialRepository.update(id, material);
  }

  async activate(id: number): Promise<Material> {
    await this.findOne(id); // Check if material exists
    return this.materialRepository.activate(id);
  }

  async deactivate(id: number): Promise<Material> {
    await this.findOne(id); // Check if material exists
    return this.materialRepository.deactivate(id);
  }

  async remove(id: number): Promise<Material> {
    await this.findOne(id); // Check if material exists

    // Check if material is being used by any item
    const isUsed = await this.materialRepository.isUsedByItems(id);
    if (isUsed) {
      throw new ConflictException(
        `Cannot delete material. It is being used by one or more items`
      );
    }

    return this.materialRepository.remove(id);
  }
}
