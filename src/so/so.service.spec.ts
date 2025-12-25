import { Test, TestingModule } from '@nestjs/testing';
import { SoHeadersService } from './so-headers.service';

describe('SoHeadersService', () => {
  let service: SoHeadersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoHeadersService],
    }).compile();

    service = module.get<SoHeadersService>(SoHeadersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
