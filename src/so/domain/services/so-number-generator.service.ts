import { ISOHeaderRepository } from '../so-header.repository.interface';

/**
 * Domain Service: SO Number Generation
 * Responsible for generating unique SO numbers following business rules
 */
export class SONumberGeneratorService {
  constructor(private readonly soHeaderRepository: ISOHeaderRepository) {}

  /**
   * Generate SO number with format: SO{YEAR}{SEQUENCE}
   * Example: SO2026000001, SO2026000002
   */
  async generate(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO${year}`;

    const lastSO = await this.soHeaderRepository.findLastSOByPrefix(prefix);

    let nextNum = 1;
    if (lastSO) {
      const lastNum = parseInt(lastSO.soNum.replace(prefix, ''));
      nextNum = lastNum + 1;
    }

    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Validate SO number format
   */
  isValidFormat(soNum: string): boolean {
    // Format: SO{YEAR}{6-digit sequence}
    const pattern = /^SO\d{4}\d{6}$/;
    return pattern.test(soNum);
  }

  /**
   * Extract year from SO number
   */
  extractYear(soNum: string): number | null {
    if (!this.isValidFormat(soNum)) {
      return null;
    }
    return parseInt(soNum.substring(2, 6));
  }

  /**
   * Extract sequence number from SO number
   */
  extractSequence(soNum: string): number | null {
    if (!this.isValidFormat(soNum)) {
      return null;
    }
    return parseInt(soNum.substring(6));
  }
}
