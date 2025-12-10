import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemTypeDto {
  @ApiProperty({
    description: 'Item type code (unique)',
    example: 'SHIRT',
    maxLength: 20,
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Item type name',
    example: 'T-Shirt',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Item type description',
    example: 'Short sleeve t-shirt',
    required: false,
  })
  description?: string;
}
