import { Test, TestingModule } from '@nestjs/testing';
import { SoHeadersController } from './so-headers.controller';

describe('SoHeadersController', () => {
  let controller: SoHeadersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoHeadersController],
    }).compile();

    controller = module.get<SoHeadersController>(SoHeadersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
