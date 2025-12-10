import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material code (unique)',
    example: 'COTTON',
    maxLength: 20,
  })
  code!: string;

  @ApiProperty({
    description: 'Material description',
    example: 'Cotton fabric 100%',
    maxLength: 100,
  })
  desc!: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
    default: true,
  })
  status?: boolean;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
    required: false,
  })
  sortOrder?: number;

  @ApiProperty({
    description: 'Created by user',
    example: 'admin',
    required: false,
    maxLength: 50,
  })
  createdBy?: string;
}
