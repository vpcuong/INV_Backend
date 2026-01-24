import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemAggregateService } from './application/item-aggregate.service';
import { ItemQueryService } from './application/item-query.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let aggregateService: jest.Mocked<ItemAggregateService>;
  let queryService: jest.Mocked<ItemQueryService>;

  beforeEach(async () => {
    const aggregateServiceMock: Partial<jest.Mocked<ItemAggregateService>> = {
      createItem: jest.fn(),
      getItemById: jest.fn(),
      getItemComplete: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      activateItem: jest.fn(),
      deactivateItem: jest.fn(),
      setItemDraft: jest.fn(),
      addModelToItem: jest.fn(),
      updateModel: jest.fn(),
      removeModel: jest.fn(),
      activateModel: jest.fn(),
      deactivateModel: jest.fn(),
      addSkuToItem: jest.fn(),
      updateSku: jest.fn(),
      removeSku: jest.fn(),
      activateSku: jest.fn(),
      deactivateSku: jest.fn(),
      addUomToItem: jest.fn(),
      removeUom: jest.fn(),
    };

    const queryServiceMock: Partial<jest.Mocked<ItemQueryService>> = {
      findAllWithFilters: jest.fn(),
      findModelsByItemId: jest.fn(),
      findModelById: jest.fn(),
      findSkusByItemId: jest.fn(),
      findSkusByModelId: jest.fn(),
      findSkuById: jest.fn(),
      findUomsByItemId: jest.fn(),
      findUomByItemAndCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        { provide: ItemAggregateService, useValue: aggregateServiceMock },
        { provide: ItemQueryService, useValue: queryServiceMock },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    aggregateService = module.get(ItemAggregateService);
    queryService = module.get(ItemQueryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate findAllItems to ItemQueryService.findAllWithFilters', async () => {
    const filterDto: any = { page: 2, limit: 5, search: 'shirt' };
    const expected = { data: [], pagination: { page: 2, limit: 5 } } as any;
    queryService.findAllWithFilters.mockResolvedValue(expected);

    const result = await controller.findAllItems(filterDto);

    expect(queryService.findAllWithFilters).toHaveBeenCalledWith(filterDto);
    expect(result).toBe(expected);
  });

  it('should delegate findItemById to ItemAggregateService.getItemById', async () => {
    const id = 123;
    const expected = { id, name: 'Item 123' } as any;
    aggregateService.getItemById.mockResolvedValue(expected);

    const result = await controller.findItemById(id);

    expect(aggregateService.getItemById).toHaveBeenCalledWith(123);
    expect(result).toBe(expected);
  });

  it('should delegate findItemComplete to ItemAggregateService.getItemComplete', async () => {
    const id = 7;
    const expected = { id, models: [], skus: [], uoms: [] } as any;
    aggregateService.getItemComplete.mockResolvedValue(expected);

    const result = await controller.findItemComplete(id);

    expect(aggregateService.getItemComplete).toHaveBeenCalledWith(7);
    expect(result).toBe(expected);
  });

  it('should delegate addSkuToItem (no model) to ItemAggregateService.addSkuToItem with null modelId', async () => {
    const itemId = 10;
    const dto: any = { colorId: 1, sizeId: 2 };
    const expected = { id: 55, ...dto } as any;
    aggregateService.addSkuToItem.mockResolvedValue(expected);

    const result = await controller.addSkuToItem(itemId, dto);

    expect(aggregateService.addSkuToItem).toHaveBeenCalledWith(10, null, dto);
    expect(result).toBe(expected);
  });

  it('should delegate addSkuToModel to ItemAggregateService.addSkuToItem with modelId', async () => {
    const itemId = 10;
    const modelId = 20;
    const dto: any = { colorId: 1, sizeId: 2 };
    const expected = { id: 66, ...dto } as any;
    aggregateService.addSkuToItem.mockResolvedValue(expected);

    const result = await controller.addSkuToModel(itemId, modelId, dto);

    expect(aggregateService.addSkuToItem).toHaveBeenCalledWith(10, 20, dto);
    expect(result).toBe(expected);
  });

  it('should delegate updateModel to ItemAggregateService.updateModel', async () => {
    const itemId = 1;
    const modelId = 2;
    const dto: any = { name: 'Updated model' };
    const expected = { id: modelId, ...dto } as any;
    aggregateService.updateModel.mockResolvedValue(expected);

    const result = await controller.updateModel(itemId, modelId, dto);

    expect(aggregateService.updateModel).toHaveBeenCalledWith(1, 2, dto);
    expect(result).toBe(expected);
  });

  it('should delegate getSkusByModel to ItemQueryService.findSkusByModelId', async () => {
    const itemId = 3;
    const modelId = 4;
    const filter: any = { page: 1, limit: 50 };
    const expected = { data: [] } as any;
    queryService.findSkusByModelId.mockResolvedValue(expected);

    const result = await controller.getSkusByModel(itemId, modelId, filter);

    expect(queryService.findSkusByModelId).toHaveBeenCalledWith(4, filter);
    expect(result).toBe(expected);
  });

  it('should delegate activateItem to ItemAggregateService.activateItem', async () => {
    const id = 99;
    const expected = { id, status: 'active' } as any;
    aggregateService.activateItem.mockResolvedValue(expected);

    const result = await controller.activateItem(id);

    expect(aggregateService.activateItem).toHaveBeenCalledWith(99);
    expect(result).toBe(expected);
  });

  it('should delegate getUom to ItemQueryService.findUomByItemAndCode', async () => {
    const itemId = 8;
    const code = 'BOX';
    const expected = { code } as any;
    queryService.findUomByItemAndCode.mockResolvedValue(expected);

    const result = await controller.getUom(itemId, code);

    expect(queryService.findUomByItemAndCode).toHaveBeenCalledWith(8, 'BOX');
    expect(result).toBe(expected);
  });

  it('should delegate removeUom to ItemAggregateService.removeUom', async () => {
    const itemId = 8;
    const code = 'CTN';
    const expected = { success: true } as any;
    aggregateService.removeUom.mockResolvedValue(expected);

    const result = await controller.removeUom(itemId, code);

    expect(aggregateService.removeUom).toHaveBeenCalledWith(8, 'CTN');
    expect(result).toBe(expected);
  });
});
