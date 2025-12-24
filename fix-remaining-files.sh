#!/bin/bash

# This script fixes remaining TypeScript files to use uomCode instead of uomId

echo "Fixing item-uom DTOs..."
# Fix create-item-uom.dto.ts
sed -i 's/uomId: number/uomCode: string/g' src/item-uom/dto/create-item-uom.dto.ts
sed -i "s/'UOM ID'/'UOM code'/g" src/item-uom/dto/create-item-uom.dto.ts
sed -i 's/example: 1/example: '\''EA'\''/g' src/item-uom/dto/create-item-uom.dto.ts
sed -i 's/@IsNumber()/@IsString()/g' src/item-uom/dto/create-item-uom.dto.ts

echo "Fixing sku-uom service and DTOs..."
# Similar fixes for sku-uom
find src/sku-uom -type f -name "*.ts" -exec sed -i 's/uomId/uomCode/g' {} \;
find src/sku-uom/dto -type f -name "*.ts" -exec sed -i 's/: number/: string/g' {} \;
find src/sku-uom/dto -type f -name "*.ts" -exec sed -i 's/@IsNumber()/@IsString()/g' {} \;

echo "Fixing supplier-item-packagings..."
find src/supplier-item-packagings -type f -name "*.ts" -exec sed -i 's/uomId/uomCode/g' {} \;

echo "Fixing uom-conversions..."
find src/uom-conversions -type f -name "*.ts" -exec sed -i 's/fromUOMId/fromUOMCode/g' {} \;
find src/uom-conversions -type f -name "*.ts" -exec sed -i 's/toUOMId/toUOMCode/g' {} \;

echo "Fixing so-headers..."
find src/so-headers -type f -name "*.ts" -exec sed -i 's/uomId/uomCode/g' {} \;

echo "Done!"
