import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './controllers/items.controller';
import { ItemAggregateService } from './application/item-aggregate.service';
import { ItemQueryService } from './application/item-query.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let aggregateService: jest.Mocked<ItemAggregateService>;
  let queryService: jest.Mocked<ItemQueryService>;

  beforeEach(async () => {
    const aggregateServiceMock: Partial<jest.Mocked<ItemAggregateService>> = {
      createItem: jest.fn(),
      updateItemByPublicId: jest.fn(),
      deleteItemByPublicId: jest.fn(),
      activateItemByPublicId: jest.fn(),
      deactivateItemByPublicId: jest.fn(),
      setItemDraftByPublicId: jest.fn(),
    };

    const queryServiceMock: Partial<jest.Mocked<ItemQueryService>> = {
      findAllWithFilters: jest.fn(),
      findByPublicId: jest.fn(),
      findCompleteByPublicId: jest.fn(),
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

  it('should delegate findAll to ItemQueryService.findAllWithFilters', async () => {
    const filterDto: any = { page: 1, limit: 10, search: 'shirt' };
    const expected = { data: [], pagination: { page: 1, limit: 10 } } as any;
    queryService.findAllWithFilters.mockResolvedValue(expected);

    const result = await controller.findAll(filterDto);

    expect(queryService.findAllWithFilters).toHaveBeenCalledWith(filterDto);
    expect(result).toBe(expected);
  });

  it('should delegate findOne to ItemQueryService.findByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { publicId, name: 'Item A' } as any;
    queryService.findByPublicId.mockResolvedValue(expected);

    const result = await controller.findOne(publicId);

    expect(queryService.findByPublicId).toHaveBeenCalledWith(publicId);
    expect(result).toBe(expected);
  });

  it('should delegate findComplete to ItemQueryService.findCompleteByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { publicId, models: [], skus: [], uoms: [] } as any;
    queryService.findCompleteByPublicId.mockResolvedValue(expected);

    const result = await controller.findComplete(publicId);

    expect(queryService.findCompleteByPublicId).toHaveBeenCalledWith(publicId);
    expect(result).toBe(expected);
  });

  it('should delegate update to ItemAggregateService.updateItemByPublicId', async () => {
    const publicId = '01HXYZ';
    const dto: any = { name: 'Updated' };
    const expected = { publicId, ...dto } as any;
    aggregateService.updateItemByPublicId.mockResolvedValue(expected);

    const result = await controller.update(publicId, dto);

    expect(aggregateService.updateItemByPublicId).toHaveBeenCalledWith(
      publicId,
      dto
    );
    expect(result).toBe(expected);
  });

  it('should delegate remove to ItemAggregateService.deleteItemByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { success: true } as any;
    aggregateService.deleteItemByPublicId.mockResolvedValue(expected);

    const result = await controller.remove(publicId);

    expect(aggregateService.deleteItemByPublicId).toHaveBeenCalledWith(
      publicId
    );
    expect(result).toBe(expected);
  });

  it('should delegate activate to ItemAggregateService.activateItemByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { publicId, status: 'ACTIVE' } as any;
    aggregateService.activateItemByPublicId.mockResolvedValue(expected);

    const result = await controller.activate(publicId);

    expect(aggregateService.activateItemByPublicId).toHaveBeenCalledWith(
      publicId
    );
    expect(result).toBe(expected);
  });

  it('should delegate deactivate to ItemAggregateService.deactivateItemByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { publicId, status: 'INACTIVE' } as any;
    aggregateService.deactivateItemByPublicId.mockResolvedValue(expected);

    const result = await controller.deactivate(publicId);

    expect(aggregateService.deactivateItemByPublicId).toHaveBeenCalledWith(
      publicId
    );
    expect(result).toBe(expected);
  });

  it('should delegate setDraft to ItemAggregateService.setItemDraftByPublicId', async () => {
    const publicId = '01HXYZ';
    const expected = { publicId, status: 'DRAFT' } as any;
    aggregateService.setItemDraftByPublicId.mockResolvedValue(expected);

    const result = await controller.setDraft(publicId);

    expect(aggregateService.setItemDraftByPublicId).toHaveBeenCalledWith(
      publicId
    );
    expect(result).toBe(expected);
  });
});
