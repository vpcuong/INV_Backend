import { Module } from '@nestjs/common';
import { SupplierItemPackagingsService } from './supplier-item-packagings.service';
import { SupplierItemPackagingsController } from './supplier-item-packagings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupplierItemPackagingsController],
  providers: [SupplierItemPackagingsService],
  exports: [SupplierItemPackagingsService],
})
export class SupplierItemPackagingsModule {}
