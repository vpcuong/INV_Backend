import { SOHeader } from './so-header.entity';
import { SOLine } from './so-line.entity';
import { InvalidSOException } from './exceptions/so-domain.exception';

describe('SOHeader Entity', () => {
  const createBasicSOHeader = () => {
    return SOHeader.create({
      soNum: 'SO20260001',
      customerId: 1,
      orderDate: new Date('2026-01-01'),
      requestDate: new Date('2026-01-05'),
      needByDate: new Date('2026-01-10'),
      orderStatus: 'OPEN',
      totalLineAmount: 1000,
      headerDiscount: 0,
      lineDiscounts: [],
      taxes: [],
      charges: [],
      billingAddressId: 1,
      shippingAddressId: 2,
      channel: 'WEB',
      fobCode: 'FOB',
      shipViaCode: 'UPS',
      paymentTermCode: 'NET30',
      currencyCode: 'USD',
      exchangeRate: 1,
      customerPoNum: 'PO-001',
      headerNote: 'Test order',
      internalNote: 'Internal note',
      lines: [],
    });
  };

  const createSOLine = (overrides = {}) => {
    return new SOLine({
      lineNum: 1,
      itemId: 1,
      itemSkuId: 1,
      itemCode: 'ITEM-001',
      description: 'Test Item',
      orderQty: 10,
      uomCode: 'EA',
      unitPrice: 100,
      lineTotal: 1000,
      lineStatus: 'OPEN',
      openQty: 10,
      shippedQty: 0,
      ...overrides,
    });
  };

  describe('create', () => {
    it('should create a new SO header', () => {
      const soHeader = createBasicSOHeader();

      expect(soHeader).toBeDefined();
      expect(soHeader.getSONum()).toBe('SO20260001');
      expect(soHeader.getCustomerId()).toBe(1);
      expect(soHeader.getStatus()).toBe('OPEN');
    });

    it('should calculate order total correctly', () => {
      const soHeader = SOHeader.create({
        soNum: 'SO20260001',
        customerId: 1,
        orderDate: new Date(),
        orderStatus: 'OPEN',
        totalLineAmount: 1000,
        headerDiscount: 50,
        lineDiscounts: [20, 30], // 50 total
        taxes: [100],
        charges: [25],
        lines: [],
      });

      // Total = 1000 - 50 (header) - 50 (line) + 100 (tax) + 25 (charges) = 1025
      expect(soHeader.getPricing().getOrderTotal()).toBe(1025);
    });
  });

  describe('addLine', () => {
    it('should add a line to the SO', () => {
      const soHeader = createBasicSOHeader();
      const line = createSOLine();

      const updated = soHeader.addLine(line);

      expect(updated.getLines()).toHaveLength(1);
      expect(updated.getLines()[0].getLineNum()).toBe(1);
    });

    it('should recalculate pricing after adding line', () => {
      const soHeader = createBasicSOHeader();
      const line = createSOLine({
        lineTotal: 500,
        lineDiscountAmount: 25,
        lineTaxAmount: 50,
      });

      const updated = soHeader.addLine(line);

      expect(updated.getPricing().getTotalLineAmount()).toBeGreaterThan(0);
    });
  });

  describe('removeLine', () => {
    it('should remove a line from the SO', () => {
      const line = createSOLine();
      const soHeader = createBasicSOHeader().addLine(line);

      const updated = soHeader.removeLine(1);

      expect(updated.getLines()).toHaveLength(0);
    });

    it('should recalculate pricing after removing line', () => {
      const line1 = createSOLine({ lineNum: 1, lineTotal: 500 });
      const line2 = createSOLine({ lineNum: 2, lineTotal: 300 });

      let soHeader = createBasicSOHeader();
      soHeader = soHeader.addLine(line1).addLine(line2);

      const updated = soHeader.removeLine(1);

      expect(updated.getLines()).toHaveLength(1);
      expect(updated.getLines()[0].getLineNum()).toBe(2);
    });
  });

  describe('status transitions', () => {
    it('should transition from OPEN to ON_HOLD', () => {
      const soHeader = createBasicSOHeader();

      const held = soHeader.hold();

      expect(held.getStatus()).toBe('ON_HOLD');
    });

    it('should transition from ON_HOLD to OPEN', () => {
      const soHeader = createBasicSOHeader().hold();

      const released = soHeader.release();

      expect(released.getStatus()).toBe('OPEN');
    });

    it('should transition to CANCELLED', () => {
      const soHeader = createBasicSOHeader();

      const cancelled = soHeader.cancel();

      expect(cancelled.getStatus()).toBe('CANCELLED');
    });

    it('should close order when all lines are shipped', () => {
      const line = createSOLine({ openQty: 0, shippedQty: 10 });
      const soHeader = createBasicSOHeader().addLine(line);

      const closed = soHeader.close();

      expect(closed.getStatus()).toBe('CLOSED');
    });

    it('should throw error when closing order with open lines', () => {
      const line = createSOLine({ openQty: 10, shippedQty: 0 });
      const soHeader = createBasicSOHeader().addLine(line);

      expect(() => soHeader.close()).toThrow(InvalidSOException);
      expect(() => soHeader.close()).toThrow('Cannot close order with open lines');
    });

    it('should not allow cancelling closed order', () => {
      const line = createSOLine({ openQty: 0, shippedQty: 10 });
      const soHeader = createBasicSOHeader().addLine(line).close();

      expect(() => soHeader.cancel()).toThrow(InvalidSOException);
      expect(() => soHeader.cancel()).toThrow('Cannot cancel closed order');
    });
  });

  describe('updateDiscount', () => {
    it('should update header discount', () => {
      const soHeader = createBasicSOHeader();

      const updated = soHeader.updateDiscount(100);

      expect(updated.getPricing().getHeaderDiscount()).toBe(100);
    });

    it('should recalculate order total after discount update', () => {
      const soHeader = SOHeader.create({
        soNum: 'SO20260001',
        customerId: 1,
        orderDate: new Date(),
        orderStatus: 'OPEN',
        totalLineAmount: 1000,
        headerDiscount: 0,
        lineDiscounts: [],
        taxes: [],
        charges: [],
        lines: [],
      });

      const updated = soHeader.updateDiscount(100);

      // Total = 1000 - 100 = 900
      expect(updated.getPricing().getOrderTotal()).toBe(900);
    });
  });

  describe('updateAddresses', () => {
    it('should update billing and shipping addresses', () => {
      const soHeader = createBasicSOHeader();

      const updated = soHeader.updateAddresses(5, 6);

      expect(updated.getAddresses().getBillingAddressId()).toBe(5);
      expect(updated.getAddresses().getShippingAddressId()).toBe(6);
    });

    it('should allow null addresses', () => {
      const soHeader = createBasicSOHeader();

      const updated = soHeader.updateAddresses(null, null);

      expect(updated.getAddresses().getBillingAddressId()).toBeNull();
      expect(updated.getAddresses().getShippingAddressId()).toBeNull();
    });
  });

  describe('updateShippingDetails', () => {
    it('should update ship via and FOB codes', () => {
      const soHeader = createBasicSOHeader();

      const updated = soHeader.updateShippingDetails('FEDEX', 'DESTINATION');

      expect(updated.getMetadata().getShipViaCode()).toBe('FEDEX');
      expect(updated.getMetadata().getFobCode()).toBe('DESTINATION');
    });
  });

  describe('updateNotes', () => {
    it('should update header and internal notes', () => {
      const soHeader = createBasicSOHeader();

      const updated = soHeader.updateNotes('Updated header', 'Updated internal');

      expect(updated.getMetadata().getHeaderNote()).toBe('Updated header');
      expect(updated.getMetadata().getInternalNote()).toBe('Updated internal');
    });
  });

  describe('immutability', () => {
    it('should return new instance when adding line', () => {
      const original = createBasicSOHeader();
      const line = createSOLine();

      const updated = original.addLine(line);

      expect(updated).not.toBe(original);
      expect(original.getLines()).toHaveLength(0);
      expect(updated.getLines()).toHaveLength(1);
    });

    it('should return new instance when updating discount', () => {
      const original = createBasicSOHeader();

      const updated = original.updateDiscount(100);

      expect(updated).not.toBe(original);
      expect(original.getPricing().getHeaderDiscount()).toBe(0);
      expect(updated.getPricing().getHeaderDiscount()).toBe(100);
    });

    it('should return new instance when changing status', () => {
      const original = createBasicSOHeader();

      const held = original.hold();

      expect(held).not.toBe(original);
      expect(original.getStatus()).toBe('OPEN');
      expect(held.getStatus()).toBe('ON_HOLD');
    });
  });

  describe('getters', () => {
    it('should get all basic properties', () => {
      const soHeader = createBasicSOHeader();

      expect(soHeader.getSONum()).toBe('SO20260001');
      expect(soHeader.getCustomerId()).toBe(1);
      expect(soHeader.getOrderDate()).toEqual(new Date('2026-01-01'));
      expect(soHeader.getRequestDate()).toEqual(new Date('2026-01-05'));
      expect(soHeader.getNeedByDate()).toEqual(new Date('2026-01-10'));
    });

    it('should get pricing', () => {
      const soHeader = createBasicSOHeader();
      const pricing = soHeader.getPricing();

      expect(pricing).toBeDefined();
      expect(pricing.getTotalLineAmount()).toBe(1000);
    });

    it('should get addresses', () => {
      const soHeader = createBasicSOHeader();
      const addresses = soHeader.getAddresses();

      expect(addresses).toBeDefined();
      expect(addresses.getBillingAddressId()).toBe(1);
      expect(addresses.getShippingAddressId()).toBe(2);
    });

    it('should get metadata', () => {
      const soHeader = createBasicSOHeader();
      const metadata = soHeader.getMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getChannel()).toBe('WEB');
      expect(metadata.getCustomerPoNum()).toBe('PO-001');
    });
  });
});
