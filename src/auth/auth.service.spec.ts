import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt to avoid slow hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockPrismaService = { client: mockPrismaClient };

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
  decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('mock_secret'),
  get: jest.fn().mockReturnValue('7d'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==================== register ====================

  describe('register', () => {
    const registerDto = {
      userId: 'user01',
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user and return tokens', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue({
        id: 1,
        userId: registerDto.userId,
        email: registerDto.email,
        name: registerDto.name,
        role: 'USER',
      });
      mockPrismaClient.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.user.userId).toBe(registerDto.userId);
      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
    });

    it('should throw ConflictException if userId already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: 1 });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaClient.user.findUnique
        .mockResolvedValueOnce(null)    // userId check: not found
        .mockResolvedValueOnce({ id: 2 }); // email check: found

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== login ====================

  describe('login', () => {
    const loginDto = { userId: 'user01', password: 'password123' };

    const mockUser = {
      id: 1,
      userId: 'user01',
      email: 'user@test.com',
      name: 'Test User',
      role: 'USER',
      isActive: true,
      password: 'hashed_password',
    };

    it('should login successfully and return tokens', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaClient.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.user.userId).toBe(mockUser.userId);
      expect(result.access_token).toBe('mock_token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is deactivated', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==================== validateUser ====================

  describe('validateUser', () => {
    it('should return user if found and active', async () => {
      const mockUser = { id: 1, userId: 'user01', email: 'x@x.com', name: 'X', role: 'USER', isActive: true };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(99);

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1, userId: 'user01', isActive: false,
      });

      const result = await service.validateUser(1);

      expect(result).toBeNull();
    });
  });

  // ==================== logout ====================

  describe('logout', () => {
    it('should not throw if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(service.logout('bad_token')).resolves.toBeUndefined();
    });
  });
});
