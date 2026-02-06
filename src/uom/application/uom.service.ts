import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IUomRepository } from '../domain/uom.repository.interface';
import { UomClass } from '../domain/uom-class.entity';
import { Uom } from '../domain/uom.entity';
import { CreateUomClassDto } from '../presentation/dto/create-uom-class.dto';
import { CreateUomDto } from '../presentation/dto/create-uom.dto';

@Injectable()
export class UomService {
  constructor(
      @Inject('IUomRepository') private readonly repository: IUomRepository
  ) {}

  async createClass(dto: CreateUomClassDto): Promise<UomClass> {
      const existing = await this.repository.findByCode(dto.code);
      if (existing) {
          throw new BadRequestException(`UOM Class ${dto.code} already exists`);
      }

      const uomClass = new UomClass(dto.code, dto.name, dto.description, dto.baseUomCode);
      
      if (dto.uoms) {
          for (const uDto of dto.uoms) {
              uomClass.addUom(
                  new Uom(uDto.code, uDto.name, uDto.description),
                  uDto.toBaseFactor
              );
          }
      }

      return this.repository.save(uomClass);
  }

  async addUomToClass(classCode: string, dto: CreateUomDto): Promise<UomClass> {
      const uomClass = await this.repository.findByCode(classCode);
      if (!uomClass) {
          throw new NotFoundException(`UOM Class ${classCode} not found`);
      }

      uomClass.addUom(
          new Uom(dto.code, dto.name, dto.description),
          dto.toBaseFactor
      );

      return this.repository.save(uomClass);
  }

  async findAllClasses(): Promise<UomClass[]> {
      return this.repository.findAll();
  }

  async findClassByCode(code: string): Promise<UomClass> {
      const uomClass = await this.repository.findByCode(code);
      if (!uomClass) {
          throw new NotFoundException(`UOM Class ${code} not found`);
      }
      return uomClass;
  }
}
