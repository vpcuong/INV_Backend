import { Injectable, Inject } from '@nestjs/common';
import { IUomRepository } from '../domain/uom.repository.interface';
import { UomClass } from '../domain/uom-class.entity';
import { Uom } from '../domain/uom.entity';
import { CreateUomClassDto } from '../presentation/dto/create-uom-class.dto';
import { CreateUomDto } from '../presentation/dto/create-uom.dto';
import {
  DuplicateUomClassCodeException,
  UomClassNotFoundException,
  UomNotFoundException,
} from '../domain/exceptions/uom-domain.exception';

@Injectable()
export class UomService {
  constructor(
      @Inject('IUomRepository') private readonly repository: IUomRepository
  ) {}

  async createClass(dto: CreateUomClassDto): Promise<UomClass> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new DuplicateUomClassCodeException(dto.code);
    }

    const uomClass = new UomClass({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      baseUomCode: dto.baseUomCode,
    });

    if (dto.uoms) {
      for (const uDto of dto.uoms) {
        uomClass.addUom(
          new Uom({ code: uDto.code, name: uDto.name, description: uDto.description }),
          uDto.toBaseFactor,
        );
      }
    }

    return this.repository.save(uomClass);
  }

  async addUomToClass(classCode: string, dto: CreateUomDto): Promise<UomClass> {
    const uomClass = await this.repository.findByCode(classCode);
    if (!uomClass) {
      throw new UomClassNotFoundException(classCode);
    }

    uomClass.addUom(
      new Uom({ code: dto.code, name: dto.name, description: dto.description }),
      dto.toBaseFactor,
    );

    return this.repository.save(uomClass);
  }

  async updateConversion(
    classCode: string,
    uomCode: string,
    toBaseFactor: number,
  ): Promise<UomClass> {
    const uomClass = await this.repository.findByCode(classCode);
    if (!uomClass) {
      throw new UomClassNotFoundException(classCode);
    }

    uomClass.updateConversion(uomCode, toBaseFactor);
    return this.repository.save(uomClass);
  }

  async removeUomFromClass(classCode: string, uomCode: string): Promise<UomClass> {
    const uomClass = await this.repository.findByCode(classCode);
    if (!uomClass) {
      throw new UomClassNotFoundException(classCode);
    }

    uomClass.removeUom(uomCode);
    return this.repository.save(uomClass);
  }

  async updateUomInClass(
    classCode: string,
    uomCode: string,
    data: { name?: string; description?: string | null; isActive?: boolean },
  ): Promise<UomClass> {
    const uomClass = await this.repository.findByCode(classCode);
    if (!uomClass) {
      throw new UomClassNotFoundException(classCode);
    }

    uomClass.updateUom(uomCode, data);
    return this.repository.save(uomClass);
  }

  async findAllClasses(): Promise<UomClass[]> {
    return this.repository.findAll();
  }

  async findClassByCode(code: string): Promise<UomClass> {
    const uomClass = await this.repository.findByCode(code);
    if (!uomClass) {
      throw new UomClassNotFoundException(code);
    }
    return uomClass;
  }

  async findClassByUomCode(uomCode: string): Promise<UomClass> {
    const uomClass = await this.repository.findClassByUomCode(uomCode);
    if (!uomClass) {
      throw new UomNotFoundException(uomCode);
    }
    return uomClass;
  }
}
