import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get client() {
    return this.prisma;
  }

  // Proxy common Prisma Client methods for convenience
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $connect() {
    return this.prisma.$connect.bind(this.prisma);
  }

  get $disconnect() {
    return this.prisma.$disconnect.bind(this.prisma);
  }

  get $executeRaw() {
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }
}
