import { Test, TestingModule } from '@nestjs/testing';
import { SOQueryService } from './so-query.service';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryBuilderService } from '@/common/filtering';

describe('SOQueryService', () => {
  let service: SOQueryService;
  let prismaService: jest.Mocked<PrismaService>;
  let queryBuilder: jest.Mocked<QueryBuilderService>;

  const mockSOHeader = {
    id: 1,
    soNum: 'SO20260001',
    customerId: 1,
    orderDate: new Date('2026-01-01'),
    orderStatus: 'OPEN',
    orderTotal: 1000,
    openAmount: 1000,
    customer: { id: 1, name: 'Test Customer' },
    billingAddress: null,
    shippingAddress: null,
    lines: [],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
        sOHeader: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          count: jest.fn(),
          aggregate: jest.fn(),
          findFirst: jest.fn(),
        },
      },
    };

    const mockQueryBuilder = {
      buildQuery: jest.fn(),
      buildPaginatedResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SOQueryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryBuilderService,
          useValue: mockQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<SOQueryService>(SOQueryService);
    prismaService = module.get(PrismaService);
    queryBuilder = module.get(QueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWithFilters', () => {
    it('should return paginated sales orders', async () => {
      const filterDto = { page: 1, limit: 10 };
      const mockQuery = { where: {}, take: 10, skip: 0 };

      queryBuilder.buildQuery.mockReturnValue(mockQuery);
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue([
        mockSOHeader,
      ]);
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(1);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const result = await service.findAllWithFilters(filterDto as any);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(queryBuilder.buildQuery).toHaveBeenCalled();
    });

    it('should apply date range filters', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        orderDateFrom: '2026-01-01',
        orderDateTo: '2026-01-31',
      };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue(
        []
      );
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(0);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      await service.findAllWithFilters(filterDto as any);

      expect(queryBuilder.buildQuery).toHaveBeenCalled();
    });

    it('should apply order total range filters', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        minOrderTotal: 100,
        maxOrderTotal: 1000,
      };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue(
        []
      );
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(0);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      await service.findAllWithFilters(filterDto as any);

      expect(queryBuilder.buildQuery).toHaveBeenCalled();
    });
  });

  describe('findByCustomer', () => {
    it('should return orders for specific customer', async () => {
      const filterDto = { page: 1, limit: 10 };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue([
        mockSOHeader,
      ]);
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(1);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const result = await service.findByCustomer(1, filterDto as any);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].customerId).toBe(1);
    });
  });

  describe('findByStatus', () => {
    it('should return orders with specific status', async () => {
      const filterDto = { page: 1, limit: 10 };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue([
        mockSOHeader,
      ]);
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(1);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const result = await service.findByStatus('OPEN', filterDto as any);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOpen', () => {
    it('should return only open orders', async () => {
      const filterDto = { page: 1, limit: 10 };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue([
        mockSOHeader,
      ]);
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(1);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const result = await service.findOpen(filterDto as any);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOnHold', () => {
    it('should return only on-hold orders', async () => {
      const filterDto = { page: 1, limit: 10 };
      const onHoldOrder = { ...mockSOHeader, orderStatus: 'ON_HOLD' };

      queryBuilder.buildQuery.mockReturnValue({ where: {} });
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue([
        onHoldOrder,
      ]);
      (prismaService.client.sOHeader.count as jest.Mock).mockResolvedValue(1);
      queryBuilder.buildPaginatedResponse.mockReturnValue({
        data: [onHoldOrder],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const result = await service.findOnHold(filterDto as any);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].orderStatus).toBe('ON_HOLD');
    });
  });

  describe('getSummary', () => {
    it('should return summary statistics', async () => {
      (prismaService.client.sOHeader.count as jest.Mock)
        .mockResolvedValueOnce(100) // total orders
        .mockResolvedValueOnce(50); // open orders

      (prismaService.client.sOHeader.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { orderTotal: 100000 } }) // total value
        .mockResolvedValueOnce({ _sum: { openAmount: 50000 } }); // open value

      const result = await service.getSummary();

      expect(result.totalOrders).toBe(100);
      expect(result.openOrders).toBe(50);
      expect(result.totalValue).toBe(100000);
      expect(result.openValue).toBe(50000);
    });

    it('should filter summary by customer', async () => {
      (prismaService.client.sOHeader.count as jest.Mock)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10);

      (prismaService.client.sOHeader.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { orderTotal: 20000 } })
        .mockResolvedValueOnce({ _sum: { openAmount: 10000 } });

      const result = await service.getSummary(1);

      expect(result.totalOrders).toBe(20);
      expect(result.openOrders).toBe(10);
    });

    it('should handle null aggregate values', async () => {
      (prismaService.client.sOHeader.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      (prismaService.client.sOHeader.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { orderTotal: null } })
        .mockResolvedValueOnce({ _sum: { openAmount: null } });

      const result = await service.getSummary();

      expect(result.totalValue).toBe(0);
      expect(result.openValue).toBe(0);
    });
  });

  describe('search', () => {
    it('should search orders by text query', async () => {
      const mockResults = [mockSOHeader];
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue(
        mockResults
      );

      const result = await service.search('SO2026');

      expect(result).toHaveLength(1);
      expect(prismaService.client.sOHeader.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ soNum: expect.anything() }),
              expect.objectContaining({ customerPoNum: expect.anything() }),
              expect.objectContaining({ headerNote: expect.anything() }),
              expect.objectContaining({ internalNote: expect.anything() }),
            ]),
          }),
        })
      );
    });

    it('should limit search results to 50', async () => {
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue(
        []
      );

      await service.search('test');

      expect(prismaService.client.sOHeader.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should filter search by customer', async () => {
      (prismaService.client.sOHeader.findMany as jest.Mock).mockResolvedValue(
        []
      );

      await service.search('test', 1);

      expect(prismaService.client.sOHeader.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: 1,
          }),
        })
      );
    });
  });
});
