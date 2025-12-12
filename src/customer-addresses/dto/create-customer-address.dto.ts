import { IsInt, IsEnum, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '../enums/address-type.enum';

export class CreateCustomerAddressDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 1
  })
  @IsInt()
  customerId!: number;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.HQ
  })
  @IsEnum(AddressType)
  addressType!: AddressType;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street',
    maxLength: 500
  })
  @IsString()
  @MaxLength(500)
  addressLine!: string;

  @ApiPropertyOptional({
    description: 'Ward',
    example: 'Ward 1',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({
    description: 'District',
    example: 'District 1',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({
    description: 'City',
    example: 'Ho Chi Minh City',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({
    description: 'Province',
    example: 'Ho Chi Minh',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiProperty({
    description: 'Country',
    example: 'Vietnam',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  country!: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '700000',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Is this the default address for this type',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
