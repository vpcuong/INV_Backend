import { Module } from '@nestjs/common';
import { PoService } from './po.service';
import { PoController } from './po.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoService],
  controllers: [PoController],
  exports: [PoService],
})
export class PoModule {}
