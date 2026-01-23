import { ISOHeaderRepository } from '../so-header.repository.interface';

/**
 * Domain Service: SO Number Generation
 * Responsible for generating unique SO numbers following business rules
 */
export class SONumberGeneratorService {
  constructor(private readonly soHeaderRepository: ISOHeaderRepository) {}

  /**
   * Generate SO number with format: SOYYMMXXXXX
   * YY: Last 2 digits of year
   * MM: Month (01-12)
   * XXXXX: 5-digit sequence
   * Example: SO260100001
   */
  async generate(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `SO${year}${month}`;

    const lastSO = await this.soHeaderRepository.findLastSOByPrefix(prefix);

    let nextNum = 1;
    if (lastSO) {
      const lastNum = parseInt(lastSO.soNum.substring(prefix.length));
      nextNum = lastNum + 1;
    }

    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  }

  /**
   * Validate SO number format
   */
  isValidFormat(soNum: string): boolean {
    // Format: SO{YY}{MM}{5-digit sequence}
    const pattern = /^SO\d{2}\d{2}\d{5}$/;
    return pattern.test(soNum);
  }

  /**
   * Extract year from SO number
   */
  extractYear(soNum: string): number | null {
    if (!this.isValidFormat(soNum)) {
      return null;
    }
    // Returns 2-digit year as number (e.g., 26)
    return parseInt(soNum.substring(2, 4));
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
