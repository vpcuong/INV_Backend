import { SOPricing } from './so-pricing.vo';

describe('SOPricing', () => {
  // Helper to init pricing with a known state
  // Assuming Base = 1000
  const createBasePricing = (totalAmount: number) => SOPricing.create({
      totalAmount, // In new logic, totalAmount is input directly
      discountAmount: 0,
      taxAmount: 0
  });

  describe('recalculate', () => {
    it('should recalculate total based on new base amount (simple case)', () => {
      // Setup: No discount, No tax
      const pricing = SOPricing.create({ totalAmount: 0 }); // Init empty
      
      // Act: Recalulate with base 1000
      const updated = pricing.recalculate(1000);

      expect(updated.getTotalAmount()).toBe(1000);
      expect(updated.getDiscountAmount()).toBe(0);
      expect(updated.getTaxAmount()).toBe(0);
    });

    it('should maintain discount percent and recalculate discount amount', () => {
      const pricing = SOPricing.create({ 
          totalAmount: 900, 
          discountPercent: 10,
          discountAmount: 100 // Old base was 1000
      });

      // New Base = 2000
      const updated = pricing.recalculate(2000);

      // Discount = 10% of 2000 = 200
      // Total = 2000 - 200 = 1800
      expect(updated.getDiscountPercent()).toBe(10);
      expect(updated.getDiscountAmount()).toBe(200);
      expect(updated.getTotalAmount()).toBe(1800);
    });

    it('should maintain tax percent and recalculate tax amount', () => {
      const pricing = SOPricing.create({
          totalAmount: 1100,
          taxPercent: 10,
          taxAmount: 100 // Old base 1000
      });

      // New Base = 2000. Taxable = 2000.
      const updated = pricing.recalculate(2000);

      // Tax = 10% of 2000 = 200
      // Total = 2000 + 200 = 2200
      expect(updated.getTaxPercent()).toBe(10);
      expect(updated.getTaxAmount()).toBe(200);
      expect(updated.getTotalAmount()).toBe(2200);
    });

    it('should handle both discount and tax percentages', () => {
      const pricing = SOPricing.create({
          discountPercent: 10,
          taxPercent: 10
      });

      // Base = 1000
      // Discount = 100
      // Taxable = 900
      // Tax = 90
      // Total = 1000 - 100 + 90 = 990
      const updated = pricing.recalculate(1000);

      expect(updated.getDiscountAmount()).toBe(100);
      expect(updated.getTaxAmount()).toBe(90);
      expect(updated.getTotalAmount()).toBe(990);
    });
  });

  describe('Discount Logic', () => {
    it('setDiscountAmount should update amount and recalc percent', () => {
      // Start: Base 1000. Total 1000.
      const pricing = SOPricing.create({ totalAmount: 1000 });
      
      // Apply 100 discount
      // Base is reverse-calculated: Total + Disc - Tax = 1000 + 0 - 0 = 1000
      const updated = pricing.setDiscountAmount(100);

      expect(updated.getDiscountAmount()).toBe(100);
      expect(updated.getDiscountPercent()).toBe(10); // 100/1000
      expect(updated.getTotalAmount()).toBe(900);
    });

    it('setDiscountPercent should update percent and recalc amount', () => {
      // Start: Base 1000. Total 1000.
      const pricing = SOPricing.create({ totalAmount: 1000 });

      const updated = pricing.setDiscountPercent(20);

      expect(updated.getDiscountPercent()).toBe(20);
      expect(updated.getDiscountAmount()).toBe(200); // 20% of 1000
      expect(updated.getTotalAmount()).toBe(800);
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
