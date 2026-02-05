import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DomainExceptionFilter } from './common/exception-filters/domain-exception.filter';
import { ItemCategoriesModule } from './item-categories/item-categories.module';
import { ItemsModule } from './items/items.module';
import { ItemTypesModule } from './item-types/item-types.module';
import { AuthModule } from './auth/auth.module';
import { ColorsModule } from './colors/colors.module';
import { GendersModule } from './genders/genders.module';
import { SizesModule } from './sizes/sizes.module';
import { MaterialsModule } from './materials/materials.module';
import { UomClassesModule } from './uom-classes/uom-classes.module';
import { UomsModule } from './uoms/uoms.module';
import { UomConversionsModule } from './uom-conversions/uom-conversions.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SupplierItemPackagingsModule } from './supplier-item-packagings/supplier-item-packagings.module';
import { CustomersModule } from './customers/customers.module';
import { CustomerAddressesModule } from './customer-addresses/customer-addresses.module';
import { SoModule } from './so/so.module';
import { PoModule } from './po/po.module';
import { ThemeModule } from './themes/theme.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { FilteringModule } from './common/filtering';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    FilteringModule,
    ItemCategoriesModule,
    ItemsModule, // Now contains Models, SKUs, UOMs, and SkuUom
    ItemTypesModule,
    AuthModule,
    ColorsModule,
    GendersModule,
    SizesModule,
    MaterialsModule,
    UomClassesModule,
    UomsModule,
    UomConversionsModule,
    SuppliersModule,
    SupplierItemPackagingsModule,
    CustomersModule,
    CustomerAddressesModule,
    SoModule,
    PoModule,
    ThemeModule,
    WarehouseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
