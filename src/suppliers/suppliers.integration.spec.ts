import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Suppliers Filtering Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up database
    await prisma.client.supplier.deleteMany();

    // Seed test data
    await seedTestData(prisma);
  });

  afterAll(async () => {
    // Clean up
    await prisma.client.supplier.deleteMany();
    await app.close();
  });

  describe('GET /suppliers (Filtering)', () => {
    it('should get all suppliers with default pagination', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('hasNextPage');
          expect(res.body.meta).toHaveProperty('hasPreviousPage');
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/suppliers?status=Active')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.status === 'Active')).toBe(true);
        });
    });

    it('should filter by category', () => {
      return request(app.getHttpServer())
        .get('/suppliers?category=Fabric')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.category === 'Fabric')).toBe(true);
        });
    });

    it('should filter by isActive', () => {
      return request(app.getHttpServer())
        .get('/suppliers?isActive=true')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.isActive === true)).toBe(true);
        });
    });

    it('should filter by country', () => {
      return request(app.getHttpServer())
        .get('/suppliers?country=Vietnam')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.country === 'Vietnam')).toBe(true);
        });
    });

    it('should filter by minRating', () => {
      return request(app.getHttpServer())
        .get('/suppliers?minRating=4')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.rating >= 4)).toBe(true);
        });
    });

    it('should filter by maxRating', () => {
      return request(app.getHttpServer())
        .get('/suppliers?maxRating=3')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((s: any) => s.rating <= 3)).toBe(true);
        });
    });

    it('should combine multiple filters', () => {
      return request(app.getHttpServer())
        .get('/suppliers?category=Fabric&isActive=true&country=Vietnam&minRating=4')
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every(
              (s: any) =>
                s.category === 'Fabric' &&
                s.isActive === true &&
                s.country === 'Vietnam' &&
                s.rating >= 4,
            ),
          ).toBe(true);
        });
    });

    it('should search across multiple fields', () => {
      return request(app.getHttpServer())
        .get('/suppliers?search=ABC')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(
            res.body.data.some((s: any) => s.name.includes('ABC') || s.code.includes('ABC')),
          ).toBe(true);
        });
    });

    it('should apply pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/suppliers?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should apply sorting', () => {
      return request(app.getHttpServer())
        .get('/suppliers?sort=[{"field":"name","order":"asc"}]')
        .expect(200)
        .expect((res) => {
          const names = res.body.data.map((s: any) => s.name);
          const sortedNames = [...names].sort();
          expect(names).toEqual(sortedNames);
        });
    });

    it('should select specific fields', () => {
      return request(app.getHttpServer())
        .get('/suppliers?fields=id,code,name')
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            const firstItem = res.body.data[0];
            expect(firstItem).toHaveProperty('id');
            expect(firstItem).toHaveProperty('code');
            expect(firstItem).toHaveProperty('name');
            expect(Object.keys(firstItem).length).toBe(3);
          }
        });
    });

    it('should return 400 for invalid page number', () => {
      return request(app.getHttpServer()).get('/suppliers?page=0').expect(400);
    });

    it('should return 400 for invalid limit', () => {
      return request(app.getHttpServer()).get('/suppliers?limit=0').expect(400);
    });

    it('should handle empty results', () => {
      return request(app.getHttpServer())
        .get('/suppliers?status=NonExistentStatus')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });
  });

  describe('GET /suppliers/aggregations/active-status', () => {
    it('should return active/inactive statistics', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/active-status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('inactive');
          expect(res.body).toHaveProperty('activePercentage');
          expect(res.body).toHaveProperty('inactivePercentage');
          expect(res.body.total).toBe(res.body.active + res.body.inactive);
        });
    });

    it('should filter active/inactive by category', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/active-status?category=Fabric')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThanOrEqual(0);
          expect(res.body.active).toBeGreaterThanOrEqual(0);
          expect(res.body.inactive).toBeGreaterThanOrEqual(0);
        });
    });

    it('should calculate percentages correctly', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/active-status')
        .expect(200)
        .expect((res) => {
          const { activePercentage, inactivePercentage } = res.body;
          expect(activePercentage + inactivePercentage).toBeCloseTo(100, 1);
        });
    });
  });

  describe('GET /suppliers/aggregations/statistics', () => {
    it('should return comprehensive statistics', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('inactive');
          expect(res.body).toHaveProperty('blacklisted');
          expect(res.body).toHaveProperty('averageRating');
          expect(res.body).toHaveProperty('minRating');
          expect(res.body).toHaveProperty('maxRating');
          expect(res.body).toHaveProperty('byCategory');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byCountry');
          expect(res.body).toHaveProperty('ratingDistribution');
          expect(Array.isArray(res.body.byCategory)).toBe(true);
          expect(Array.isArray(res.body.byStatus)).toBe(true);
        });
    });

    it('should filter statistics by category', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/statistics?category=Fabric')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThanOrEqual(0);
        });
    });

    it('should filter statistics by country', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/statistics?country=Vietnam')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('GET /suppliers/aggregations/custom', () => {
    it('should group by single field', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/custom?groupBy=["category"]&metrics=["count"]')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('groups');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.groups)).toBe(true);
          if (res.body.groups.length > 0) {
            expect(res.body.groups[0]).toHaveProperty('groupBy');
            expect(res.body.groups[0]).toHaveProperty('count');
          }
        });
    });

    it('should group by multiple fields', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/custom?groupBy=["category","status"]&metrics=["count"]')
        .expect(200)
        .expect((res) => {
          expect(res.body.groups.length).toBeGreaterThanOrEqual(0);
          if (res.body.groups.length > 0) {
            expect(res.body.groups[0].groupBy).toHaveProperty('category');
            expect(res.body.groups[0].groupBy).toHaveProperty('status');
          }
        });
    });

    it('should apply multiple metrics', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/custom?groupBy=["category"]&metrics=["count","avg","min","max"]')
        .expect(200)
        .expect((res) => {
          if (res.body.groups.length > 0) {
            expect(res.body.groups[0]).toHaveProperty('count');
            expect(res.body.groups[0]).toHaveProperty('avg');
            expect(res.body.groups[0]).toHaveProperty('min');
            expect(res.body.groups[0]).toHaveProperty('max');
          }
        });
    });

    it('should combine groupBy with filters', () => {
      return request(app.getHttpServer())
        .get('/suppliers/aggregations/custom?groupBy=["category"]&metrics=["count"]&isActive=true')
        .expect(200)
        .expect((res) => {
          expect(res.body.groups.length).toBeGreaterThanOrEqual(0);
        });
    });
  });
});

