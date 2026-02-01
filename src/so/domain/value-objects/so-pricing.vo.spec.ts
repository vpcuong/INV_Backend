import { SOPricing } from './so-pricing.vo';

describe('SOPricing', () => {
  describe('recalculate', () => {
    it('should recalculate total based on new base amount (simple case)', () => {
      const pricing = SOPricing.create({ totalAmount: 0 });

      const updated = pricing.recalculate(1000, 0);

      expect(updated.getTotalAmount()).toBe(1000);
      expect(updated.getDiscountAmount()).toBe(0);
      expect(updated.getTaxAmount()).toBe(0);
    });

    it('should maintain discount percent and recalculate discount amount', () => {
      const pricing = SOPricing.create({
          totalAmount: 900,
          discountPercent: 10,
          discountAmount: 100
      });

      // New Base = 2000, line taxes = 0
      const updated = pricing.recalculate(2000, 0);

      // Discount = 10% of 2000 = 200
      // Total = 2000 - 200 + 0 = 1800
      expect(updated.getDiscountPercent()).toBe(10);
      expect(updated.getDiscountAmount()).toBe(200);
      expect(updated.getTotalAmount()).toBe(1800);
    });

    it('should use line tax sum as header tax amount', () => {
      const pricing = SOPricing.create({ totalAmount: 0 });

      // Base = 2000, line taxes sum = 200
      const updated = pricing.recalculate(2000, 200);

      // Total = 2000 - 0 + 200 = 2200
      expect(updated.getTaxAmount()).toBe(200);
      expect(updated.getTotalAmount()).toBe(2200);
    });

    it('should handle both discount and line taxes', () => {
      const pricing = SOPricing.create({
          discountPercent: 10,
      });

      // Base = 1000, line taxes sum = 90
      const updated = pricing.recalculate(1000, 90);

      // Discount = 10% of 1000 = 100
      // Total = 1000 - 100 + 90 = 990
      expect(updated.getDiscountAmount()).toBe(100);
      expect(updated.getTaxAmount()).toBe(90);
      expect(updated.getTotalAmount()).toBe(990);
    });
  });

  describe('Discount Logic', () => {
    it('setDiscountAmount should update amount and recalc percent', () => {
      const pricing = SOPricing.create({ totalAmount: 1000 });

      const updated = pricing.setDiscountAmount(100);

      expect(updated.getDiscountAmount()).toBe(100);
      expect(updated.getDiscountPercent()).toBe(10); // 100/1000
      expect(updated.getTotalAmount()).toBe(900);
    });

    it('setDiscountPercent should update percent and recalc amount', () => {
      const pricing = SOPricing.create({ totalAmount: 1000 });

      const updated = pricing.setDiscountPercent(20);

      expect(updated.getDiscountPercent()).toBe(20);
      expect(updated.getDiscountAmount()).toBe(200); // 20% of 1000
      expect(updated.getTotalAmount()).toBe(800);
    });

    it('setDiscountAmount should preserve taxAmount from lines', () => {
      // Base = 1000, tax = 80 => total = 1080
      const pricing = SOPricing.create({ totalAmount: 1080, taxAmount: 80 });

      const updated = pricing.setDiscountAmount(100);

      expect(updated.getDiscountAmount()).toBe(100);
      expect(updated.getTaxAmount()).toBe(80); // Unchanged (from lines)
      expect(updated.getTotalAmount()).toBe(980); // 1000 - 100 + 80
    });

    it('should throw error for negative discount amount', () => {
      const pricing = SOPricing.create({ totalAmount: 1000 });
      expect(() => pricing.setDiscountAmount(-10)).toThrow();
    });

    it('should throw error when discount amount exceeds total (base)', () => {
      const pricing = SOPricing.create({ totalAmount: 1000 });
      expect(() => pricing.setDiscountAmount(1100)).toThrow();
    });
  });

  describe('Validation', () => {
    it('should validate max percent > 100', () => {
         expect(() => SOPricing.create({ totalAmount: 100, discountPercent: 101 })).toThrow();
    });
  });
});