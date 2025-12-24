import { Module } from '@nestjs/common';
import { SoHeadersService } from './so-headers.service';
import { SoHeadersController } from './so-headers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SoHeadersService],
  controllers: [SoHeadersController],
  exports: [SoHeadersService],
})
export class SoHeadersModule {}
