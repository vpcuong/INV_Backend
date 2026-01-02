import { Test, TestingModule } from '@nestjs/testing';
import { ThemeController } from './theme.controller';
import { ThemeService } from './application/theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { Theme } from './domain/theme.entity';
import { NotFoundException } from '@nestjs/common';

describe('ThemeController', () => {
  let controller: ThemeController;
  let service: ThemeService;

  const mockThemeService = {
    save: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeController],
      providers: [
        {
          provide: ThemeService,
          useValue: mockThemeService,
        },
      ],
    }).compile();

    controller = module.get<ThemeController>(ThemeController);
    service = module.get<ThemeService>(ThemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a theme successfully', async () => {
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

      jest.spyOn(service, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await controller.create(createThemeDto);

      // Assert
      expect(service.save).toHaveBeenCalledWith(createThemeDto);
      expect(service.save).toHaveBeenCalledTimes(1);
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

      jest.spyOn(service, 'save').mockResolvedValue(expectedTheme);

      // Act
      const result = await controller.create(createThemeDto);

      // Assert
      expect(service.save).toHaveBeenCalledWith(createThemeDto);
      expect(result).toBe(expectedTheme);
    });
  });

  describe('findById', () => {
    it('should return a theme when found', async () => {
      // Arrange
      const themeId = 1;
      const expectedTheme = {
        id: themeId,
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: 'KG',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        imgUrls: '',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(expectedTheme as any);

      // Act
      const result = await controller.findById(themeId);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(themeId);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedTheme);
    });

    it('should throw NotFoundException when theme is not found', async () => {
      // Arrange
      const themeId = 999;
      jest.spyOn(service, 'findById').mockRejectedValue(
        new NotFoundException(`Theme with ID ${themeId} not found`)
      );

      // Act & Assert
      await expect(controller.findById(themeId)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(themeId);
    });
  });

  describe('delete', () => {
    it('should delete a theme successfully', async () => {
      // Arrange
      const themeId = 1;
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      // Act
      await controller.delete(themeId);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(themeId);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });
  });
});
