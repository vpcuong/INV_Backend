import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemSkusController } from './item-skus.controller';
import { ItemSkuService } from './application/item-sku.service';
import { ItemSkuQueryService } from './application/item-sku-query.service';
import { CreateItemSkuDto } from './dto/create-item-sku.dto';
import { UpdateItemSkuDto } from './dto/update-item-sku.dto';
import { ItemSkuFilterDto } from './dto/item-sku-filter.dto';
import { FilterDto } from '@/common/filtering';

describe('ItemSkusController', () => {
  let controller: ItemSkusController;
  let mockItemSkuService: jest.Mocked<ItemSkuService>;
  let mockItemSkuQueryService: jest.Mocked<ItemSkuQueryService>;

  const mockCreatedSku = {
    id: 1,
    skuCode: 'TEST001',
    colorId: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSkuWithRelations = {
    id: 1,
    skuCode: 'TEST001',
    colorId: 1,
    status: 'active',
    color: { id: 1, code: 'RED', name: 'Red' },
    gender: { id: 2, code: 'M', name: 'Male' },
    size: { id: 3, code: 'L', name: 'Large' },
    uom: { id: 1, code: 'PCS', name: 'Pieces' },
  };

  const mockPaginatedResult = {
    data: [mockSkuWithRelations],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    mockItemSkuService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByItemId: jest.fn(),
      findByModelId: jest.fn(),
      update: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
      remove: jest.fn(),
    } as any;

    mockItemSkuQueryService = {
      findAllWithFilters: jest.fn(),
      findByItemId: jest.fn(),
      findByModelId: jest.fn(),
      findByCategory: jest.fn(),
      findValidFabricSKUByMaterialColor: jest.fn(),
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemSkusController],
      providers: [
        {
          provide: ItemSkuService,
          useValue: mockItemSkuService,
        },
        {
          provide: ItemSkuQueryService,
          useValue: mockItemSkuQueryService,
        },
      ],
    }).compile();

    controller = module.get<ItemSkusController>(ItemSkusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateItemSkuDto = {
      skuCode: 'TEST001',
      colorId: 1,
      costPrice: 10,
      sellingPrice: 20,
    };

    it('should create a new item SKU', async () => {
      // Arrange
      mockItemSkuService.create.mockResolvedValue(mockSkuWithRelations);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(mockItemSkuService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSkuWithRelations);
    });

    it('should create SKU with auto-generated code when not provided', async () => {
      // Arrange
      const createDtoWithoutSku = { ...createDto };
      delete (createDtoWithoutSku as any).skuCode;

      mockItemSkuService.create.mockResolvedValue(mockSkuWithRelations);

      // Act
      await controller.create(createDtoWithoutSku);

      // Assert
      expect(mockItemSkuService.create).toHaveBeenCalledWith(
        createDtoWithoutSku
      );
    });

    it('should handle validation errors from service', async () => {
      // Arrange
      const error = new Error('Validation failed');
      mockItemSkuService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(error);
      expect(mockItemSkuService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const filterDto: ItemSkuFilterDto = {
      status: 'active',
      page: 1,
      limit: 10,
    };

    it('should return all item SKUs with filtering', async () => {
      // Arrange
      mockItemSkuQueryService.findAllWithFilters.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(mockItemSkuQueryService.findAllWithFilters).toHaveBeenCalledWith(
        filterDto
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty filter', async () => {
      // Arrange
      const emptyFilter = {};
      mockItemSkuQueryService.findAllWithFilters.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      // Act
      const result = await controller.findAll(emptyFilter);

      // Assert
      expect(mockItemSkuQueryService.findAllWithFilters).toHaveBeenCalledWith(
        emptyFilter
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should handle complex filtering', async () => {
      // Arrange
      const complexFilter: ItemSkuFilterDto = {
        status: 'active',
        skuCode: { operator: 'contains', value: 'TEST' },
        costPrice: { operator: 'between', value: [10, 50] },
        colorId: { operator: 'in', value: [1, 2, 3] },
        page: 2,
        limit: 5,
        sortBy: 'skuCode',
        sortOrder: 'desc',
      };

      mockItemSkuQueryService.findAllWithFilters.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      await controller.findAll(complexFilter);

      // Assert
      expect(mockItemSkuQueryService.findAllWithFilters).toHaveBeenCalledWith(
        complexFilter
      );
    });
  });

  describe('findByItemId', () => {
    const filterDto: FilterDto = { status: 'active' };

    it('should return SKUs for specific item', async () => {
      // Arrange
      mockItemSkuQueryService.findByItemId.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      const result = await controller.findByItemId(10, filterDto);

      // Assert
      expect(mockItemSkuQueryService.findByItemId).toHaveBeenCalledWith(
        10,
        filterDto
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle non-existent item', async () => {
      // Arrange
      mockItemSkuQueryService.findByItemId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      // Act
      const result = await controller.findByItemId(999, filterDto);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should handle invalid item ID', async () => {
      // Arrange
      mockItemSkuQueryService.findByItemId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      // Act
      const result = await controller.findByItemId(0, filterDto);

      // Assert
      expect(mockItemSkuQueryService.findByItemId).toHaveBeenCalledWith(
        0,
        filterDto
      );
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findByModelId', () => {
    const filterDto: FilterDto = { status: 'active' };

    it('should return SKUs for specific model', async () => {
      // Arrange
      mockItemSkuQueryService.findByModelId.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      const result = await controller.findByModelId(20, filterDto);

      // Assert
      expect(mockItemSkuQueryService.findByModelId).toHaveBeenCalledWith(
        20,
        filterDto
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle non-existent model', async () => {
      // Arrange
      mockItemSkuQueryService.findByModelId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      // Act
      const result = await controller.findByModelId(999, filterDto);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findByCategory', () => {
    const filterDto: ItemSkuFilterDto = {
      status: 'active',
      materialId: { operator: 'equals', value: 5 },
    };

    it('should return SKUs for specific category', async () => {
      // Arrange
      mockItemSkuQueryService.findByCategory.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      const result = await controller.findByCategory(10, filterDto);

      // Assert
      expect(mockItemSkuQueryService.findByCategory).toHaveBeenCalledWith(
        10,
        filterDto
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle category with material filter', async () => {
      // Arrange
      const materialFilter = { materialId: { operator: 'equals', value: 3 } };
      mockItemSkuQueryService.findByCategory.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      await controller.findByCategory(15, materialFilter);

      // Assert
      expect(mockItemSkuQueryService.findByCategory).toHaveBeenCalledWith(
        15,
        materialFilter
      );
    });

    it('should handle invalid category ID', async () => {
      // Arrange
      mockItemSkuQueryService.findByCategory.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      // Act
      const result = await controller.findByCategory(0, filterDto);

      // Assert
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findValidFabricSKUByMaterialColor', () => {
    const filterDto: ItemSkuFilterDto = { status: 'active' };

    it('should return SKUs for material-color combination', async () => {
      // Arrange
      mockItemSkuQueryService.findValidFabricSKUByMaterialColor.mockResolvedValue(
        mockPaginatedResult
      );

      // Act
      const result = await controller.findValidFabricSKUByMaterialColor(
        5,
        3,
        filterDto
      );

      // Assert
      expect(
        mockItemSkuQueryService.findValidFabricSKUByMaterialColor
      ).toHaveBeenCalledWith(5, 3, filterDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle no matching fabric SKUs', async () => {
      // Arrange
      mockItemSkuQueryService.findValidFabricSKUByMaterialColor.mockResolvedValue(
        {
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        }
      );

      // Act
      const result = await controller.findValidFabricSKUByMaterialColor(
        999,
        999,
        filterDto
      );

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return item SKU by ID', async () => {
      // Arrange
      mockItemSkuQueryService.findOne.mockResolvedValue(mockSkuWithRelations);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(mockItemSkuQueryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSkuWithRelations);
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockItemSkuQueryService.findOne.mockRejectedValue(
        new NotFoundException('Item SKU with ID 999 not found')
      );

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });

    it('should handle invalid ID format', async () => {
      // Arrange
      mockItemSkuQueryService.findOne.mockRejectedValue(
        new NotFoundException('Item SKU with ID 0 not found')
      );

      // Act & Assert
      await expect(controller.findOne(0)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateItemSkuDto = {
      costPrice: 15,
      sellingPrice: 30,
    };

    it('should update item SKU successfully', async () => {
      // Arrange
      mockItemSkuService.update.mockResolvedValue(mockSkuWithRelations);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(mockItemSkuService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockSkuWithRelations);
    });

    it('should handle partial update', async () => {
      // Arrange
      const partialUpdate = { desc: 'Updated description' };
      mockItemSkuService.update.mockResolvedValue({
        ...mockSkuWithRelations,
        desc: 'Updated description',
      });

      // Act
      const result = await controller.update(1, partialUpdate);

      // Assert
      expect(mockItemSkuService.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result.desc).toBe('Updated description');
    });

    it('should throw NotFoundException when updating non-existent SKU', async () => {
      // Arrange
      mockItemSkuService.update.mockRejectedValue(
        new NotFoundException('Item SKU with ID 999 not found')
      );

      // Act & Assert
      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidUpdate = { costPrice: -10 };
      const error = new Error('Cost price cannot be negative');
      mockItemSkuService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.update(1, invalidUpdate)).rejects.toThrow(error);
    });
  });

  describe('activate', () => {
    it('should activate SKU successfully', async () => {
      // Arrange
      const activatedSku = { ...mockSkuWithRelations, status: 'active' };
      mockItemSkuService.activate.mockResolvedValue(activatedSku);

      // Act
      const result = await controller.activate(1);

      // Assert
      expect(mockItemSkuService.activate).toHaveBeenCalledWith(1);
      expect(result.status).toBe('active');
    });

    it('should throw NotFoundException when activating non-existent SKU', async () => {
      // Arrange
      mockItemSkuService.activate.mockRejectedValue(
        new NotFoundException('Item SKU with ID 999 not found')
      );

      // Act & Assert
      await expect(controller.activate(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle already active SKU', async () => {
      // Arrange
      const activeSku = { ...mockSkuWithRelations, status: 'active' };
      mockItemSkuService.activate.mockResolvedValue(activeSku);

      // Act
      const result = await controller.activate(1);

      // Assert
      expect(result.status).toBe('active');
    });
  });

  describe('deactivate', () => {
    it('should deactivate SKU successfully', async () => {
      // Arrange
      const deactivatedSku = { ...mockSkuWithRelations, status: 'inactive' };
      mockItemSkuService.deactivate.mockResolvedValue(deactivatedSku);

      // Act
      const result = await controller.deactivate(1);

      // Assert
      expect(mockItemSkuService.deactivate).toHaveBeenCalledWith(1);
      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException when deactivating non-existent SKU', async () => {
      // Arrange
      mockItemSkuService.deactivate.mockRejectedValue(
        new NotFoundException('Item SKU with ID 999 not found')
      );

      // Act & Assert
      await expect(controller.deactivate(999)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle already inactive SKU', async () => {
      // Arrange
      const inactiveSku = { ...mockSkuWithRelations, status: 'inactive' };
      mockItemSkuService.deactivate.mockResolvedValue(inactiveSku);

      // Act
      const result = await controller.deactivate(1);

      // Assert
      expect(result.status).toBe('inactive');
    });
  });

  describe('remove', () => {
    it('should delete SKU successfully', async () => {
      // Arrange
      mockItemSkuService.remove.mockResolvedValue(mockSkuWithRelations);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(mockItemSkuService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSkuWithRelations);
    });

    it('should throw NotFoundException when deleting non-existent SKU', async () => {
      // Arrange
      mockItemSkuService.remove.mockRejectedValue(
        new NotFoundException('Item SKU with ID 999 not found')
      );

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle delete conflicts', async () => {
      // Arrange
      const conflictError = new Error(
        'Cannot delete SKU - referenced by other records'
      );
      mockItemSkuService.remove.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow(conflictError);
    });
  });
});
