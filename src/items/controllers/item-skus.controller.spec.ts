import { Test, TestingModule } from '@nestjs/testing';
import { ItemSkusController } from './item-skus.controller';
import { ItemAggregateService } from '../application/item-aggregate.service';
import { ItemQueryService } from '../application/item-query.service';
import { NotFoundException } from '@nestjs/common';

describe('ItemSkusController', () => {
  let controller: ItemSkusController;
  let aggregateService: jest.Mocked<ItemAggregateService>;
  let queryService: jest.Mocked<ItemQueryService>;

  beforeEach(async () => {
    const aggregateServiceMock: Partial<jest.Mocked<ItemAggregateService>> = {
      addSkuToItemByPublicId: jest.fn(),
    };

    const queryServiceMock: Partial<jest.Mocked<ItemQueryService>> = {
      findSkusByItemPublicId: jest.fn(),
      findSkusByModelPublicId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemSkusController],
      providers: [
        { provide: ItemAggregateService, useValue: aggregateServiceMock },
        { provide: ItemQueryService, useValue: queryServiceMock },
      ],
    }).compile();

    controller = module.get<ItemSkusController>(ItemSkusController);
    aggregateService = module.get(ItemAggregateService);
    queryService = module.get(ItemQueryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 1) createForItem -> addSkuToItemByPublicId(itemPublicId, null, dto)
  it('should delegate createForItem to ItemAggregateService.addSkuToItemByPublicId with null modelPublicId', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const dto: any = { skuCode: 'SKU-001', colorId: 1 };
    const expected: any = { id: 1, ...dto };

    aggregateService.addSkuToItemByPublicId.mockResolvedValue(expected);

    const result = await controller.createForItem(itemPublicId, dto);

    expect(aggregateService.addSkuToItemByPublicId).toHaveBeenCalledWith(
      itemPublicId,
      null,
      dto,
    );
    expect(result).toBe(expected);
  });

  // 2) findAllByItem -> findSkusByItemPublicId(itemPublicId, filterDto)
  it('should delegate findAllByItem to ItemQueryService.findSkusByItemPublicId', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const filter: any = { page: 2, limit: 10, status: 'active' };
    const expected: any = { data: [], pagination: { page: 2, limit: 10 } };

    queryService.findSkusByItemPublicId.mockResolvedValue(expected);

    const result = await controller.findAllByItem(itemPublicId, filter);

    expect(queryService.findSkusByItemPublicId).toHaveBeenCalledWith(
      itemPublicId,
      filter,
    );
    expect(result).toBe(expected);
  });

  // 3) createForModel -> addSkuToItemByPublicId(itemPublicId, modelPublicId, dto)
  it('should delegate createForModel to ItemAggregateService.addSkuToItemByPublicId with modelPublicId', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const modelPublicId = '01M0DELWZCQKXG2S4J5E6M7N8P9';
    const dto: any = { skuCode: 'SKU-002', colorId: 2 };
    const expected: any = { id: 2, ...dto };

    aggregateService.addSkuToItemByPublicId.mockResolvedValue(expected);

    const result = await controller.createForModel(
      itemPublicId,
      modelPublicId,
      dto,
    );

    expect(aggregateService.addSkuToItemByPublicId).toHaveBeenCalledWith(
      itemPublicId,
      modelPublicId,
      dto,
    );
    expect(result).toBe(expected);
  });

  // 4) findAllByModel -> findSkusByModelPublicId(modelPublicId, filterDto)
  it('should delegate findAllByModel to ItemQueryService.findSkusByModelPublicId', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const modelPublicId = '01M0DELWZCQKXG2S4J5E6M7N8P9';
    const filter: any = { page: 1, limit: 50, search: 'blue' };
    const expected: any = { data: [{ id: 1 }], pagination: { page: 1, limit: 50 } };

    queryService.findSkusByModelPublicId.mockResolvedValue(expected);

    const result = await controller.findAllByModel(
      itemPublicId,
      modelPublicId,
      filter,
    );

    expect(queryService.findSkusByModelPublicId).toHaveBeenCalledWith(
      modelPublicId,
      filter,
    );
    expect(result).toBe(expected);
  });

  // 5) Should propagate exceptions from query service for findAllByItem
  it('should propagate NotFoundException from ItemQueryService.findSkusByItemPublicId', async () => {
    const itemPublicId = 'NON_EXIST';
    const filter: any = { page: 1, limit: 10 };
    const error = new NotFoundException('Item not found');

    queryService.findSkusByItemPublicId.mockRejectedValue(error);

    await expect(controller.findAllByItem(itemPublicId, filter)).rejects.toBe(
      error,
    );
  });

  // 6) Should pass DTO payload unchanged to aggregate service for createForItem
  it('should pass DTO unchanged to addSkuToItemByPublicId in createForItem', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const dto: any = {
      skuCode: 'SKU-003',
      colorId: 3,
      sizeId: 5,
      desc: 'Sample SKU',
    };
    const expected: any = { id: 3, ...dto };

    aggregateService.addSkuToItemByPublicId.mockResolvedValue(expected);

    const result = await controller.createForItem(itemPublicId, dto);

    expect(aggregateService.addSkuToItemByPublicId).toHaveBeenCalledWith(
      itemPublicId,
      null,
      dto,
    );
    expect(result).toBe(expected);
  });

  // 7) Should pass filter DTO to query method for findAllByModel
  it('should pass filter DTO to findSkusByModelPublicId in findAllByModel', async () => {
    const itemPublicId = '01HDY8WZCQKXG2S4J5E6M7N8P9';
    const modelPublicId = '01M0DELWZCQKXG2S4J5E6M7N8P9';
    const filter: any = { status: 'active', page: 3, limit: 15 };

    const expected: any = { data: [], pagination: { page: 3, limit: 15 } };
    queryService.findSkusByModelPublicId.mockResolvedValue(expected);

    const result = await controller.findAllByModel(
      itemPublicId,
      modelPublicId,
      filter,
    );

    expect(queryService.findSkusByModelPublicId).toHaveBeenCalledWith(
      modelPublicId,
      filter,
    );
    expect(result).toBe(expected);
  });
});
