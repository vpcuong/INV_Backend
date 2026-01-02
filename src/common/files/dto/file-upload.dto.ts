import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
  file!: Express.Multer.File;

  @ApiProperty({ required: false, description: 'Folder to store the file' })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class MultipleFileUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files to upload'
  })
  files!: Express.Multer.File[];

  @ApiProperty({ required: false, description: 'Folder to store the files' })
  @IsOptional()
  @IsString()
  folder?: string;
}
