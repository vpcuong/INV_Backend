import { Module } from '@nestjs/common';
import { UomClassesService } from './uom-classes.service';
import { UomClassesController } from './uom-classes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UomClassesController],
  providers: [UomClassesService],
})
export class UomClassesModule {}
