import { SOHeader } from './so-header.entity';
import { SOLine } from './so-line.entity';
import { InvalidSOException } from './exceptions/so-domain.exception';

const baseLine = {
  lineNum: 1,
  itemSkuId: 101,
  description: 'Item Test',
  orderQty: 1,
  uomCode: 'PCS',
  unitPrice: 100,
};

const baseHeader = {
  soNum: 'SO-TEST-001',
  customerId: 100,
  createdBy: 'tester',
};

const makeLine = (overrides: Partial<typeof baseLine> = {}) =>
  new SOLine({ ...baseLine, ...overrides });

describe('SOHeader', () => {
  // ==================== create() ====================

  describe('create()', () => {
    it('should create a valid header with default values', () => {
      const header = SOHeader.create(baseHeader);

      expect(header.getSONum()).toBe('SO-TEST-001');
      expect(header.getCustomerId()).toBe(100);
      expect(header.getStatus()).toBe('OPEN');
      expect(header.getCreatedBy()).toBe('tester');
      expect(header.getDepositAmount()).toBe(0);
      expect(header.getLines()).toHaveLength(0);
    });

    it('should throw if soNum is empty', () => {
      expect(() => SOHeader.create({ ...baseHeader, soNum: '' })).toThrow(
        InvalidSOException
      );
    });

    it('should throw if customerId is 0', () => {
      expect(() => SOHeader.create({ ...baseHeader, customerId: 0 })).toThrow(
        InvalidSOException
      );
    });

    it('should throw if depositAmount is negative', () => {
      expect(() =>
        SOHeader.create({ ...baseHeader, depositAmount: -1 })
      ).toThrow(InvalidSOException);
    });

    it('should create with lines and calculate total', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [
          makeLine({ lineNum: 1, unitPrice: 100 }),
          makeLine({ lineNum: 2, unitPrice: 200 }),
        ],
      });

      expect(header.getPricing().getTotalAmount()).toBe(300);
      expect(header.getLines()).toHaveLength(2);
    });

    it('should apply header discount percent on creation', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [
          makeLine({ lineNum: 1, unitPrice: 500 }),
          makeLine({ lineNum: 2, unitPrice: 500 }),
        ],
        discountPercent: 10,
      });

      expect(header.getPricing().getDiscountAmount()).toBe(100);
      expect(header.getPricing().getTotalAmount()).toBe(900);
    });

    it('should default status to OPEN', () => {
      const header = SOHeader.create(baseHeader);
      expect(header.getStatus()).toBe('OPEN');
    });

    it('should accept custom orderStatus DRAFT', () => {
      const header = SOHeader.create({ ...baseHeader, orderStatus: 'DRAFT' });
      expect(header.getStatus()).toBe('DRAFT');
    });
  });

  // ==================== Pricing ====================

  describe('Pricing', () => {
    it('should recalculate totals when adding a line', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });

      header.addLine(makeLine({ lineNum: 2, unitPrice: 50 }));

      expect(header.getPricing().getTotalAmount()).toBe(150);
    });

    it('should recalculate totals when removing a line', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [
          makeLine({ lineNum: 1, unitPrice: 100 }),
          makeLine({ lineNum: 2, unitPrice: 50 }),
        ],
      });

      header.removeLine(1);

      expect(header.getPricing().getTotalAmount()).toBe(50);
    });

    it('should throw when removing a non-existent line', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });

      expect(() => header.removeLine(99)).toThrow(InvalidSOException);
    });

    it('should re-apply discount percent when lines change', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
        discountPercent: 10,
      });
      expect(header.getPricing().getDiscountAmount()).toBe(10);

      header.addLine(makeLine({ lineNum: 2, unitPrice: 100 }));

      expect(header.getPricing().getDiscountAmount()).toBe(20);
      expect(header.getPricing().getTotalAmount()).toBe(180);
    });

    it('should update discount by amount', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });

      header.updateDiscountAmount(20);

      expect(header.getPricing().getDiscountAmount()).toBe(20);
      expect(header.getPricing().getTotalAmount()).toBe(80);
    });

    it('should update discount by percent', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 200 })],
      });

      header.updateDiscountPercent(10);

      expect(header.getPricing().getDiscountAmount()).toBe(20);
      expect(header.getPricing().getTotalAmount()).toBe(180);
    });
  });

  // ==================== depositAmount ====================

  describe('depositAmount', () => {
    it('should update deposit amount within total', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 500 })],
      });

      header.updateDepositAmount(200);

      expect(header.getDepositAmount()).toBe(200);
    });

    it('should allow deposit equal to total', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 500 })],
      });

      header.updateDepositAmount(500);

      expect(header.getDepositAmount()).toBe(500);
    });

    it('should throw if deposit exceeds total', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 500 })],
      });

      expect(() => header.updateDepositAmount(501)).toThrow(InvalidSOException);
    });

    it('should throw if deposit is negative', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 500 })],
      });

      expect(() => header.updateDepositAmount(-1)).toThrow(InvalidSOException);
    });
  });

  // ==================== Status transitions ====================

  describe('Status transitions', () => {
    it('should hold an OPEN order', () => {
      const header = SOHeader.create(baseHeader);

      header.hold();

      expect(header.getStatus()).toBe('ON_HOLD');
    });

    it('should release a held order back to OPEN', () => {
      const header = SOHeader.create(baseHeader);
      header.hold();

      header.release();

      expect(header.getStatus()).toBe('OPEN');
    });

    it('should throw when releasing a non-held order', () => {
      const header = SOHeader.create(baseHeader);

      expect(() => header.release()).toThrow(InvalidSOException);
    });

    it('should cancel an OPEN order and cancel all lines', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });

      header.cancel();

      expect(header.getStatus()).toBe('CANCELLED');
      header.getLines().forEach((line) => {
        expect(line.getStatus()).toBe('CANCELLED');
      });
    });

    it('should throw when cancelling a CLOSED order', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });
      header.close();

      expect(() => header.cancel()).toThrow(InvalidSOException);
    });

    it('should close an order and auto-close all active lines', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [
          makeLine({ lineNum: 1, unitPrice: 100 }),
          makeLine({ lineNum: 2, unitPrice: 200 }),
        ],
      });

      header.close();

      expect(header.getStatus()).toBe('CLOSED');
      header.getLines().forEach((line) => {
        expect(line.getStatus()).toBe('CLOSED');
      });
    });

    it('should not close CANCELLED lines when closing the order', () => {
      const header = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 100 })],
      });
      header.getLines()[0].cancel();

      header.close();

      expect(header.getLines()[0].getStatus()).toBe('CANCELLED');
    });
  });

  // ==================== updateDates ====================

  describe('updateDates()', () => {
    it('should update orderDate', () => {
      const header = SOHeader.create(baseHeader);
      const newDate = new Date('2026-06-01');

      header.updateDates({ orderDate: newDate });

      expect(header.getOrderDate()).toEqual(newDate);
    });

    it('should update requestDate and needByDate', () => {
      const header = SOHeader.create(baseHeader);
      const req = new Date('2026-06-10');
      const need = new Date('2026-06-15');

      header.updateDates({ requestDate: req, needByDate: need });

      expect(header.getRequestDate()).toEqual(req);
      expect(header.getNeedByDate()).toEqual(need);
    });

    it('should clear requestDate when set to null', () => {
      const header = SOHeader.create({
        ...baseHeader,
        requestDate: new Date(),
      });

      header.updateDates({ requestDate: null });

      expect(header.getRequestDate()).toBeNull();
    });
  });

  // ==================== toPersistence / fromPersistence ====================

  describe('toPersistence() / fromPersistence()', () => {
    it('should round-trip through persistence without data loss', () => {
      const original = SOHeader.create({
        ...baseHeader,
        lines: [makeLine({ lineNum: 1, unitPrice: 300 })],
        depositAmount: 100,
      });

      const persisted = original.toPersistence();
      const restored = SOHeader.fromPersistence({
        ...persisted,
        createdBy: 'tester',
        lines: persisted.lines,
      });

      expect(restored.getSONum()).toBe(original.getSONum());
      expect(restored.getCustomerId()).toBe(original.getCustomerId());
      expect(restored.getDepositAmount()).toBe(100);
      expect(restored.getPricing().getTotalAmount()).toBe(
        original.getPricing().getTotalAmount()
      );
    });
  });
});
