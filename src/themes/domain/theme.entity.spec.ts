import { Theme, ThemeConstructorData } from './theme.entity';
import { UomRequiredWhenPriceProvidedException, InvalidThemeCodeException } from './exceptions/theme-domain.exception';

describe('Theme Entity', () => {
  describe('constructor - Theme Code Validation', () => {
    it('should create a theme with valid code (4 characters)', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH01',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().code).toBe('TH01');
    });

    it('should create a theme with valid code (10 characters)', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'THEME12345',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().code).toBe('THEME12345');
    });

    it('should create a theme with alphanumeric code', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH2024',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().code).toBe('TH2024');
    });

    it('should throw InvalidThemeCodeException when code is too short', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(InvalidThemeCodeException);
      expect(() => new Theme(data)).toThrow(
        'Invalid theme code: TH. Code must be alphanumeric and 4-10 characters.'
      );
    });

    it('should throw InvalidThemeCodeException when code is too long', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'THEME123456',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(InvalidThemeCodeException);
      expect(() => new Theme(data)).toThrow(
        'Invalid theme code: THEME123456. Code must be alphanumeric and 4-10 characters.'
      );
    });

    it('should throw InvalidThemeCodeException when code contains special characters', () => {
      // Arrange
      const invalidCodes = ['TH-01', 'TH_01', 'TH@01', 'TH 01', 'TH.01'];

      invalidCodes.forEach((code) => {
        const data: ThemeConstructorData = {
          code,
          desc: 'Test Theme',
          supplierId: 1,
          colorCode: 'RED',
        };

        // Act & Assert
        expect(() => new Theme(data)).toThrow(InvalidThemeCodeException);
      });
    });

    it('should throw InvalidThemeCodeException when code is empty', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: '',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(InvalidThemeCodeException);
    });
  });

  describe('constructor - Price and UOM Validation', () => {
    it('should create a theme with both price and uom', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: 'KG',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().price).toBe(100);
      expect(theme.toPersistence().uom).toBe('KG');
    });

    it('should create a theme without price and uom', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().price).toBeUndefined();
      expect(theme.toPersistence().uom).toBeUndefined();
    });

    it('should create a theme with price = 0 and valid uom', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 0,
        uom: 'KG',
      };

      // Act
      const theme = new Theme(data);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence().price).toBe(0);
    });

    it('should throw UomRequiredWhenPriceProvidedException when price is provided but uom is undefined', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        // uom is undefined
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(UomRequiredWhenPriceProvidedException);
      expect(() => new Theme(data)).toThrow('UOM is required when price is provided');
    });

    it('should throw UomRequiredWhenPriceProvidedException when price is provided but uom is empty string', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: '',
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(UomRequiredWhenPriceProvidedException);
    });

    it('should throw UomRequiredWhenPriceProvidedException when price is provided but uom is whitespace', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: '   ',
      };

      // Act & Assert
      expect(() => new Theme(data)).toThrow(UomRequiredWhenPriceProvidedException);
    });
  });

  describe('toPersistence', () => {
    it('should convert theme entity to persistence object', () => {
      // Arrange
      const data: ThemeConstructorData = {
        id: 1,
        code: 'TH001',
        desc: 'Summer Collection',
        supplierId: 5,
        colorCode: 'BLUE',
        price: 250,
        uom: 'PCS',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        createdBy: 'admin',
        imgUrls: 'http://example.com/image.jpg',
      };

      const theme = new Theme(data);

      // Act
      const persistence = theme.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: 1,
        code: 'TH001',
        desc: 'Summer Collection',
        supplierId: 5,
        colorCode: 'BLUE',
        price: 250,
        uom: 'PCS',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: 'admin',
        imgUrls: 'http://example.com/image.jpg',
      });
    });

    it('should use default values for optional fields', () => {
      // Arrange
      const data: ThemeConstructorData = {
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
      };

      const theme = new Theme(data);

      // Act
      const persistence = theme.toPersistence();

      // Assert
      expect(persistence.createdAt).toBeInstanceOf(Date);
      expect(persistence.updatedAt).toBeInstanceOf(Date);
      expect(persistence.createdBy).toBe('');
      expect(persistence.imgUrls).toBe('');
    });
  });

  describe('fromPersistence', () => {
    it('should create theme entity from persistence data', () => {
      // Arrange
      const persistenceData = {
        id: 1,
        code: 'TH001',
        desc: 'Test Theme',
        supplierId: 1,
        colorCode: 'RED',
        price: 100,
        uom: 'KG',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        imgUrls: 'http://example.com/image.jpg',
      };

      // Act
      const theme = Theme.fromPersistence(persistenceData);

      // Assert
      expect(theme).toBeDefined();
      expect(theme.toPersistence()).toEqual(persistenceData);
    });
  });
});
