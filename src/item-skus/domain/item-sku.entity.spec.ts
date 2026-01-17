import { ItemSku, ItemSkuConstructorData } from './item-sku.entity';
import {
  InvalidPriceException,
  InvalidDimensionException,
  InvalidItemSkuException,
} from './exceptions/item-sku-domain.exception';

// Mock the DomainException import to avoid circular dependency
jest.mock('@/common/exception-filters/domain-exception.filter', () => ({
  DomainException: Error,
}));

describe('ItemSku Entity', () => {
  describe('constructor', () => {
    it('should create entity with valid data', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
      };

      // Act
      const itemSku = new ItemSku(data);

      // Assert
      expect(itemSku).toBeDefined();
      expect(itemSku.getSkuCode()).toBe('TEST001');
      expect(itemSku.getColorId()).toBe(1);
      expect(itemSku.getStatus()).toBe('active');
    });

    it('should set default values for optional fields', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
      };

      // Act
      const itemSku = new ItemSku(data);

      // Assert
      expect(itemSku.getCostPrice()).toBe(0);
      expect(itemSku.getSellingPrice()).toBe(0);
      expect(itemSku.getDesc()).toBe(null);
      expect(itemSku.getPattern()).toBe(null);
      expect(itemSku.getCreatedAt()).toBeInstanceOf(Date);
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw InvalidItemSkuException when skuCode is empty', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: '',
        colorId: 1,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidItemSkuException);
      expect(() => new ItemSku(data)).toThrow('SKU code is required');
    });

    it('should throw InvalidItemSkuException when colorId is not provided', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: undefined,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidItemSkuException);
      expect(() => new ItemSku(data)).toThrow('Color is required');
    });

    it('should throw InvalidPriceException when costPrice is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        costPrice: -10,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidPriceException);
      expect(() => new ItemSku(data)).toThrow('Cost price cannot be negative');
    });

    it('should throw InvalidPriceException when sellingPrice is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        sellingPrice: -5,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidPriceException);
      expect(() => new ItemSku(data)).toThrow(
        'Selling price cannot be negative'
      );
    });

    it('should throw InvalidDimensionException when lengthCm is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        lengthCm: -10,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidDimensionException);
      expect(() => new ItemSku(data)).toThrow('Length cannot be negative');
    });

    it('should throw InvalidDimensionException when widthCm is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        widthCm: -5,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidDimensionException);
      expect(() => new ItemSku(data)).toThrow('Width cannot be negative');
    });

    it('should throw InvalidDimensionException when heightCm is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        heightCm: -2,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidDimensionException);
      expect(() => new ItemSku(data)).toThrow('Height cannot be negative');
    });

    it('should throw InvalidDimensionException when weightG is negative', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
        weightG: -100,
      };

      // Act & Assert
      expect(() => new ItemSku(data)).toThrow(InvalidDimensionException);
      expect(() => new ItemSku(data)).toThrow('Weight cannot be negative');
    });
  });

  describe('updatePrices', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        costPrice: 10,
        sellingPrice: 20,
      });
    });

    it('should update both costPrice and sellingPrice', () => {
      // Act
      itemSku.updatePrices(15, 30);

      // Assert
      expect(itemSku.getCostPrice()).toBe(15);
      expect(itemSku.getSellingPrice()).toBe(30);
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update only costPrice when sellingPrice is undefined', () => {
      // Act
      itemSku.updatePrices(25, undefined);

      // Assert
      expect(itemSku.getCostPrice()).toBe(25);
      expect(itemSku.getSellingPrice()).toBe(20); // unchanged
    });

    it('should update only sellingPrice when costPrice is undefined', () => {
      // Act
      itemSku.updatePrices(undefined, 35);

      // Assert
      expect(itemSku.getCostPrice()).toBe(10); // unchanged
      expect(itemSku.getSellingPrice()).toBe(35);
    });

    it('should accept zero values for prices', () => {
      // Act
      itemSku.updatePrices(0, 0);

      // Assert
      expect(itemSku.getCostPrice()).toBe(0);
      expect(itemSku.getSellingPrice()).toBe(0);
    });

    it('should throw InvalidPriceException when costPrice is negative', () => {
      // Act & Assert
      expect(() => itemSku.updatePrices(-5, 30)).toThrow(InvalidPriceException);
      expect(() => itemSku.updatePrices(-5, 30)).toThrow(
        'Cost price cannot be negative'
      );
    });

    it('should throw InvalidPriceException when sellingPrice is negative', () => {
      // Act & Assert
      expect(() => itemSku.updatePrices(15, -10)).toThrow(
        InvalidPriceException
      );
      expect(() => itemSku.updatePrices(15, -10)).toThrow(
        'Selling price cannot be negative'
      );
    });

    it('should log warning when selling price is less than cost price', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      itemSku.updatePrices(50, 30);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Warning: Selling price (30) is less than cost price (50)'
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateDimensions', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        lengthCm: 10,
        widthCm: 5,
        heightCm: 2,
        weightG: 100,
      });
    });

    it('should update all dimensions', () => {
      // Act
      itemSku.updateDimensions({
        lengthCm: 20,
        widthCm: 10,
        heightCm: 4,
        weightG: 200,
      });

      // Assert
      expect(itemSku.getLengthCm()).toBe(20);
      expect(itemSku.getWidthCm()).toBe(10);
      expect(itemSku.getHeightCm()).toBe(4);
      expect(itemSku.getWeightG()).toBe(200);
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update only provided dimensions', () => {
      // Act
      itemSku.updateDimensions({
        lengthCm: 30,
        // widthCm unchanged
        heightCm: 8,
        // weightG unchanged
      });

      // Assert
      expect(itemSku.getLengthCm()).toBe(30);
      expect(itemSku.getWidthCm()).toBe(5); // unchanged
      expect(itemSku.getHeightCm()).toBe(8);
      expect(itemSku.getWeightG()).toBe(100); // unchanged
    });

    it('should accept null values for dimensions', () => {
      // Act
      itemSku.updateDimensions({
        lengthCm: null,
        widthCm: null,
        heightCm: null,
        weightG: null,
      });

      // Assert
      expect(itemSku.getLengthCm()).toBeNull();
      expect(itemSku.getWidthCm()).toBeNull();
      expect(itemSku.getHeightCm()).toBeNull();
      expect(itemSku.getWeightG()).toBeNull();
    });

    it('should throw InvalidDimensionException when lengthCm is negative', () => {
      // Act & Assert
      expect(() => itemSku.updateDimensions({ lengthCm: -5 })).toThrow(
        InvalidDimensionException
      );
      expect(() => itemSku.updateDimensions({ lengthCm: -5 })).toThrow(
        'Length cannot be negative'
      );
    });

    it('should throw InvalidDimensionException when widthCm is negative', () => {
      // Act & Assert
      expect(() => itemSku.updateDimensions({ widthCm: -3 })).toThrow(
        InvalidDimensionException
      );
      expect(() => itemSku.updateDimensions({ widthCm: -3 })).toThrow(
        'Width cannot be negative'
      );
    });

    it('should throw InvalidDimensionException when heightCm is negative', () => {
      // Act & Assert
      expect(() => itemSku.updateDimensions({ heightCm: -1 })).toThrow(
        InvalidDimensionException
      );
      expect(() => itemSku.updateDimensions({ heightCm: -1 })).toThrow(
        'Height cannot be negative'
      );
    });

    it('should throw InvalidDimensionException when weightG is negative', () => {
      // Act & Assert
      expect(() => itemSku.updateDimensions({ weightG: -50 })).toThrow(
        InvalidDimensionException
      );
      expect(() => itemSku.updateDimensions({ weightG: -50 })).toThrow(
        'Weight cannot be negative'
      );
    });
  });

  describe('activate and deactivate', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        status: 'inactive',
      });
    });

    it('should activate SKU', () => {
      // Act
      itemSku.activate();

      // Assert
      expect(itemSku.getStatus()).toBe('active');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should deactivate SKU', () => {
      // Arrange
      itemSku.activate(); // make it active first

      // Act
      itemSku.deactivate();

      // Assert
      expect(itemSku.getStatus()).toBe('inactive');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('updateDetails', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        desc: 'Original description',
        pattern: 'Original pattern',
      });
    });

    it('should update both description and pattern', () => {
      // Act
      itemSku.updateDetails('New description', 'New pattern');

      // Assert
      expect(itemSku.getDesc()).toBe('New description');
      expect(itemSku.getPattern()).toBe('New pattern');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update only description when pattern is undefined', () => {
      // Act
      itemSku.updateDetails('Updated description', undefined);

      // Assert
      expect(itemSku.getDesc()).toBe('Updated description');
      expect(itemSku.getPattern()).toBe('Original pattern'); // unchanged
    });

    it('should update only pattern when description is undefined', () => {
      // Act
      itemSku.updateDetails(undefined, 'Updated pattern');

      // Assert
      expect(itemSku.getDesc()).toBe('Original description'); // unchanged
      expect(itemSku.getPattern()).toBe('Updated pattern');
    });

    it('should accept null values', () => {
      // Act
      itemSku.updateDetails(null, null);

      // Assert
      expect(itemSku.getDesc()).toBeNull();
      expect(itemSku.getPattern()).toBeNull();
    });
  });

  describe('updateRelations', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        supplierId: 1,
        customerId: 1,
        fabricSKUId: 1,
      });
    });

    it('should update all relation IDs', () => {
      // Act
      itemSku.updateRelations(2, 3, 4);

      // Assert
      expect(itemSku.getSupplierId()).toBe(2);
      expect(itemSku.getCustomerId()).toBe(3);
      expect(itemSku.getFabricSKUId()).toBe(4);
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update only provided relation IDs', () => {
      // Act
      itemSku.updateRelations(5, undefined, 7);

      // Assert
      expect(itemSku.getSupplierId()).toBe(5);
      expect(itemSku.getCustomerId()).toBe(1); // unchanged
      expect(itemSku.getFabricSKUId()).toBe(7);
    });

    it('should accept null values for relation IDs', () => {
      // Act
      itemSku.updateRelations(null, null, null);

      // Assert
      expect(itemSku.getSupplierId()).toBeNull();
      expect(itemSku.getCustomerId()).toBeNull();
      expect(itemSku.getFabricSKUId()).toBeNull();
    });
  });

  describe('updateClassification', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        genderId: 1,
        sizeId: 1,
      });
    });

    it('should update both genderId and sizeId', () => {
      // Act
      itemSku.updateClassification(2, 3);

      // Assert
      expect(itemSku.getGenderId()).toBe(2);
      expect(itemSku.getSizeId()).toBe(3);
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update only genderId when sizeId is undefined', () => {
      // Act
      itemSku.updateClassification(4, undefined);

      // Assert
      expect(itemSku.getGenderId()).toBe(4);
      expect(itemSku.getSizeId()).toBe(1); // unchanged
    });

    it('should update only sizeId when genderId is undefined', () => {
      // Act
      itemSku.updateClassification(undefined, 5);

      // Assert
      expect(itemSku.getGenderId()).toBe(1); // unchanged
      expect(itemSku.getSizeId()).toBe(5);
    });

    it('should accept null values for classification', () => {
      // Act
      itemSku.updateClassification(null, null);

      // Assert
      expect(itemSku.getGenderId()).toBeNull();
      expect(itemSku.getSizeId()).toBeNull();
    });
  });

  describe('updateUom', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        uomCode: 'PCS',
      });
    });

    it('should update UOM code', () => {
      // Act
      itemSku.updateUom('KG');

      // Assert
      expect(itemSku.getUomCode()).toBe('KG');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should accept null value for UOM code', () => {
      // Act
      itemSku.updateUom(null);

      // Assert
      expect(itemSku.getUomCode()).toBeNull();
    });

    it('should accept empty string for UOM code', () => {
      // Act
      itemSku.updateUom('');

      // Assert
      expect(itemSku.getUomCode()).toBe('');
    });
  });

  describe('updateStatus', () => {
    let itemSku: ItemSku;

    beforeEach(() => {
      itemSku = new ItemSku({
        skuCode: 'TEST001',
        colorId: 1,
        status: 'active',
      });
    });

    it('should update status to active', () => {
      // Act
      itemSku.updateStatus('active');

      // Assert
      expect(itemSku.getStatus()).toBe('active');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should update status to inactive', () => {
      // Act
      itemSku.updateStatus('inactive');

      // Assert
      expect(itemSku.getStatus()).toBe('inactive');
      expect(itemSku.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw InvalidItemSkuException for invalid status', () => {
      // Act & Assert
      expect(() => itemSku.updateStatus('pending')).toThrow(
        InvalidItemSkuException
      );
      expect(() => itemSku.updateStatus('pending')).toThrow(
        'Invalid status: pending'
      );
      expect(() => itemSku.updateStatus('')).toThrow(InvalidItemSkuException);
      expect(() => itemSku.updateStatus('INVALID')).toThrow(
        InvalidItemSkuException
      );
    });
  });

  describe('toPersistence', () => {
    it('should convert entity to persistence object', () => {
      // Arrange
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const data: ItemSkuConstructorData = {
        id: 1,
        skuCode: 'TEST001',
        colorId: 1,
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
        desc: 'Test SKU',
        status: 'active',
        costPrice: 15.5,
        sellingPrice: 25.99,
        uomCode: 'PCS',
        createdAt,
        updatedAt,
      };

      const itemSku = new ItemSku(data);

      // Act
      const persistence = itemSku.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: 1,
        skuCode: 'TEST001',
        colorId: 1,
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
        desc: 'Test SKU',
        status: 'active',
        costPrice: 15.5,
        sellingPrice: 25.99,
        uomCode: 'PCS',
        createdAt,
        updatedAt,
      });
    });

    it('should handle undefined values correctly', () => {
      // Arrange
      const data: ItemSkuConstructorData = {
        skuCode: 'TEST001',
        colorId: 1,
      };

      const itemSku = new ItemSku(data);

      // Act
      const persistence = itemSku.toPersistence();

      // Assert
      expect(persistence.id).toBeUndefined();
      expect(persistence.itemId).toBeUndefined();
      expect(persistence.modelId).toBeUndefined();
      expect(persistence.genderId).toBeUndefined();
      expect(persistence.sizeId).toBeUndefined();
      expect(persistence.supplierId).toBeUndefined();
      expect(persistence.customerId).toBeUndefined();
      expect(persistence.fabricSKUId).toBeUndefined();
      expect(persistence.pattern).toBeNull();
      expect(persistence.lengthCm).toBeNull();
      expect(persistence.widthCm).toBeNull();
      expect(persistence.heightCm).toBeNull();
      expect(persistence.weightG).toBeNull();
      expect(persistence.desc).toBeNull();
      expect(persistence.uomCode).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('should create entity from persistence data', () => {
      // Arrange
      const persistenceData = {
        id: 1,
        skuCode: 'TEST001',
        itemId: 10,
        modelId: 20,
        colorId: 1,
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
        desc: 'Test SKU',
        status: 'active',
        costPrice: 15.5,
        sellingPrice: 25.99,
        uomCode: 'PCS',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      // Act
      const itemSku = ItemSku.fromPersistence(persistenceData);

      // Assert
      expect(itemSku).toBeDefined();
      expect(itemSku.getId()).toBe(1);
      expect(itemSku.getSkuCode()).toBe('TEST001');
      expect(itemSku.getItemId()).toBe(10);
      expect(itemSku.getModelId()).toBe(20);
      expect(itemSku.getColorId()).toBe(1);
      expect(itemSku.getGenderId()).toBe(2);
      expect(itemSku.getSizeId()).toBe(3);
      expect(itemSku.getSupplierId()).toBe(4);
      expect(itemSku.getCustomerId()).toBe(5);
      expect(itemSku.getFabricSKUId()).toBe(6);
      expect(itemSku.getPattern()).toBe('striped');
      expect(itemSku.getLengthCm()).toBe(10.5);
      expect(itemSku.getWidthCm()).toBe(5.5);
      expect(itemSku.getHeightCm()).toBe(2.0);
      expect(itemSku.getWeightG()).toBe(100.0);
      expect(itemSku.getDesc()).toBe('Test SKU');
      expect(itemSku.getStatus()).toBe('active');
      expect(itemSku.getCostPrice()).toBe(15.5);
      expect(itemSku.getSellingPrice()).toBe(25.99);
      expect(itemSku.getUomCode()).toBe('PCS');
    });

    it('should handle null values from persistence', () => {
      // Arrange
      const persistenceData = {
        id: 1,
        skuCode: 'TEST001',
        colorId: 1,
        pattern: null,
        lengthCm: null,
        widthCm: null,
        heightCm: null,
        weightG: null,
        desc: null,
        uomCode: null,
      };

      // Act
      const itemSku = ItemSku.fromPersistence(persistenceData);

      // Assert
      expect(itemSku.getPattern()).toBeNull();
      expect(itemSku.getLengthCm()).toBeNull();
      expect(itemSku.getWidthCm()).toBeNull();
      expect(itemSku.getHeightCm()).toBeNull();
      expect(itemSku.getWeightG()).toBeNull();
      expect(itemSku.getDesc()).toBeNull();
      expect(itemSku.getUomCode()).toBeNull();
    });
  });
});
