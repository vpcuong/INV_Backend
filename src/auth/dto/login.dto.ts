import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User ID', example: 'phucuo.bmn' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  password!: string;
}
