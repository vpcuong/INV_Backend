import { Module } from '@nestjs/common';
import { UomConversionsService } from './uom-conversions.service';
import { UomConversionsController } from './uom-conversions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UomConversionsController],
  providers: [UomConversionsService],
})
export class UomConversionsModule {}
