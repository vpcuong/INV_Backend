import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ItemSkuService } from './item-sku.service';
import { IItemSkuRepository } from '../domain/item-sku.repository.interface';
import { ITEM_SKU_REPOSITORY } from '../constant/item-sku.token';
import { ItemSku } from '../domain/item-sku.entity';
import { CreateItemSkuDto } from '../dto/create-item-sku.dto';
import { UpdateItemSkuDto } from '../dto/update-item-sku.dto';
import { PrismaService } from '../../prisma/prisma.service';

describe('ItemSkuService', () => {
  let service: ItemSkuService;
  let mockRepository: jest.Mocked<IItemSkuRepository>;
  let mockPrisma: jest.Mocked<PrismaService>;

  const mockItemSku = {
    getId: () => 1,
    getSkuCode: () => 'TEST001',
    toPersistence: () => ({ id: 1, skuCode: 'TEST001' }),
  } as ItemSku;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findBySkuCode: jest.fn(),
      findByItemId: jest.fn(),
      findByModelId: jest.fn(),
    } as any;

    mockPrisma = {
      client: {
        itemSKU: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemSkuService,
        {
          provide: ITEM_SKU_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ItemSkuService>(ItemSkuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateItemSkuDto = {
      skuCode: 'TEST001',
      colorId: 1,
      costPrice: 10,
      sellingPrice: 20,
    };

    it('should create item SKU successfully', async () => {
      // Arrange
      mockRepository.findBySkuCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockItemSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
        color: { id: 1, code: 'RED' },
      });

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockRepository.findBySkuCode).toHaveBeenCalledWith('TEST001');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockPrisma.client.itemSKU.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          color: true,
          gender: true,
          size: true,
          uom: true,
        },
      });
      expect(result).toBeDefined();
    });

    it('should generate SKU code when not provided', async () => {
      // Arrange
      const createDtoWithoutSku = { ...createDto };
      delete (createDtoWithoutSku as any).skuCode;

      mockRepository.findBySkuCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockItemSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.create(createDtoWithoutSku);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          skuCode: expect.any(String),
        })
      );
    });

    it('should throw ConflictException when SKU code already exists', async () => {
      // Arrange
      mockRepository.findBySkuCode.mockResolvedValue(mockItemSku);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'SKU code TEST001 already exists'
      );
    });

    it('should create SKU with all optional fields', async () => {
      // Arrange
      const fullCreateDto: CreateItemSkuDto = {
        skuCode: 'FULL001',
        colorId: 1,
        itemId: 10,
        modelId: 20,
        genderId: 2,
        sizeId: 3,
        supplierId: 4,
        customerId: 5,
        fabricSKUId: 6,
        pattern: 'striped',
        lengthCm: 10.5,
        widthCm: 5.5,
        heightCm: 2.0,
        weightG: 100.0,
        desc: 'Full test SKU',
        costPrice: 15.5,
        sellingPrice: 25.99,
        uomCode: 'PCS',
        status: 'active',
      };

      mockRepository.findBySkuCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockItemSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'FULL001',
      });

      // Act
      await service.create(fullCreateDto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          skuCode: 'FULL001',
          colorId: 1,
          itemId: 10,
          modelId: 20,
          genderId: 2,
          sizeId: 3,
          supplierId: 4,
          customerId: 5,
          fabricSKUId: 6,
          pattern: 'striped',
          lengthCm: 10.5,
          widthCm: 5.5,
          heightCm: 2.0,
          weightG: 100.0,
          desc: 'Full test SKU',
          costPrice: 15.5,
          sellingPrice: 25.99,
          uomCode: 'PCS',
          status: 'active',
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return all item SKUs with relations', async () => {
      // Arrange
      const mockSkus = [mockItemSku];
      mockRepository.findAll.mockResolvedValue(mockSkus);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
        color: { id: 1, code: 'RED' },
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockPrisma.client.itemSKU.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no SKUs exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return item SKU by ID', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockItemSku);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });
  });

  describe('findByItemId', () => {
    it('should return SKUs by item ID', async () => {
      // Arrange
      const mockSkus = [mockItemSku];
      mockRepository.findByItemId.mockResolvedValue(mockSkus);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      const result = await service.findByItemId(10);

      // Assert
      expect(mockRepository.findByItemId).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByModelId', () => {
    it('should return SKUs by model ID', async () => {
      // Arrange
      const mockSkus = [mockItemSku];
      mockRepository.findByModelId.mockResolvedValue(mockSkus);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      const result = await service.findByModelId(20);

      // Assert
      expect(mockRepository.findByModelId).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    const updateDto: UpdateItemSkuDto = {
      costPrice: 15,
      sellingPrice: 30,
    };

    it('should update item SKU successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockItemSku);
      mockRepository.update.mockResolvedValue(mockItemSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        expect.any(ItemSku)
      );
      expect(result).toBeDefined();
    });

    it('should update only prices when provided', async () => {
      // Arrange
      const priceOnlyDto = { costPrice: 25, sellingPrice: 45 };
      const mockUpdatedSku = {
        ...mockItemSku,
        updatePrices: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, priceOnlyDto);

      // Assert
      expect(mockUpdatedSku.updatePrices).toHaveBeenCalledWith(25, 45);
    });

    it('should update dimensions when provided', async () => {
      // Arrange
      const dimensionDto = {
        lengthCm: 20,
        widthCm: 10,
        heightCm: 5,
        weightG: 200,
      };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateDimensions: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, dimensionDto);

      // Assert
      expect(mockUpdatedSku.updateDimensions).toHaveBeenCalledWith({
        lengthCm: 20,
        widthCm: 10,
        heightCm: 5,
        weightG: 200,
      });
    });

    it('should update details when provided', async () => {
      // Arrange
      const detailsDto = {
        desc: 'Updated description',
        pattern: 'updated pattern',
      };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateDetails: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, detailsDto);

      // Assert
      expect(mockUpdatedSku.updateDetails).toHaveBeenCalledWith(
        'Updated description',
        'updated pattern'
      );
    });

    it('should update relations when provided', async () => {
      // Arrange
      const relationsDto = { supplierId: 5, customerId: 6, fabricSKUId: 7 };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateRelations: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, relationsDto);

      // Assert
      expect(mockUpdatedSku.updateRelations).toHaveBeenCalledWith(5, 6, 7);
    });

    it('should update classification when provided', async () => {
      // Arrange
      const classificationDto = { genderId: 3, sizeId: 4 };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateClassification: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, classificationDto);

      // Assert
      expect(mockUpdatedSku.updateClassification).toHaveBeenCalledWith(3, 4);
    });

    it('should update UOM when provided', async () => {
      // Arrange
      const uomDto = { uomCode: 'KG' };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateUom: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, uomDto);

      // Assert
      expect(mockUpdatedSku.updateUom).toHaveBeenCalledWith('KG');
    });

    it('should update status when provided', async () => {
      // Arrange
      const statusDto = { status: 'inactive' };
      const mockUpdatedSku = {
        ...mockItemSku,
        updateStatus: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockUpdatedSku);
      mockRepository.update.mockResolvedValue(mockUpdatedSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.update(1, statusDto);

      // Assert
      expect(mockUpdatedSku.updateStatus).toHaveBeenCalledWith('inactive');
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });
  });

  describe('activate', () => {
    it('should activate SKU successfully', async () => {
      // Arrange
      const mockActivatableSku = {
        ...mockItemSku,
        activate: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockActivatableSku);
      mockRepository.update.mockResolvedValue(mockActivatableSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.activate(1);

      // Assert
      expect(mockActivatableSku.activate).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(1, mockActivatableSku);
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.activate(999)).rejects.toThrow(NotFoundException);
      await expect(service.activate(999)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate SKU successfully', async () => {
      // Arrange
      const mockDeactivatableSku = {
        ...mockItemSku,
        deactivate: jest.fn(),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      } as any;

      mockRepository.findOne.mockResolvedValue(mockDeactivatableSku);
      mockRepository.update.mockResolvedValue(mockDeactivatableSku);
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue({
        id: 1,
        skuCode: 'TEST001',
      });

      // Act
      await service.deactivate(1);

      // Assert
      expect(mockDeactivatableSku.deactivate).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        mockDeactivatableSku
      );
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deactivate(999)).rejects.toThrow(NotFoundException);
      await expect(service.deactivate(999)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });
  });

  describe('remove', () => {
    it('should delete SKU successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockItemSku);
      mockRepository.remove.mockResolvedValue(mockItemSku);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when SKU not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Item SKU with ID 999 not found'
      );
    });
  });
});
