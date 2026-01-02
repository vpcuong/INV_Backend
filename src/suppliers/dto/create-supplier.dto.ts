import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Unique supplier code', example: 'SUP001' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Supplier name', example: 'ABC Textiles Co.' })
  @IsString()
  name!: string;

  // Thông tin liên hệ
  @ApiPropertyOptional({ description: 'Contact phone number', example: '+84123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@abctextiles.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://abctextiles.com' })
  @IsOptional()
  @IsString()
  website?: string;

  // Địa chỉ
  @ApiPropertyOptional({ description: 'Street address', example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Province/State', example: 'Ho Chi Minh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'Vietnam' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '700000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  // Thông tin kinh doanh
  @ApiPropertyOptional({ description: 'Tax identification number', example: '0123456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Contact person name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Payment terms', example: 'NET30' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  // Trạng thái & phân loại
  @ApiPropertyOptional({ description: 'Supplier status', example: 'Active', enum: ['Active', 'Inactive', 'Blacklist'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Supplier category', example: 'Fabric', enum: ['Fabric', 'Accessories', 'Packaging'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Is supplier active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
