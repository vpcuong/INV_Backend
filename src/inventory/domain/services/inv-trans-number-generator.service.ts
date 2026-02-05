import { Injectable } from '@nestjs/common';
import { IInvTransHeaderRepository } from '../inv-trans-header.repository.interface';
import { InvTransType } from '../../enums/inv-trans.enum';

@Injectable()
export class InvTransNumberGeneratorService {
  constructor(private readonly repository: IInvTransHeaderRepository) {}

  /**
   * Generate transaction number based on type
   * Format: GR-YYYYMM-0001, GI-YYYYMM-0001, ST-YYYYMM-0001, ADJ-YYYYMM-0001
   */
  async generate(type: InvTransType): Promise<string> {
    const prefix = this.getPrefix(type);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fullPrefix = `${prefix}-${yearMonth}-`;

    const lastTrans = await this.repository.findLastTransByPrefix(fullPrefix);
    
    let nextNumber = 1;
    if (lastTrans?.transNum) {
      const lastNumberStr = lastTrans.transNum.replace(fullPrefix, '');
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${fullPrefix}${String(nextNumber).padStart(4, '0')}`;
  }

  private getPrefix(type: InvTransType): string {
    switch (type) {
      case InvTransType.GOODS_RECEIPT:
        return 'GR';
      case InvTransType.GOODS_ISSUE:
        return 'GI';
      case InvTransType.STOCK_TRANSFER:
        return 'ST';
      case InvTransType.ADJUSTMENT:
        return 'ADJ';
      default:
        return 'INV';
    }
  }
}
