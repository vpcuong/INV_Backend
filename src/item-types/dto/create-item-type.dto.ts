import { ApiProperty } from '@nestjs/swagger';

export class CreateItemTypeDto {
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
  })
  name!: string;

  @ApiProperty({
    description: 'Item type description',
    example: 'Short sleeve t-shirt',
    required: false,
  })
  description?: string;
}
