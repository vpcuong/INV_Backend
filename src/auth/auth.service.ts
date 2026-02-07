import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingByUserId = await this.prisma.client.user.findUnique({
      where: { userId: registerDto.userId },
    });
    if (existingByUserId) {
      throw new ConflictException('User ID already exists');
    }

    const existingByEmail = await this.prisma.client.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.client.user.create({
      data: {
        userId: registerDto.userId,
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });

    const tokens = await this.generateTokens(user.id, user.userId, user.role);

    return {
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { userId: loginDto.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.userId, user.role);

    return {
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async validateUser(id: number) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  private async generateTokens(id: number, userId: string, role: string) {
    const payload = { sub: id, userId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
        '7d') as any,
    });

    await this.saveRefreshToken(id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);

    const decoded = this.jwtService.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await this.prisma.client.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const storedTokens = await this.prisma.client.refreshToken.findMany({
        where: { userId: payload.sub },
      });

      const validToken = await this.findMatchingToken(
        refreshToken,
        storedTokens,
      );

      if (!validToken) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Delete old token (rotation)
      await this.prisma.client.refreshToken.delete({
        where: { id: validToken.id },
      });

      const user = await this.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user.id, user.userId, user.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const storedTokens = await this.prisma.client.refreshToken.findMany({
        where: { userId: payload.sub },
      });

      const validToken = await this.findMatchingToken(
        refreshToken,
        storedTokens,
      );

      if (validToken) {
        await this.prisma.client.refreshToken.delete({
          where: { id: validToken.id },
        });
      }
    } catch {
      // Token already expired or invalid - no action needed
    }
  }

  async revokeAllUserTokens(userId: number) {
    await this.prisma.client.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async findMatchingToken(
    rawToken: string,
    storedTokens: { id: number; tokenHash: string }[],
  ) {
    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(rawToken, stored.tokenHash);
      if (isMatch) {
        return stored;
      }
    }
    return null;
  }
}
