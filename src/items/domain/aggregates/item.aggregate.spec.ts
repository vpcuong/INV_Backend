import { Item, CreateModelData, CreateSkuData, CreateUomData } from './item.aggregate';
import {
  InvalidItemException,
  DuplicateItemModelCodeException,
  ItemModelNotFoundException,
  DuplicateSkuCodeException,
  ItemSkuNotFoundException,
  DuplicateItemUOMException,
  ItemUOMNotFoundException,
} from '../exceptions/item-domain.exception';
import { ItemModelAddedEvent } from '../events/item-model-added.event';
import { ItemSkuAddedEvent } from '../events/item-sku-added.event';
import { ItemUomAddedEvent } from '../events/item-uom-changed.event';

describe('Item Aggregate', () => {
  const createValidItem = (overrides = {}): Item => {
    return new Item({
      id: 1,
      code: 'ITEM001',
      categoryId: 1,
      itemTypeId: 1,
      status: 'active',
      ...overrides,
    });
  };

  describe('constructor', () => {
    it('should create item with valid data', () => {
      const item = createValidItem();

      expect(item.getId()).toBe(1);
      expect(item.getCode()).toBe('ITEM001');
      expect(item.getCategoryId()).toBe(1);
      expect(item.getItemTypeId()).toBe(1);
      expect(item.getStatus()).toBe('active');
    });

    it('should throw if code is empty', () => {
      expect(() => createValidItem({ code: '' })).toThrow(InvalidItemException);
    });

    it('should throw if categoryId is missing', () => {
      expect(() => createValidItem({ categoryId: undefined })).toThrow(
        InvalidItemException,
      );
    });

    it('should throw if itemTypeId is missing', () => {
      expect(() => createValidItem({ itemTypeId: undefined })).toThrow(
        InvalidItemException,
      );
    });

    it('should default status to active', () => {
      const item = new Item({
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
      });

      expect(item.getStatus()).toBe('active');
    });
  });

  describe('status management', () => {
    it('should activate item', () => {
      const item = createValidItem({ status: 'inactive' });

      item.activate();

      expect(item.getStatus()).toBe('active');
    });

    it('should deactivate item', () => {
      const item = createValidItem({ status: 'active' });

      item.deactivate();

      expect(item.getStatus()).toBe('inactive');
    });

    it('should set item to draft', () => {
      const item = createValidItem({ status: 'active' });

      item.setDraft();

      expect(item.getStatus()).toBe('draft');
    });
  });

  describe('addModel', () => {
    it('should add model to item', () => {
      const item = createValidItem();
      const modelData: CreateModelData = {
        code: 'MODEL001',
        desc: 'Test Model',
      };

      const model = item.addModel(modelData);

      expect(model.getCode()).toBe('MODEL001');
      expect(item.getModels()).toHaveLength(1);
    });

    it('should emit ItemModelAddedEvent', () => {
      const item = createValidItem();

      item.addModel({ code: 'MODEL001' });
      const events = item.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemModelAddedEvent);
      expect((events[0] as ItemModelAddedEvent).modelCode).toBe('MODEL001');
    });

    it('should throw if model code already exists', () => {
      const item = createValidItem();
      item.addModel({ code: 'MODEL001' });

      expect(() => item.addModel({ code: 'MODEL001' })).toThrow(
        DuplicateItemModelCodeException,
      );
    });
  });

  describe('updateModel', () => {
    it('should update existing model', () => {
      const item = createValidItem();
      const model = item.addModel({ code: 'MODEL001' });
      const modelId = model.getId() || 1;

      // Simulate that model has ID after persistence
      const itemWithModel = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        models: [{ id: 1, itemId: 1, code: 'MODEL001', status: 'active' }],
      });

      itemWithModel.updateModel(1, { desc: 'Updated description' });
      const updatedModel = itemWithModel.findModel(1);

      expect(updatedModel?.getDesc()).toBe('Updated description');
    });

    it('should throw if model not found', () => {
      const item = createValidItem();

      expect(() => item.updateModel(999, { desc: 'Test' })).toThrow(
        ItemModelNotFoundException,
      );
    });
  });

  describe('removeModel', () => {
    it('should remove model from item', () => {
      const itemWithModel = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        models: [{ id: 1, itemId: 1, code: 'MODEL001', status: 'active' }],
      });

      itemWithModel.removeModel(1);

      expect(itemWithModel.getModels()).toHaveLength(0);
    });

    it('should throw if model has SKUs', () => {
      const itemWithModelAndSku = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        models: [{ id: 1, itemId: 1, code: 'MODEL001', status: 'active' }],
        skus: [
          {
            id: 1,
            skuCode: 'SKU001',
            itemId: 1,
            modelId: 1,
            colorId: 1,
            status: 'active',
          },
        ],
      });

      expect(() => itemWithModelAndSku.removeModel(1)).toThrow(
        InvalidItemException,
      );
    });

    it('should throw if model not found', () => {
      const item = createValidItem();

      expect(() => item.removeModel(999)).toThrow(ItemModelNotFoundException);
    });
  });

  describe('addSku', () => {
    it('should add SKU to item without model', () => {
      const item = createValidItem();
      const skuData: CreateSkuData = {
        skuCode: 'SKU001',
        colorId: 1,
      };

      const sku = item.addSku(null, skuData);

      expect(sku.getSkuCode()).toBe('SKU001');
      expect(sku.getModelId()).toBeNull();
      expect(item.getSkus()).toHaveLength(1);
    });

    it('should add SKU to specific model', () => {
      const itemWithModel = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        models: [{ id: 1, itemId: 1, code: 'MODEL001', status: 'active' }],
      });

      const sku = itemWithModel.addSku(1, { skuCode: 'SKU001', colorId: 1 });

      expect(sku.getModelId()).toBe(1);
    });

    it('should emit ItemSkuAddedEvent', () => {
      const item = createValidItem();

      item.addSku(null, { skuCode: 'SKU001', colorId: 1 });
      const events = item.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemSkuAddedEvent);
    });

    it('should throw if SKU code already exists', () => {
      const item = createValidItem();
      item.addSku(null, { skuCode: 'SKU001', colorId: 1 });

      expect(() => item.addSku(null, { skuCode: 'SKU001', colorId: 1 })).toThrow(
        DuplicateSkuCodeException,
      );
    });

    it('should throw if model not found', () => {
      const item = createValidItem();

      expect(() => item.addSku(999, { skuCode: 'SKU001', colorId: 1 })).toThrow(
        ItemModelNotFoundException,
      );
    });
  });

  describe('updateSku', () => {
    it('should update existing SKU', () => {
      const itemWithSku = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        skus: [
          {
            id: 1,
            skuCode: 'SKU001',
            itemId: 1,
            colorId: 1,
            status: 'active',
          },
        ],
      });

      itemWithSku.updateSku(1, { desc: 'Updated SKU' });
      const sku = itemWithSku.findSku(1);

      expect(sku?.getDesc()).toBe('Updated SKU');
    });

    it('should throw if SKU not found', () => {
      const item = createValidItem();

      expect(() => item.updateSku(999, { desc: 'Test' })).toThrow(
        ItemSkuNotFoundException,
      );
    });
  });

  describe('removeSku', () => {
    it('should remove SKU from item', () => {
      const itemWithSku = Item.fromPersistence({
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        skus: [
          {
            id: 1,
            skuCode: 'SKU001',
            itemId: 1,
            colorId: 1,
            status: 'active',
          },
        ],
      });

      itemWithSku.removeSku(1);

      expect(itemWithSku.getSkus()).toHaveLength(0);
    });

    it('should throw if SKU not found', () => {
      const item = createValidItem();

      expect(() => item.removeSku(999)).toThrow(ItemSkuNotFoundException);
    });
  });

  describe('addUOM', () => {
    it('should add UOM to item', () => {
      const item = createValidItem({ uomCode: 'PCS' });
      const uomData: CreateUomData = {
        uomCode: 'BOX',
        toBaseFactor: 12,
      };

      const uom = item.addUOM(uomData);

      expect(uom.getUomCode()).toBe('BOX');
      expect(uom.getToBaseFactor()).toBe(12);
      expect(item.getItemUOMs()).toHaveLength(1);
    });

    it('should emit ItemUomAddedEvent', () => {
      const item = createValidItem({ uomCode: 'PCS' });

      item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 });
      const events = item.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemUomAddedEvent);
    });

    it('should throw if adding base UOM', () => {
      const item = createValidItem({ uomCode: 'PCS' });

      expect(() => item.addUOM({ uomCode: 'PCS', toBaseFactor: 1 })).toThrow(
        InvalidItemException,
      );
    });

    it('should throw if UOM already exists', () => {
      const item = createValidItem({ uomCode: 'PCS' });
      item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 });

      expect(() => item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 })).toThrow(
        DuplicateItemUOMException,
      );
    });
  });

  describe('removeUOM', () => {
    it('should remove UOM from item', () => {
      const item = createValidItem({ uomCode: 'PCS' });
      item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 });

      item.removeUOM('BOX');

      expect(item.getItemUOMs()).toHaveLength(0);
    });

    it('should throw if UOM not found', () => {
      const item = createValidItem();

      expect(() => item.removeUOM('NOTEXIST')).toThrow(ItemUOMNotFoundException);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true if no children', () => {
      const item = createValidItem();

      expect(item.canBeDeleted()).toBe(true);
    });

    it('should return false if has models', () => {
      const item = createValidItem();
      item.addModel({ code: 'MODEL001' });

      expect(item.canBeDeleted()).toBe(false);
    });

    it('should return false if has skus', () => {
      const item = createValidItem();
      item.addSku(null, { skuCode: 'SKU001', colorId: 1 });

      expect(item.canBeDeleted()).toBe(false);
    });

    it('should return false if has UOMs', () => {
      const item = createValidItem({ uomCode: 'PCS' });
      item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 });

      expect(item.canBeDeleted()).toBe(false);
    });
  });

  describe('domain events', () => {
    it('should collect multiple events', () => {
      const item = createValidItem({ uomCode: 'PCS' });

      item.addModel({ code: 'MODEL001' });
      item.addSku(null, { skuCode: 'SKU001', colorId: 1 });
      item.addUOM({ uomCode: 'BOX', toBaseFactor: 12 });

      expect(item.getDomainEvents()).toHaveLength(3);
    });

    it('should clear events', () => {
      const item = createValidItem();
      item.addModel({ code: 'MODEL001' });

      item.clearDomainEvents();

      expect(item.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('should convert to persistence model', () => {
      const item = createValidItem({
        desc: 'Test item',
        purchasingPrice: 100,
      });

      const persistence = item.toPersistence();

      expect(persistence.code).toBe('ITEM001');
      expect(persistence.desc).toBe('Test item');
      expect(persistence.purchasingPrice).toBe(100);
    });

    it('should restore from persistence model', () => {
      const data = {
        id: 1,
        code: 'ITEM001',
        categoryId: 1,
        itemTypeId: 1,
        status: 'active',
        models: [{ id: 1, itemId: 1, code: 'MODEL001', status: 'active' }],
        skus: [
          {
            id: 1,
            skuCode: 'SKU001',
            itemId: 1,
            colorId: 1,
            status: 'active',
          },
        ],
        itemUoms: [
          {
            itemId: 1,
            uomCode: 'BOX',
            toBaseFactor: 12,
          },
        ],
      };

      const item = Item.fromPersistence(data);

      expect(item.getCode()).toBe('ITEM001');
      expect(item.getModels()).toHaveLength(1);
      expect(item.getSkus()).toHaveLength(1);
      expect(item.getItemUOMs()).toHaveLength(1);
    });
  });
});
