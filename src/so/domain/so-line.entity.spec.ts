import { SOLine } from './so-line.entity';
import { InvalidAmountException, InvalidSOLineException } from './exceptions/so-domain.exception';

describe('SOLine', () => {
  const validData = {
    lineNum: 1,
    itemSkuId: 101,
    description: 'Test Item',
    orderQty: 10,
    uomCode: 'PCS',
    unitPrice: 100,
    totalAmount: 1000, // ignored by constructor logic
  };

  describe('Constructor - Pricing Consistency', () => {
    it('should calculate Total Amount correctly (Base - Discount + Tax)', () => {
      const line = new SOLine({
        ...validData,
        discountAmount: 100, // 10%
        taxAmount: 90, // 10% of 900
      });

      // Base = 1000. Discount = 100. Taxable = 900. Tax = 90.
      // Total = 1000 - 100 + 90 = 990
      expect(line.getTotalAmount()).toBe(990);
    });

    it('should auto-calculate Discount Amount given only Percent', () => {
      const line = new SOLine({
        ...validData,
        discountPercent: 10,
      });

      // 10% of 1000 = 100
      expect(line.getDiscountAmount()).toBe(100);
      expect(line.getTotalAmount()).toBe(900);
    });

    it('should auto-calculate Discount Percent given only Amount', () => {
      const line = new SOLine({
        ...validData,
        discountAmount: 200,
      });

      // 200 / 1000 = 20%
      expect(line.getDiscountPercent()).toBe(20);
      expect(line.getTotalAmount()).toBe(800);
    });

    it('should throw InvalidAmountException if Percent and Amount are inconsistent', () => {
      expect(() => {
        new SOLine({
          ...validData,
          discountPercent: 10, // Should be 100
          discountAmount: 500, // Conflict!
        });
      }).toThrow(InvalidAmountException);
    });

    it('should accept Consistent Percent and Amount', () => {
      const line = new SOLine({
        ...validData,
        discountPercent: 10,
        discountAmount: 100,
      });
      expect(line.getDiscountAmount()).toBe(100);
    });
  });

  describe('Constructor - Tax Logic', () => {
    it('should calculate Tax Amount based on Taxable Amount (Base - Discount)', () => {
      const line = new SOLine({
        ...validData,
        discountAmount: 100, // Base 1000 -> Taxable 900
        taxPercent: 10,      // 10% of 900 = 90
      });

      expect(line.getTaxAmount()).toBe(90);
      expect(line.getTotalAmount()).toBe(990); // 1000 - 100 + 90
    });
  });

  describe('updateUnitPrice', () => {
     it('should recalculate amounts when UnitPrice changes', () => {
        const line = new SOLine({ ...validData, discountPercent: 10 });
        // Initial: 1000 base, 100 disc, 900 total

        line.updateUnitPrice(200); // New Price. Base = 2000.

        expect(line.getUnitPrice()).toBe(200);
        expect(line.getDiscountAmount()).toBe(200); // 10% of 2000
        expect(line.getTotalAmount()).toBe(1800);
     });

     it('should throw if unit price is negative', () => {
        const line = new SOLine({ ...validData });
        expect(() => line.updateUnitPrice(-1)).toThrow();
     });
  });

  describe('updateDiscount', () => {
     it('should recalculate when Discount Amount is updated', () => {
        const line = new SOLine({ ...validData });

        line.updateDiscount(undefined, 200); // Set discount amount to 200

        expect(line.getDiscountAmount()).toBe(200);
        expect(line.getDiscountPercent()).toBe(20); // 200/1000
        expect(line.getTotalAmount()).toBe(800);
     });

     it('should recalculate amount from percent', () => {
        const line = new SOLine({ ...validData });

        line.updateDiscount(15); // 15% discount

        expect(line.getDiscountPercent()).toBe(15);
        expect(line.getDiscountAmount()).toBe(150); // 15% of 1000
        expect(line.getTotalAmount()).toBe(850);
     });
  });

  describe('updateTax', () => {
     it('should recalculate tax from percent', () => {
        const line = new SOLine({ ...validData });

        line.updateTax(10); // 10% tax

        expect(line.getTaxPercent()).toBe(10);
        expect(line.getTaxAmount()).toBe(100); // 10% of 1000
        expect(line.getTotalAmount()).toBe(1100); // 1000 + 100
     });

     it('should recalculate percent from amount', () => {
        const line = new SOLine({ ...validData });

        line.updateTax(undefined, 50);

        expect(line.getTaxAmount()).toBe(50);
        expect(line.getTaxPercent()).toBe(5); // 50/1000
        expect(line.getTotalAmount()).toBe(1050);
     });
  });
});
