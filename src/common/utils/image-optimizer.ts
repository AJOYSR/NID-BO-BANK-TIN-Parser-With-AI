import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageOptimizer {
  private readonly maxWidth = 800;
  private readonly maxHeight = 800;
  private readonly jpegQuality = 75;
  private readonly pdfMaxSizeKB = 1000; // 1MB

  async optimizeForOCR(file: Express.Multer.File): Promise<{
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
    isOptimized: boolean;
  }> {
    try {
      if (this.isPdfFile(file)) {
        return this.optimizePdf(file);
      }

      if (this.shouldOptimizeImage(file)) {
        const optimizedBuffer = await sharp(file.buffer)
          .resize(this.maxWidth, this.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: this.jpegQuality,
            progressive: false,
            mozjpeg: true,
          })
          .toBuffer();

        return {
          buffer: optimizedBuffer,
          mimetype: 'image/jpeg',
          originalname: file.originalname,
          size: optimizedBuffer.length,
          isOptimized: true,
        };
      }

      return {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
        isOptimized: false,
      };
    } catch {
      // Remove unused 'error' variable to fix lint error
      return {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
        isOptimized: false,
      };
    }
  }

  private isPdfFile(file: Express.Multer.File): boolean {
    const isPdfMimeType = file.mimetype === 'application/pdf';
    const isPdfExtension = file.originalname?.toLowerCase().endsWith('.pdf');
    return isPdfMimeType || isPdfExtension;
  }

  // Remove 'async' since there is no 'await' inside, to fix lint error
  private optimizePdf(file: Express.Multer.File) {
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB <= this.pdfMaxSizeKB) {
      return {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
        isOptimized: false,
      };
    }
    return {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      isOptimized: false,
    };
  }

  private shouldOptimizeImage(file: Express.Multer.File): boolean {
    if (this.isPdfFile(file)) return false;
    const imageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];
    return imageTypes.includes(file.mimetype);
  }
}
