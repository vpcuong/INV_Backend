import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller';
import { MaterialService } from './application/material.service';
import { MaterialRepository } from './infrastructure/material.repository';
import { MATERIAL_REPOSITORY } from './constant/material.token';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialsController],
  providers: [
    MaterialService,
    {
      provide: MATERIAL_REPOSITORY,
      useClass: MaterialRepository,
    },
  ],
  exports: [MaterialService],
})
export class MaterialsModule {}
