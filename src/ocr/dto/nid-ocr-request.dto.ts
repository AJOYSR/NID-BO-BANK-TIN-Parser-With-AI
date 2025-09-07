import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OcrFileType } from '../enums/ocr-file-type.enum';

export class OcrRequestDto {
  @ApiProperty({
    description: 'Document type',
    example: OcrFileType.NID,
    enum: OcrFileType,
  })
  @IsEnum(OcrFileType)
  @IsNotEmpty()
  type: OcrFileType;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image or PDF file',
  })
  file: Express.Multer.File;
}
