import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersController } from './sales-orders.controller';
import { SOService } from './application/so.service';
import { SOQueryService } from './application/so-query.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Result } from '@/common/result/result';

describe('SalesOrdersController', () => {
  let controller: SalesOrdersController;
  let soService: jest.Mocked<SOService>;
  let soQueryService: jest.Mocked<SOQueryService>;

  const mockSOHeader = {
    id: 1,
    soNum: 'SO20260001',
    customerId: 1,
    orderDate: new Date('2026-01-01'),
    orderStatus: 'OPEN',
    orderTotal: 1000,
    lines: [],
  };

  beforeEach(async () => {
    const mockSOService = {
      create: jest.fn(),
      findOne: jest.fn(),
      findBySONum: jest.fn(),
      update: jest.fn(),
      updateWithLines: jest.fn(),
      cancel: jest.fn(),
      complete: jest.fn(),
      hold: jest.fn(),
      release: jest.fn(),
      remove: jest.fn(),
    };

    const mockSOQueryService = {
      findAllWithFilters: jest.fn(),
      findByCustomer: jest.fn(),
      findByStatus: jest.fn(),
      findOpen: jest.fn(),
      findOnHold: jest.fn(),
      getSummary: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesOrdersController],
      providers: [
        {
          provide: SOService,
          useValue: mockSOService,
        },
        {
          provide: SOQueryService,
          useValue: mockSOQueryService,
        },
      ],
    }).compile();

    controller = module.get<SalesOrdersController>(SalesOrdersController);
    soService = module.get(SOService);
    soQueryService = module.get(SOQueryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a sales order successfully', async () => {
      const createDto = {
        customerId: 1,
        lines: [],
      };

      soService.create.mockResolvedValue(Result.ok(mockSOHeader));

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockSOHeader);
      expect(soService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException when creation fails', async () => {
      const createDto = {
        customerId: 1,
        lines: [],
      };

      soService.create.mockResolvedValue(
        Result.fail({ message: 'Invalid data' })
      );

      await expect(controller.create(createDto as any)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findOne', () => {
    it('should return a sales order by ID', async () => {
      soService.findOne.mockResolvedValue(Result.ok(mockSOHeader));

      const result = await controller.findOne(1);

      expect(result).toEqual(mockSOHeader);
      expect(soService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when SO not found', async () => {
      soService.findOne.mockResolvedValue(
        Result.fail({ message: 'Not found' })
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findBySONum', () => {
    it('should return a sales order by SO number', async () => {
      soService.findBySONum.mockResolvedValue(Result.ok(mockSOHeader));

      const result = await controller.findBySONum('SO20260001');

      expect(result).toEqual(mockSOHeader);
      expect(soService.findBySONum).toHaveBeenCalledWith('SO20260001');
    });
  });

  describe('search', () => {
    it('should search sales orders by query', async () => {
      const mockResults = [mockSOHeader];
      soQueryService.search.mockResolvedValue(mockResults);

      const result = await controller.search('SO2026', undefined);

      expect(result).toEqual(mockResults);
      expect(soQueryService.search).toHaveBeenCalledWith('SO2026', undefined);
    });

    it('should search with customer filter', async () => {
      const mockResults = [mockSOHeader];
      soQueryService.search.mockResolvedValue(mockResults);

      const result = await controller.search('SO2026', 1);

      expect(result).toEqual(mockResults);
      expect(soQueryService.search).toHaveBeenCalledWith('SO2026', 1);
    });
  });

  describe('update', () => {
    it('should update a sales order successfully', async () => {
      const updateDto = {
        headerDiscountAmount: 50,
      };

      const updatedSO = { ...mockSOHeader, headerDiscountAmount: 50 };
      soService.update.mockResolvedValue(Result.ok(updatedSO));

      const result = await controller.update(1, updateDto as any);

      expect(result).toEqual(updatedSO);
      expect(soService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('updateWithLines', () => {
    it('should update SO with lines in transaction', async () => {
      const updateDto = {
        header: { headerDiscountAmount: 50 },
        lines: [],
        linesToDelete: [],
      };

      const updatedSO = { ...mockSOHeader };
      soService.updateWithLines.mockResolvedValue(Result.ok(updatedSO));

      const result = await controller.updateWithLines(1, updateDto as any);

      expect(result).toEqual(updatedSO);
      expect(soService.updateWithLines).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('status transitions', () => {
    it('should cancel a sales order', async () => {
      const cancelledSO = { ...mockSOHeader, orderStatus: 'CANCELLED' };
      soService.cancel.mockResolvedValue(Result.ok(cancelledSO));

      const result = await controller.cancel(1);

      expect(result.orderStatus).toBe('CANCELLED');
      expect(soService.cancel).toHaveBeenCalledWith(1);
    });

    it('should complete a sales order', async () => {
      const completedSO = { ...mockSOHeader, orderStatus: 'CLOSED' };
      soService.complete.mockResolvedValue(Result.ok(completedSO));

      const result = await controller.complete(1);

      expect(result.orderStatus).toBe('CLOSED');
      expect(soService.complete).toHaveBeenCalledWith(1);
    });

    it('should put SO on hold', async () => {
      const heldSO = { ...mockSOHeader, orderStatus: 'ON_HOLD' };
      soService.hold.mockResolvedValue(Result.ok(heldSO));

      const result = await controller.hold(1);

      expect(result.orderStatus).toBe('ON_HOLD');
      expect(soService.hold).toHaveBeenCalledWith(1);
    });

    it('should release SO from hold', async () => {
      const releasedSO = { ...mockSOHeader, orderStatus: 'OPEN' };
      soService.release.mockResolvedValue(Result.ok(releasedSO));

      const result = await controller.release(1);

      expect(result.orderStatus).toBe('OPEN');
      expect(soService.release).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException on invalid status transition', async () => {
      soService.complete.mockResolvedValue(
        Result.fail({ message: 'Cannot complete order with open lines' })
      );

      await expect(controller.complete(1)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('query operations', () => {
    it('should get all sales orders with filters', async () => {
      const mockResponse = {
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      soQueryService.findAllWithFilters.mockResolvedValue(mockResponse);

      const result = await controller.findAll({} as any);

      expect(result).toEqual(mockResponse);
    });

    it('should get orders by customer', async () => {
      const mockResponse = {
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      soQueryService.findByCustomer.mockResolvedValue(mockResponse);

      const result = await controller.findByCustomer(1, {} as any);

      expect(result).toEqual(mockResponse);
      expect(soQueryService.findByCustomer).toHaveBeenCalledWith(1, {});
    });

    it('should get orders by status', async () => {
      const mockResponse = {
        data: [mockSOHeader],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      soQueryService.findByStatus.mockResolvedValue(mockResponse);

      const result = await controller.findByStatus('OPEN', {} as any);

      expect(result).toEqual(mockResponse);
      expect(soQueryService.findByStatus).toHaveBeenCalledWith('OPEN', {});
    });

    it('should get summary statistics', async () => {
      const mockSummary = {
        totalOrders: 100,
        openOrders: 50,
        totalValue: 100000,
        openValue: 50000,
      };

      soQueryService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(undefined);

      expect(result).toEqual(mockSummary);
    });
  });

  describe('remove', () => {
    it('should delete a sales order', async () => {
      soService.remove.mockResolvedValue(Result.ok(mockSOHeader));

      const result = await controller.remove(1);

      expect(result).toEqual(mockSOHeader);
      expect(soService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when deletion fails', async () => {
      soService.remove.mockResolvedValue(
        Result.fail({ message: 'Cannot delete order in current status' })
      );

      await expect(controller.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
