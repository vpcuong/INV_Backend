import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColorDto {
  @ApiProperty({ description: 'Color code', example: 'RED' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Color description', example: 'Red' })
  @IsString()
  @IsNotEmpty()
  desc!: string;

  @ApiProperty({ description: 'Hex color value', required: false, example: '#FF0000' })
  @IsOptional()
  @IsString()
  hexValue?: string;

  @ApiProperty({ description: 'Sort order', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
