import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { ImageOptimizer } from '../common/utils/image-optimizer';

@Module({
  controllers: [OcrController],
  providers: [OcrService, ImageOptimizer],
})
export class OcrModule {}
