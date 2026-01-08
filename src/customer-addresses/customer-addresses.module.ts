import { Module } from '@nestjs/common';
import { CustomerAddressesController } from './customer-addresses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomerAddressService } from './application/customer-address.service';
import { CustomerAddressRepository } from './infrastructure/customer-address.repository';
import { CUSTOMER_ADDRESS_REPOSITORY } from './constant/customer-address.token';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerAddressesController],
  providers: [
    CustomerAddressService,
    {
      provide: CUSTOMER_ADDRESS_REPOSITORY,
      useClass: CustomerAddressRepository,
    },
  ],
  exports: [CustomerAddressService],
})
export class CustomerAddressesModule {}
