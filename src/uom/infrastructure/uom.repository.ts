import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUomRepository } from '../domain/uom.repository.interface';
import { UomClass } from '../domain/uom-class.entity';
import { Uom } from '../domain/uom.entity';
import { UomConversion } from '../domain/uom-conversion.entity';

@Injectable()
export class UomRepository implements IUomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(uomClass: UomClass): Promise<UomClass> {
    const { code, name, description, baseUomCode, isActive } = uomClass as any; // Access private via casting or add getters
    // Note: In a real DDD entity, we should have getters. I will add getters to entity if missing or use public props for now.
    // The previous entity definition used public properties in constructor, so we can access them directly if we didn't mark them private.
    // Checking entity definition: `constructor(public readonly code: string, public name: string ...)` -> props are public.
    // But `uoms` and `conversions` are private. I added getters `getUoms()` etc.

    // Using transaction to ensure consistency
    await this.prisma.$transaction(async (tx) => {
      // Upsert Class
      await tx.uOMClass.upsert({
        where: { code: uomClass.code },
        create: {
          code: uomClass.code,
          name: uomClass.name,
          description: uomClass.description,
          baseUOMCode: uomClass.baseUomCode,
          isActive: uomClass.isActive,
        },
        update: {
            name: uomClass.name,
            description: uomClass.description,
            baseUOMCode: uomClass.baseUomCode,
            isActive: uomClass.isActive,
        },
      });

      // Sync UoMs
      const uoms = uomClass.getUoms();
      for (const uom of uoms) {
          await tx.uOM.upsert({
              where: { code: uom.code },
              create: {
                  code: uom.code,
                  name: uom.name,
                  description: uom.description,
                  isActive: uom.isActive,
                  classCode: uomClass.code,
              },
              update: {
                  name: uom.name,
                  description: uom.description,
                  isActive: uom.isActive,
              }
          });
      }

      // Sync Conversions
      const conversions = uomClass.getConversions();
      for (const conv of conversions) {
          await tx.uOMConversion.upsert({
              where: {
                  uomClassCode_uomCode: {
                      uomClassCode: uomClass.code,
                      uomCode: conv.uomCode
                  }
              },
              create: {
                  uomClassCode: uomClass.code,
                  uomCode: conv.uomCode,
                  toBaseFactor: conv.toBaseFactor,
                  isActive: conv.isActive
              },
              update: {
                  toBaseFactor: conv.toBaseFactor,
                  isActive: conv.isActive
              }
          });
      }
    });

    return uomClass;
  }

  async findByCode(code: string): Promise<UomClass | null> {
    const data = await this.prisma.client.uOMClass.findUnique({
      where: { code },
      include: {
        uoms: true,
        uomConvs: true,
      },
    });

    if (!data) return null;

    return UomClass.create({
        code: data.code,
        name: data.name,
        description: data.description,
        baseUomCode: data.baseUOMCode,
        isActive: data.isActive,
        uoms: data.uoms.map(u => new Uom(u.code, u.name, u.description, u.isActive)),
        conversions: data.uomConvs.map(c => new UomConversion(c.uomCode, c.toBaseFactor, c.isActive))
    });
  }

  async findAll(): Promise<UomClass[]> {
    const classes = await this.prisma.client.uOMClass.findMany({
        include: {
            uoms: true,
            uomConvs: true
        }
    });

    return classes.map(data => UomClass.create({
        code: data.code,
        name: data.name,
        description: data.description,
        baseUomCode: data.baseUOMCode,
        isActive: data.isActive,
        uoms: data.uoms.map(u => new Uom(u.code, u.name, u.description, u.isActive)),
        conversions: data.uomConvs.map(c => new UomConversion(c.uomCode, c.toBaseFactor, c.isActive))
    }));
  }

  async remove(code: string): Promise<void> {
    await this.prisma.client.uOMClass.delete({
        where: { code }
    });
  }

  async findUomByCode(uomCode: string): Promise<any> {
       return this.prisma.client.uOM.findUnique({ where: { code: uomCode } });
  }
}
