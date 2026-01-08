import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateItemTypeDto {
  @ApiProperty({
    description: 'Item type code (unique)',
    example: 'SHIRT',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiProperty({
    description: 'Item type description',
    example: 'Short sleeve t-shirt',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
