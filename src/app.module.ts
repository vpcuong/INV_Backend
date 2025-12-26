import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ItemCategoriesModule } from './item-categories/item-categories.module';
import { ItemsModule } from './items/items.module';
import { ItemRevisionsModule } from './item-revisions/item-revisions.module';
import { ItemSkusModule } from './item-skus/item-skus.module';
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
import { ItemUomModule } from './item-uom/item-uom.module';
import { SkuUomModule } from './sku-uom/sku-uom.module';
import { PoModule } from './po/po.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ItemCategoriesModule,
    ItemsModule,
    ItemRevisionsModule,
    ItemSkusModule,
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
    ItemUomModule,
    SkuUomModule,
    PoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
