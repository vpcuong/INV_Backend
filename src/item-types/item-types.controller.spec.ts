import { Test, TestingModule } from '@nestjs/testing';
import { ItemTypesController } from './item-types.controller';

describe('ItemTypesController', () => {
  let controller: ItemTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemTypesController],
    }).compile();

    controller = module.get<ItemTypesController>(ItemTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
