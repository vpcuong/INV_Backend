import { Module } from '@nestjs/common';
import { SoService } from './so.service';
import { SoController } from './so.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SoService],
  controllers: [SoController],
  exports: [SoService],
})
export class SoModule {}