// Helper function to seed test data
async function seedTestData(prisma: PrismaService) {
  const testSuppliers = [
    {
      code: 'SUP001',
      name: 'ABC Textiles Co.',
      phone: '+84123456789',
      email: 'contact@abctextiles.com',
      status: 'Active',
      category: 'Fabric',
      country: 'Vietnam',
      province: 'Ho Chi Minh',
      city: 'Ho Chi Minh City',
      rating: 4.5,
      isActive: true,
      createdBy: 'admin',
      sortOrder: 0,
    },
    {
      code: 'SUP002',
      name: 'XYZ Accessories Ltd.',
      phone: '+84987654321',
      email: 'info@xyzacc.com',
      status: 'Active',
      category: 'Accessories',
      country: 'Vietnam',
      province: 'Hanoi',
      city: 'Hanoi',
      rating: 4.2,
      isActive: true,
      createdBy: 'admin',
      sortOrder: 1,
    },
    {
      code: 'SUP003',
      name: 'DEF Packaging Inc.',
      phone: '+84111222333',
      email: 'sales@defpkg.com',
      status: 'Inactive',
      category: 'Packaging',
      country: 'China',
      province: 'Guangdong',
      city: 'Guangzhou',
      rating: 3.8,
      isActive: false,
      createdBy: 'admin',
      sortOrder: 2,
    },
    {
      code: 'SUP004',
      name: 'GHI Yarn Suppliers',
      phone: '+84444555666',
      email: 'contact@ghiyarn.com',
      status: 'Active',
      category: 'Yarn',
      country: 'Vietnam',
      province: 'Dong Nai',
      city: 'Bien Hoa',
      rating: 4.8,
      isActive: true,
      createdBy: 'admin',
      sortOrder: 3,
    },
    {
      code: 'SUP005',
      name: 'JKL Fabrics Vietnam',
      phone: '+84777888999',
      email: 'info@jklfabrics.vn',
      status: 'Active',
      category: 'Fabric',
      country: 'Vietnam',
      province: 'Binh Duong',
      city: 'Thu Dau Mot',
      rating: 4.0,
      isActive: true,
      createdBy: 'admin',
      sortOrder: 4,
    },
    {
      code: 'SUP006',
      name: 'MNO Textiles Blacklist',
      phone: '+84000111222',
      email: 'bad@mnotextiles.com',
      status: 'Blacklist',
      category: 'Fabric',
      country: 'China',
      province: 'Shanghai',
      city: 'Shanghai',
      rating: 2.0,
      isActive: false,
      createdBy: 'admin',
      sortOrder: 5,
    },
  ];

  await prisma.client.supplier.createMany({
    data: testSuppliers,
  });
}
