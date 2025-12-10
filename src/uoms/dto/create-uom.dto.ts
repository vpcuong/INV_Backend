import { ApiProperty } from '@nestjs/swagger';

export class CreateUomDto {
  @ApiProperty({
    description: 'UOM code (unique)',
    example: 'M',
    maxLength: 50,
  })
  code!: string;

  @ApiProperty({
    description: 'UOM name',
    example: 'Meter',
  })
  name!: string;

  @ApiProperty({
    description: 'Description',
    example: 'Standard unit for measuring length',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'UOM class ID',
    example: 1,
  })
  classId!: number;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
    default: 0,
    required: false,
  })
  sortOrder?: number;
}
