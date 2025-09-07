import { Injectable } from '@nestjs/common';
// External API and FormData imports removed as we're using Gemini only
import { GoogleGenAI } from '@google/genai';
import { OcrRequestDto } from './dto/nid-ocr-request.dto';
import { OcrFileType } from './enums/ocr-file-type.enum';
import {
  isRecord,
  getOptimizedSchemaForType,
  getOptimizedPromptForType,
  validateGenAIResponse,
  parseGeminiResponse,
  processGenAIResponse,
} from './ocr-helpers';
import { ImageOptimizer } from '../common/utils/image-optimizer';

@Injectable()
export class OcrService {
  private static readonly EMPTY_DETAILS: Record<string, unknown> = {};
  private readonly concurrentRequests = new Map<
    string,
    Promise<{ type: OcrFileType; details: Record<string, unknown> }>
  >();

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  // Removed isOcrResult as external API is not used

  private readonly genAI: GoogleGenAI;
  private readonly textModelName = 'gemini-2.5-flash-lite';
  constructor(private readonly imageOptimizer: ImageOptimizer) {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }
  private readonly genAIConfig = {
    temperature: 0,
    maxOutputTokens: 256,
    thinkingConfig: { thinkingBudget: 0 },
  } as const;

  private readonly pdfGenAIConfig = {
    temperature: 0,
    maxOutputTokens: 256,
    thinkingConfig: { thinkingBudget: 0 },
  } as const;

  // Streaming configs removed for faster response

  async extractOcrInfo(
    body: OcrRequestDto,
  ): Promise<{ type: OcrFileType; details: Record<string, unknown> }> {
    const { file, type } = body;
    try {
      if (!file) {
        return { type, details: { ...OcrService.EMPTY_DETAILS } };
      }

      // Create a simple request key for deduplication
      const requestKey = `${file.size}-${type}-${file.originalname}`;

      // Check if identical request is already processing
      if (this.concurrentRequests.has(requestKey)) {
        return await this.concurrentRequests.get(requestKey)!;
      }

      // Create promise for this request
      const requestPromise = this.processOcrRequest(file, type);
      this.concurrentRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up completed request
        this.concurrentRequests.delete(requestKey);
      }
    } catch {
      return { type, details: { ...OcrService.EMPTY_DETAILS } };
    }
  }

  private async processOcrRequest(
    file: Express.Multer.File,
    type: OcrFileType,
  ): Promise<{ type: OcrFileType; details: Record<string, unknown> }> {
    try {
      let genAIResponse: unknown = null;
      try {
        genAIResponse = await this.extractWithGenAI(file, type);
      } catch {
        genAIResponse = null;
      }
      if (genAIResponse && this.validateGenAIResponse(genAIResponse, type)) {
        const processed = processGenAIResponse(genAIResponse, type);
        return processed;
      }

      // Skip external API and return empty response on failure
      return { type, details: { ...OcrService.EMPTY_DETAILS } };
    } catch {
      return { type, details: { ...OcrService.EMPTY_DETAILS } };
    }
  }

  private async extractWithGenAI(
    file: Express.Multer.File,
    type: OcrFileType,
  ): Promise<{ type: OcrFileType; details: Record<string, unknown> } | null> {
    const optimizedFile = await this.imageOptimizer.optimizeForOCR(file);
    const base64Data = optimizedFile.buffer.toString('base64');
    const schema = getOptimizedSchemaForType(type);
    const prompt = getOptimizedPromptForType(optimizedFile.mimetype);
    const isPdf = optimizedFile.mimetype === 'application/pdf';

    // Skip streaming to reduce latency - direct API call only

    const config = isPdf ? this.pdfGenAIConfig : this.genAIConfig;
    const response = await this.genAI.models.generateContent({
      model: this.textModelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: optimizedFile.mimetype,
              },
            },
          ],
        },
      ],
      config: {
        ...config,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });
    return parseGeminiResponse(response) as {
      type: OcrFileType;
      details: Record<string, unknown>;
    } | null;
  }

  private validateGenAIResponse(
    response: unknown,
    type: OcrFileType,
  ): response is { details: Record<string, unknown> } {
    if (!isRecord(response) || !isRecord(response.details)) return false;
    return validateGenAIResponse(response, type);
  }
}
