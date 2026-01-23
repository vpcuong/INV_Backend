import { SONumberGeneratorService } from './so-number-generator.service';
import { ISOHeaderRepository } from '../so-header.repository.interface';

describe('SONumberGeneratorService', () => {
  let service: SONumberGeneratorService;
  let mockRepository: jest.Mocked<ISOHeaderRepository>;

  beforeEach(() => {
    mockRepository = {
      findLastSOByPrefix: jest.fn(),
    } as any;
    service = new SONumberGeneratorService(mockRepository);
  });

  describe('generate', () => {
    it('should generate a new SO number with format SOYYMMXXXXX', async () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      mockRepository.findLastSOByPrefix.mockResolvedValue(null);

      const soNum = await service.generate();

      expect(soNum).toBe(`SO${year}${month}00001`);
      expect(soNum.length).toBe(11);
    });

    it('should increment sequence correctly', async () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `SO${year}${month}`;
      
      mockRepository.findLastSOByPrefix.mockResolvedValue({ soNum: `${prefix}00005` });

      const soNum = await service.generate();

      expect(soNum).toBe(`${prefix}00006`);
    });

    it('should handle overflow (though unlikely with 5 digits)', async () => {
       const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `SO${year}${month}`;
      
      mockRepository.findLastSOByPrefix.mockResolvedValue({ soNum: `${prefix}99999` });

      const soNum = await service.generate();

      expect(soNum).toBe(`${prefix}100000`); // JS will just add 1, return 6 digits if overflow
    });
  });

  describe('isValidFormat', () => {
    it('should return true for valid format', () => {
      expect(service.isValidFormat('SO260100001')).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(service.isValidFormat('SO2026000001')).toBe(false); // old format
      expect(service.isValidFormat('SO26010001')).toBe(false); // too short
      expect(service.isValidFormat('SO2601000001')).toBe(false); // too long
      expect(service.isValidFormat('AB260100001')).toBe(false); // wrong prefix
    });
  });

  describe('extractYear', () => {
    it('should extract 2-digit year correctly', () => {
      expect(service.extractYear('SO260100001')).toBe(26);
    });

    it('should return null for invalid format', () => {
      expect(service.extractYear('INVALID')).toBeNull();
    });
  });

  describe('extractSequence', () => {
    it('should extract sequence correctly', () => {
      expect(service.extractSequence('SO260100005')).toBe(5);
      expect(service.extractSequence('SO260112345')).toBe(12345);
    });

    it('should return null for invalid format', () => {
      expect(service.extractSequence('INVALID')).toBeNull();
    });
  });
});
