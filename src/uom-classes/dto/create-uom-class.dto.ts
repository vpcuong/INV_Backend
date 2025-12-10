import { ApiProperty } from '@nestjs/swagger';

export class CreateUomClassDto {
  @ApiProperty({
    description: 'UOM class code (unique)',
    example: 'LENGTH',
    maxLength: 50,
  })
  code!: string;

  @ApiProperty({
    description: 'UOM class name',
    example: 'Length Units',
  })
  name!: string;

  @ApiProperty({
    description: 'Description',
    example: 'Units for measuring length/distance',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
    default: 0,
    required: false,
  })
  sortOrder?: number;
}
