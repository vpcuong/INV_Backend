import { Module } from '@nestjs/common';
import { UomsService } from './uoms.service';
import { UomsController } from './uoms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UomsController],
  providers: [UomsService],
})
export class UomsModule {}
