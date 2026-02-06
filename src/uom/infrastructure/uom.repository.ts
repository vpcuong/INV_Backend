import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUomRepository } from '../domain/uom.repository.interface';
import { UomClass } from '../domain/uom-class.entity';
import { Uom } from '../domain/uom.entity';
import { UomConversion } from '../domain/uom-conversion.entity';
import { RowMode } from '../../common/enums/row-mode.enum';

@Injectable()
export class UomRepository implements IUomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(uomClass: UomClass): Promise<UomClass> {
    await this.prisma.$transaction(async (tx) => {
      // Upsert Class
      await tx.uOMClass.upsert({
        where: { code: uomClass.getCode() },
        create: {
          code: uomClass.getCode(),
          name: uomClass.getName(),
          description: uomClass.getDescription(),
          baseUOMCode: uomClass.getBaseUomCode(),
          isActive: uomClass.getIsActive(),
        },
        update: {
          name: uomClass.getName(),
          description: uomClass.getDescription(),
          baseUOMCode: uomClass.getBaseUomCode(),
          isActive: uomClass.getIsActive(),
        },
      });

      // Sync UoMs using RowMode
      const uoms = uomClass.getUoms();
      for (const uom of uoms) {
        if (uom.getRowMode() === RowMode.NEW) {
          await tx.uOM.create({
            data: {
              code: uom.getCode(),
              name: uom.getName(),
              description: uom.getDescription(),
              isActive: uom.getIsActive(),
              classCode: uomClass.getCode(),
            },
          });
        } else if (uom.getRowMode() === RowMode.UPDATED) {
          await tx.uOM.update({
            where: { code: uom.getCode() },
            data: {
              name: uom.getName(),
              description: uom.getDescription(),
              isActive: uom.getIsActive(),
            },
          });
        } else if (uom.getRowMode() === RowMode.DELETED) {
          await tx.uOM.delete({
            where: { code: uom.getCode() },
          });
        }
      }

      // Sync Conversions using RowMode
      const conversions = uomClass.getConversions();
      for (const conv of conversions) {
        if (conv.getRowMode() === RowMode.NEW) {
          await tx.uOMConversion.create({
            data: {
              uomClassCode: uomClass.getCode(),
              uomCode: conv.getUomCode(),
              toBaseFactor: conv.getToBaseFactor(),
              isActive: conv.getIsActive(),
            },
          });
        } else if (conv.getRowMode() === RowMode.UPDATED) {
          await tx.uOMConversion.update({
            where: {
              uomClassCode_uomCode: {
                uomClassCode: uomClass.getCode(),
                uomCode: conv.getUomCode(),
              },
            },
            data: {
              toBaseFactor: conv.getToBaseFactor(),
              isActive: conv.getIsActive(),
            },
          });
        } else if (conv.getRowMode() === RowMode.DELETED) {
          await tx.uOMConversion.delete({
            where: {
              uomClassCode_uomCode: {
                uomClassCode: uomClass.getCode(),
                uomCode: conv.getUomCode(),
              },
            },
          });
        }
      }
    });

    return this.findByCode(uomClass.getCode()) as Promise<UomClass>;
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
      uoms: data.uoms.map(
        (u) => new Uom({ code: u.code, name: u.name, description: u.description, isActive: u.isActive }),
      ),
      conversions: data.uomConvs.map(
        (c) => new UomConversion({ uomCode: c.uomCode, toBaseFactor: c.toBaseFactor, isActive: c.isActive }),
      ),
    });
  }

  async findAll(): Promise<UomClass[]> {
    const classes = await this.prisma.client.uOMClass.findMany({
      include: {
        uoms: true,
        uomConvs: true,
      },
    });

    return classes.map((data) =>
      UomClass.create({
        code: data.code,
        name: data.name,
        description: data.description,
        baseUomCode: data.baseUOMCode,
        isActive: data.isActive,
        uoms: data.uoms.map(
          (u) => new Uom({ code: u.code, name: u.name, description: u.description, isActive: u.isActive }),
        ),
        conversions: data.uomConvs.map(
          (c) => new UomConversion({ uomCode: c.uomCode, toBaseFactor: c.toBaseFactor, isActive: c.isActive }),
        ),
      }),
    );
  }

  async remove(code: string): Promise<void> {
    await this.prisma.client.uOMClass.delete({
      where: { code },
    });
  }

  async findUomByCode(uomCode: string): Promise<any> {
    return this.prisma.client.uOM.findUnique({ where: { code: uomCode } });
  }
}