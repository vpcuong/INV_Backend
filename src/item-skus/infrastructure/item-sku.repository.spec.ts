import { Test, TestingModule } from '@nestjs/testing';
import { ItemSkuRepository } from './item-sku.repository';
import { IItemSkuRepository } from '../domain/item-sku.repository.interface';
import { ItemSku } from '../domain/item-sku.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { ITEM_SKU_REPOSITORY } from '../constant/item-sku.token';

describe('ItemSkuRepository', () => {
  let repository: ItemSkuRepository;
  let mockPrisma: jest.Mocked<PrismaService>;

  const mockItemSku = {
    getId: () => 1,
    getSkuCode: () => 'TEST001',
    getColorId: () => 1,
    toPersistence: () => ({
      id: 1,
      skuCode: 'TEST001',
      colorId: 1,
      status: 'active',
    }),
  } as ItemSku;

  const mockPersistenceData = {
    id: 1,
    skuCode: 'TEST001',
    colorId: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      client: {
        itemSKU: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemSkuRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<ItemSkuRepository>(ITEM_SKU_REPOSITORY);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item SKU', async () => {
      // Arrange
      mockPrisma.client.itemSKU.create.mockResolvedValue(mockPersistenceData);

      // Act
      const result = await repository.create(mockItemSku);

      // Assert
      expect(mockPrisma.client.itemSKU.create).toHaveBeenCalledWith({
        data: mockItemSku.toPersistence(),
      });
      expect(result).toEqual(mockItemSku);
    });

    it('should handle creation errors', async () => {
      // Arrange
      const error = new Error('Database constraint violation');
      mockPrisma.client.itemSKU.create.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(mockItemSku)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should find item SKU by ID', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue(
        mockPersistenceData
      );

      // Act
      const result = await repository.findOne(1);

      // Assert
      expect(mockPrisma.client.itemSKU.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockItemSku);
    });

    it('should return null when SKU not found', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findOne(999);

      // Assert
      expect(mockPrisma.client.itemSKU.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockPrisma.client.itemSKU.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all item SKUs', async () => {
      // Arrange
      const mockPersistenceArray = [mockPersistenceData];
      mockPrisma.client.itemSKU.findMany.mockResolvedValue(
        mockPersistenceArray
      );

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockItemSku);
    });

    it('should return empty array when no SKUs exist', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database query failed');
      mockPrisma.client.itemSKU.findMany.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update item SKU', async () => {
      // Arrange
      const updatedData = { ...mockPersistenceData, skuCode: 'UPDATED001' };
      mockPrisma.client.itemSKU.update.mockResolvedValue(updatedData);

      // Act
      const result = await repository.update(1, mockItemSku);

      // Assert
      expect(mockPrisma.client.itemSKU.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockItemSku.toPersistence(),
      });
      expect(result).toEqual(mockItemSku);
    });

    it('should handle update errors', async () => {
      // Arrange
      const error = new Error('Update constraint violation');
      mockPrisma.client.itemSKU.update.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.update(1, mockItemSku)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete item SKU', async () => {
      // Arrange
      mockPrisma.client.itemSKU.delete.mockResolvedValue(mockPersistenceData);

      // Act
      const result = await repository.remove(1);

      // Assert
      expect(mockPrisma.client.itemSKU.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockItemSku);
    });

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Foreign key constraint violation');
      mockPrisma.client.itemSKU.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.remove(1)).rejects.toThrow(error);
    });
  });

  describe('findBySkuCode', () => {
    it('should find SKU by SKU code', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue(
        mockPersistenceData
      );

      // Act
      const result = await repository.findBySkuCode('TEST001');

      // Assert
      expect(mockPrisma.client.itemSKU.findUnique).toHaveBeenCalledWith({
        where: { skuCode: 'TEST001' },
      });
      expect(result).toEqual(mockItemSku);
    });

    it('should return null when SKU code not found', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findBySkuCode('NOTFOUND');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database query failed');
      mockPrisma.client.itemSKU.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findBySkuCode('TEST001')).rejects.toThrow(error);
    });
  });

  describe('findByItemId', () => {
    it('should find SKUs by item ID', async () => {
      // Arrange
      const mockPersistenceArray = [mockPersistenceData];
      mockPrisma.client.itemSKU.findMany.mockResolvedValue(
        mockPersistenceArray
      );

      // Act
      const result = await repository.findByItemId(10);

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: { itemId: 10 },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockItemSku);
    });

    it('should return empty array when no SKUs for item', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findByItemId(999);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByModelId', () => {
    it('should find SKUs by model ID', async () => {
      // Arrange
      const mockPersistenceArray = [mockPersistenceData];
      mockPrisma.client.itemSKU.findMany.mockResolvedValue(
        mockPersistenceArray
      );

      // Act
      const result = await repository.findByModelId(20);

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: { modelId: 20 },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockItemSku);
    });

    it('should return empty array when no SKUs for model', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findByModelId(999);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('count', () => {
    it('should count all SKUs', async () => {
      // Arrange
      mockPrisma.client.itemSKU.count.mockResolvedValue(10);

      // Act
      const result = await repository.count({});

      // Assert
      expect(mockPrisma.client.itemSKU.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toBe(10);
    });

    it('should count SKUs with filters', async () => {
      // Arrange
      mockPrisma.client.itemSKU.count.mockResolvedValue(5);

      // Act
      const result = await repository.count({ status: 'active' });

      // Assert
      expect(mockPrisma.client.itemSKU.count).toHaveBeenCalledWith({
        where: { status: 'active' },
      });
      expect(result).toBe(5);
    });

    it('should handle count errors', async () => {
      // Arrange
      const error = new Error('Count query failed');
      mockPrisma.client.itemSKU.count.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.count({})).rejects.toThrow(error);
    });
  });

  describe('complex queries', () => {
    it('should handle queries with relations', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([
        mockPersistenceData,
      ]);

      // Act
      const result = await repository.findAll({
        include: {
          color: true,
          gender: true,
          size: true,
        },
      });

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          color: true,
          gender: true,
          size: true,
        },
      });
      expect(result).toHaveLength(1);
    });

    it('should handle queries with ordering', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([
        mockPersistenceData,
      ]);

      // Act
      const result = await repository.findAll({
        orderBy: [{ skuCode: 'desc' }],
      });

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ skuCode: 'desc' }],
      });
      expect(result).toHaveLength(1);
    });

    it('should handle queries with pagination', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([
        mockPersistenceData,
      ]);

      // Act
      const result = await repository.findAll({
        skip: 10,
        take: 5,
      });

      // Assert
      expect(mockPrisma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 5,
      });
      expect(result).toHaveLength(1);
    });

    it('should handle complex queries with multiple options', async () => {
      // Arrange
      mockPrisma.client.itemSKU.findMany.mockResolvedValue([
        mockPersistenceData,
      ]);

      // Act
      const result = await repository.findAll({
        where: { status: 'active' },
        include: { color: true },
        orderBy: [{ skuCode: 'asc' }],
        skip: 0,
        take: 10,
      });

      // Assert
      expect(mockPrasma.client.itemSKU.findMany).toHaveBeenCalledWith({
        where: { status: 'active' },
        include: { color: true },
        orderBy: [{ skuCode: 'asc' }],
        skip: 0,
        take: 10,
      });
      expect(result).toHaveLength(1);
    });
  });
});
