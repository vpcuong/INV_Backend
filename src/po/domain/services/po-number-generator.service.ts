import { Injectable } from '@nestjs/common';
import { IPORepository } from '../po.repository.interface';

@Injectable()
export class PONumberGeneratorService {
  constructor(private readonly repository: IPORepository) {}

  /**
   * Generate PO number
   * Format: PO-YYYYMM-0001
   * Uses findLastPOByPrefix to avoid race condition (instead of count)
   */
  async generate(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fullPrefix = `PO-${yearMonth}-`;

    const lastPoNum = await this.repository.findLastPOByPrefix(fullPrefix);

    let nextNumber = 1;
    if (lastPoNum) {
      const lastNumberStr = lastPoNum.replace(fullPrefix, '');
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${fullPrefix}${String(nextNumber).padStart(4, '0')}`;
  }
}
