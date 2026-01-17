import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Gender } from '../domain/gender.entity';
import { IGenderRepository } from '../domain/gender.repository.interface';
import { GENDER_REPOSITORY } from '../constant/gender.token';
import { CreateGenderDto } from '../dto/create-gender.dto';
import { UpdateGenderDto } from '../dto/update-gender.dto';

@Injectable()
export class GenderService {
  constructor(
    @Inject(GENDER_REPOSITORY)
    private readonly genderRepository: IGenderRepository
  ) {}

  async create(createGenderDto: CreateGenderDto): Promise<Gender> {
    // Check if code already exists
    const existing = await this.genderRepository.findByCode(
      createGenderDto.code
    );
    if (existing) {
      throw new ConflictException(
        `Gender with code ${createGenderDto.code} already exists`
      );
    }

    const gender = new Gender({
      code: createGenderDto.code,
      desc: createGenderDto.desc,
      sortOrder: createGenderDto.sortOrder,
      createdBy: createGenderDto.createdBy,
    });

    return this.genderRepository.create(gender);
  }

  async findAll(): Promise<Gender[]> {
    return this.genderRepository.findAll();
  }

  async findOne(id: number): Promise<Gender> {
    const gender = await this.genderRepository.findOne(id);
    if (!gender) {
      throw new NotFoundException(`Gender with ID ${id} not found`);
    }
    return gender;
  }

  async update(id: number, updateGenderDto: UpdateGenderDto): Promise<Gender> {
    const gender = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateGenderDto.code && updateGenderDto.code !== gender.getCode()) {
      const existing = await this.genderRepository.findByCode(
        updateGenderDto.code
      );
      if (existing && existing.getId() !== id) {
        throw new ConflictException(
          `Gender with code ${updateGenderDto.code} already exists`
        );
      }
    }

    // Update gender entity
    gender.updateDetails({
      code: updateGenderDto.code,
      desc: updateGenderDto.desc,
      sortOrder: updateGenderDto.sortOrder,
    });

    return this.genderRepository.update(id, gender);
  }

  async activate(id: number): Promise<Gender> {
    await this.findOne(id); // Check if gender exists
    return this.genderRepository.activate(id);
  }

  async deactivate(id: number): Promise<Gender> {
    await this.findOne(id); // Check if gender exists
    return this.genderRepository.deactivate(id);
  }

  async remove(id: number): Promise<Gender> {
    await this.findOne(id); // Check if gender exists
    return this.genderRepository.remove(id);
  }
}
