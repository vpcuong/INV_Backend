import { Test, TestingModule } from '@nestjs/testing';
import { ThemeService } from './theme.service';
import { IThemeRepository } from '../domain/theme.repository.interface';
import { Theme } from '../domain/theme.entity';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UomRequiredWhenPriceProvidedException, InvalidThemeCodeException } from '../domain/exceptions/theme-domain.exception';

describe('ThemeService', () => {
  let service: ThemeService;
  let repository: IThemeRepository;

  // Mock repository
  const mockThemeRepository: Partial<IThemeRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        {
          provide: 'IThemeRepository',
          useValue: mockThemeRepository,
        },
      ],
    }).compile();

    service = module.get<ThemeService>(ThemeService);
    repository = module.get<IThemeRepository>('IThemeRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should create a theme successfully with all valid data', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH001',
        desc: 'Summer Collection',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: 'KG',
      };

      const expectedTheme = new Theme({
        id: 1,
        ...createThemeDto,
      });

      jest.spyOn(repository, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await service.save(createThemeDto);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(Theme)
      );
      expect(result).toBe(expectedTheme);
    });

    it('should create a theme without price and uom', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH002',
        desc: 'Winter Collection',
        supplierId: 2,
        colorCode: 'BLUE',
      };

      const expectedTheme = new Theme({
        id: 2,
        ...createThemeDto,
      });

      jest.spyOn(repository, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await service.save(createThemeDto);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedTheme);
    });

    it('should throw UomRequiredWhenPriceProvidedException when price is provided but uom is missing', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH003',
        desc: 'Spring Collection',
        supplierId: 3,
        colorCode: 'GREEN',
        price: 150,
        // uom is missing
      };

      // Act & Assert
      await expect(service.save(createThemeDto)).rejects.toThrow(
        UomRequiredWhenPriceProvidedException
      );
      await expect(service.save(createThemeDto)).rejects.toThrow(
        'UOM is required when price is provided'
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw UomRequiredWhenPriceProvidedException when price is provided but uom is empty string', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH004',
        desc: 'Autumn Collection',
        supplierId: 4,
        colorCode: 'YELLOW',
        price: 200,
        uom: '   ', // Empty/whitespace
      };

      // Act & Assert
      await expect(service.save(createThemeDto)).rejects.toThrow(
        UomRequiredWhenPriceProvidedException
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidThemeCodeException when code is too short', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH', // Too short (min 4 characters)
        desc: 'Test Theme',
        supplierId: 5,
        colorCode: 'RED',
      };

      // Act & Assert
      await expect(service.save(createThemeDto)).rejects.toThrow(
        InvalidThemeCodeException
      );
      await expect(service.save(createThemeDto)).rejects.toThrow(
        'Invalid theme code: TH. Code must be alphanumeric and 4-10 characters.'
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidThemeCodeException when code is too long', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'THEMECODE123', // Too long (max 10 characters)
        desc: 'Test Theme',
        supplierId: 6,
        colorCode: 'BLUE',
      };

      // Act & Assert
      await expect(service.save(createThemeDto)).rejects.toThrow(
        InvalidThemeCodeException
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidThemeCodeException when code contains special characters', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH-001', // Contains special character
        desc: 'Test Theme',
        supplierId: 7,
        colorCode: 'GREEN',
      };

      // Act & Assert
      await expect(service.save(createThemeDto)).rejects.toThrow(
        InvalidThemeCodeException
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should accept code with mix of letters and numbers', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH2024',
        desc: 'Mixed Code Theme',
        supplierId: 8,
        colorCode: 'PURPLE',
      };

      const expectedTheme = new Theme({
        id: 8,
        ...createThemeDto,
      });

      jest.spyOn(repository, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await service.save(createThemeDto);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedTheme);
    });

    it('should accept code with exactly 4 characters', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'TH01',
        desc: 'Min Length Theme',
        supplierId: 9,
        colorCode: 'ORANGE',
      };

      const expectedTheme = new Theme({
        id: 9,
        ...createThemeDto,
      });

      jest.spyOn(repository, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await service.save(createThemeDto);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedTheme);
    });

    it('should accept code with exactly 10 characters', async () => {
      // Arrange
      const createThemeDto: CreateThemeDto = {
        code: 'THEME12345',
        desc: 'Max Length Theme',
        supplierId: 10,
        colorCode: 'PINK',
      };

      const expectedTheme = new Theme({
        id: 10,
        ...createThemeDto,
      });

      jest.spyOn(repository, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await service.save(createThemeDto);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedTheme);
    });
  });

  describe('findById', () => {
    it('should return a theme when found', async () => {
      // Arrange
      const themeId = 1;
      const mockTheme = new Theme({
        id: themeId,
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      });

      jest.spyOn(repository, 'findById').mockResolvedValue(mockTheme);

      // Act
      const result = await service.findById(themeId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(themeId);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when theme is not found', async () => {
      // Arrange
      const themeId = 999;
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(themeId)).rejects.toThrow(
        `Theme with ID ${themeId} not found`
      );
    });
  });

  describe('delete', () => {
    it('should delete a theme successfully', async () => {
      // Arrange
      const themeId = 1;
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      // Act
      await service.delete(themeId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(themeId);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
