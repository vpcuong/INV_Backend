import { Module } from '@nestjs/common';
import { CustomerAddressesService } from './customer-addresses.service';
import { CustomerAddressesController } from './customer-addresses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
  exports: [CustomerAddressesService],
})
export class CustomerAddressesModule {}
