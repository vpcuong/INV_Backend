import { Uom } from './uom.entity';
import { UomConversion } from './uom-conversion.entity';
import { BadRequestException } from '@nestjs/common';

export class UomClass {
  private uoms: Uom[] = [];
  private conversions: UomConversion[] = [];

  constructor(
    public readonly code: string,
    public name: string,
    public description?: string | null,
    public baseUomCode?: string | null,
    public isActive: boolean = true,
  ) {}

  getUoms(): Uom[] {
    return [...this.uoms];
  }

  getConversions(): UomConversion[] {
    return [...this.conversions];
  }

  setUoms(uoms: Uom[]) {
    this.uoms = uoms;
  }

  setConversions(conversions: UomConversion[]) {
    this.conversions = conversions;
  }

  addUom(uom: Uom, factor: number) {
    if (this.uoms.some(u => u.code === uom.code)) {
      throw new BadRequestException(`UOM ${uom.code} already exists in class ${this.code}`);
    }
    this.uoms.push(uom);
    this.conversions.push(new UomConversion(uom.code, factor));
  }
  
  updateUom(uom: Uom) {
      const idx = this.uoms.findIndex(u => u.code === uom.code);
      if (idx === -1) {
          throw new BadRequestException(`UOM ${uom.code} does not exist in class ${this.code}`);
      }
      this.uoms[idx] = uom;
  }

  updateConversion(uomCode: string, factor: number) {
    const conversion = this.conversions.find(c => c.uomCode === uomCode);
    if (!conversion) {
      throw new BadRequestException(`Conversion for UOM ${uomCode} not found in class ${this.code}`);
    }
    conversion.toBaseFactor = factor;
  }

  // Helper to init from persistence
  static create(data: {
      code: string;
      name: string;
      description?: string | null;
      baseUomCode?: string | null;
      isActive?: boolean;
      uoms?: Uom[];
      conversions?: UomConversion[];
  }): UomClass {
      const uomClass = new UomClass(
          data.code,
          data.name,
          data.description,
          data.baseUomCode,
          data.isActive
      );
      if (data.uoms) uomClass.setUoms(data.uoms);
      if (data.conversions) uomClass.setConversions(data.conversions);
      return uomClass;
  }
}
