import { SOHeader } from './so-header.entity';
import { SOLine } from './so-line.entity';

describe('SOHeader', () => {
  const validLineData = {
    lineNum: 1,
    itemSkuId: 101,
    description: 'Item Test',
    orderQty: 1,
    uomCode: 'PCS',
    unitPrice: 100,
    totalAmount: 100, // ignored/recalc
  };

  const validHeaderData = {
    soNum: 'SO-TEST-001',
    customerId: 100,
    createdBy: 'tester',
  };

  describe('Pricing Integration', () => {
    it('should calculate total correctly from multiple lines', () => {
      const line1 = new SOLine({ ...validLineData, lineNum: 1, unitPrice: 100 });
      const line2 = new SOLine({ ...validLineData, lineNum: 2, unitPrice: 200 });

      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1, line2],
      });

      // Total = 100 + 200 = 300
      expect(header.getPricing().getTotalAmount()).toBe(300);
      expect(header.getPricing().getDiscountAmount()).toBe(0);
    });

    it('should apply header discount percent correctly to sum of lines', () => {
      const line1 = new SOLine({ ...validLineData, unitPrice: 500 });
      const line2 = new SOLine({ ...validLineData, unitPrice: 500 }); // Base 1000

      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1, line2],
        discountPercent: 10, // 10%
      });

      // Base = 1000. Discount = 100. Total = 900.
      expect(header.getPricing().getDiscountAmount()).toBe(100);
      expect(header.getPricing().getTotalAmount()).toBe(900);
    });

    it('should recalculate totals when adding a line', () => {
      const line1 = new SOLine({ ...validLineData, unitPrice: 100 });
      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1],
      }); // Total 100

      const line2 = new SOLine({ ...validLineData, lineNum: 2, unitPrice: 50 });
      const updatedHeader = header.addLine(line2);

      expect(updatedHeader.getPricing().getTotalAmount()).toBe(150);
    });

    it('should recalculate totals when removing a line', () => {
      const line1 = new SOLine({ ...validLineData, unitPrice: 100 });
      const line2 = new SOLine({ ...validLineData, lineNum: 2, unitPrice: 50 });
      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1, line2],
      }); // Total 150

      const updatedHeader = header.removeLine(1); // Remove line 1 (100)

      expect(updatedHeader.getPricing().getTotalAmount()).toBe(50);
    });

    it('should auto-adjust discount amount when base changes (Percent rule)', () => {
      // Create with 1 line (100) and 10% discount
      const line1 = new SOLine({ ...validLineData, unitPrice: 100 });
      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1],
        discountPercent: 10, 
      }); 
      // Base 100, Disc 10, Total 90
      expect(header.getPricing().getDiscountAmount()).toBe(10);

      // Add line (100) -> Base 200
      // Discount should be 10% of 200 = 20
      const line2 = new SOLine({ ...validLineData, lineNum: 2, unitPrice: 100 });
      const updatedHeader = header.addLine(line2);

      expect(updatedHeader.getPricing().getTotalAmount()).toBe(180); // 200 - 20
      expect(updatedHeader.getPricing().getDiscountAmount()).toBe(20);
    });

    it('should update discount amount explicitly', () => {
      const line1 = new SOLine({ ...validLineData, unitPrice: 100 });
      const header = SOHeader.create({
        ...validHeaderData,
        lines: [line1],
      }); // 100

      const updatedHeader = header.updateDiscountAmount(20); // Flat 20

      expect(updatedHeader.getPricing().getDiscountAmount()).toBe(20);
      expect(updatedHeader.getPricing().getDiscountPercent()).toBe(20); // 20/100
      expect(updatedHeader.getPricing().getTotalAmount()).toBe(80);
    });
  });
});
