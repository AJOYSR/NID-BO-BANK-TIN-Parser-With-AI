import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrRequestDto } from './dto/nid-ocr-request.dto';
import { OcrService } from './ocr.service';

@Controller('/api/ocr')
@ApiTags('OCR API')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post()
  @ApiOperation({ summary: 'Extract NID/BO/TIN/BANK info from image/pdf' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: OcrRequestDto })
  @UseInterceptors(FileInterceptor('file'))
  async extractOcrInfo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: OcrRequestDto,
  ): Promise<unknown> {
    return this.ocrService.extractOcrInfo({ file, type: body.type });
  }
}
