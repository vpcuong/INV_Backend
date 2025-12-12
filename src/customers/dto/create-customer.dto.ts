import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerStatus } from '../enums/customer-status.enum';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Unique customer code',
    example: 'CUST001',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  customerCode!: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'ABC Company Ltd.',
    maxLength: 200
  })
  @IsString()
  @MaxLength(200)
  customerName!: string;

  @ApiPropertyOptional({
    description: 'Customer short name',
    example: 'ABC Ltd.',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shortName?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number',
    example: '0123456789',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Vietnam',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Customer status',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'VIP customer with special pricing'
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Is customer active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Created by user',
    example: 'admin'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 0,
    default: 0
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
